import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminMember } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const BUCKET = "lead-documents";

export async function GET(
  req: NextRequest,
  ctx: { params: Promise<{ id: string; docId: string }> },
) {
  const admin = await getAdminMember();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id, docId } = await ctx.params;
  if (!UUID_REGEX.test(id) || !UUID_REGEX.test(docId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: doc } = await supabase
    .from("lead_documents")
    .select("file_path, file_name")
    .eq("id", docId)
    .eq("lead_id", id)
    .maybeSingle();

  if (!doc) return NextResponse.json({ ok: false }, { status: 404 });

  const mode = req.nextUrl.searchParams.get("mode") === "download" ? "download" : "view";
  const options = mode === "download" ? { download: doc.file_name } : undefined;

  const { data: signed, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.file_path, 120, options);

  if (error || !signed) {
    return NextResponse.json(
      { ok: false, error: error?.message ?? "Errore" },
      { status: 500 },
    );
  }

  const wantRedirect = req.nextUrl.searchParams.get("redirect") === "1";
  if (wantRedirect) {
    return NextResponse.redirect(signed.signedUrl);
  }
  return NextResponse.json({ ok: true, url: signed.signedUrl });
}

export async function DELETE(
  _req: NextRequest,
  ctx: { params: Promise<{ id: string; docId: string }> },
) {
  const admin = await getAdminMember();
  if (!admin) return NextResponse.json({ ok: false }, { status: 401 });

  const { id, docId } = await ctx.params;
  if (!UUID_REGEX.test(id) || !UUID_REGEX.test(docId)) {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const supabase = createAdminClient();
  const { data: doc } = await supabase
    .from("lead_documents")
    .select("file_path")
    .eq("id", docId)
    .eq("lead_id", id)
    .maybeSingle();

  if (!doc) return NextResponse.json({ ok: false }, { status: 404 });

  await supabase.storage.from(BUCKET).remove([doc.file_path]);
  const { error } = await supabase
    .from("lead_documents")
    .delete()
    .eq("id", docId);
  if (error) {
    return NextResponse.json(
      { ok: false, error: error.message },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
