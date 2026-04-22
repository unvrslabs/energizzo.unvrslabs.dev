import { NextResponse, type NextRequest } from "next/server";
import { randomBytes } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminMember } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = "lead-documents";
const MAX_BYTES = 25 * 1024 * 1024;

const ALLOWED_TAGS = new Set([
  "contratto_da_firmare",
  "contratto_firmato",
  "proposta",
  "documento_identita",
  "verbale",
  "altro",
]);

function safeFilename(name: string): string {
  return name
    .normalize("NFKD")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80) || "file";
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminMember();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await ctx.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ ok: false, error: "id invalido" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("lead_documents")
    .select("id, file_name, file_size, mime_type, tag, uploaded_by_name, created_at")
    .eq("lead_id", id)
    .order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, documents: data ?? [] });
}

export async function POST(
  req: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminMember();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id } = await ctx.params;
  if (!UUID_REGEX.test(id)) {
    return NextResponse.json({ ok: false, error: "id invalido" }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get("file");
  const tagRaw = form.get("tag");
  if (!(file instanceof File)) {
    return NextResponse.json(
      { ok: false, error: "File mancante" },
      { status: 400 },
    );
  }
  if (file.size === 0) {
    return NextResponse.json(
      { ok: false, error: "File vuoto" },
      { status: 400 },
    );
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { ok: false, error: `File troppo grande (max ${Math.round(MAX_BYTES / 1024 / 1024)}MB)` },
      { status: 413 },
    );
  }

  const tag =
    typeof tagRaw === "string" && ALLOWED_TAGS.has(tagRaw) ? tagRaw : null;

  const supabase = createAdminClient();

  const { data: lead } = await supabase
    .from("leads")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  if (!lead) {
    return NextResponse.json(
      { ok: false, error: "Lead non trovato" },
      { status: 404 },
    );
  }

  const suffix = randomBytes(4).toString("hex");
  const stamp = Date.now();
  const path = `${id}/${stamp}-${suffix}-${safeFilename(file.name)}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: uploadErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });
  if (uploadErr) {
    console.error("lead document upload failed", uploadErr);
    return NextResponse.json(
      { ok: false, error: "Upload fallito. Riprova." },
      { status: 500 },
    );
  }

  const { data: inserted, error: insertErr } = await supabase
    .from("lead_documents")
    .insert({
      lead_id: id,
      file_path: path,
      file_name: file.name,
      file_size: file.size,
      mime_type: file.type || null,
      tag,
      uploaded_by: admin.id,
      uploaded_by_name: admin.nome,
    })
    .select("id, file_name, file_size, mime_type, tag, uploaded_by_name, created_at")
    .maybeSingle();

  if (insertErr || !inserted) {
    await supabase.storage.from(BUCKET).remove([path]);
    return NextResponse.json(
      { ok: false, error: insertErr?.message ?? "Errore registrazione" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, document: inserted });
}
