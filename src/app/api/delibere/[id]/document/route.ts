import { NextResponse, type NextRequest } from "next/server";
import { getAdminMember } from "@/lib/admin/session";
import { getNetworkMember } from "@/lib/network/session";
import { createClient } from "@/lib/supabase/server";
import { resolveDeliberaPdfUrl, PDF_FETCH_UA } from "@/lib/delibere/resolve-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Proxy download del PDF di una delibera.
 * Lo storage Energizzo (/storage/...) restituisce 403, quindi risolviamo
 * il PDF su ARERA (pattern noto + scraping) e lo restreamiamo al client.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const [admin, member] = await Promise.all([
    getAdminMember(),
    getNetworkMember(),
  ]);
  if (!admin && !member) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const deliberaId = Number(id);
  if (!Number.isFinite(deliberaId)) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("numero, url_riferimento, documento_url")
    .eq("id", deliberaId)
    .maybeSingle();
  if (error || !data) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const pdfUrl = await resolveDeliberaPdfUrl({
    numero: data.numero,
    url_riferimento: data.url_riferimento,
    documento_url: data.documento_url,
  });

  if (!pdfUrl) {
    // Fallback: redirect alla pagina di riferimento (ARERA) dove l'utente può scaricare manualmente
    if (data.url_riferimento) {
      return NextResponse.redirect(data.url_riferimento, 302);
    }
    return NextResponse.json({ ok: false, error: "PDF not resolvable" }, { status: 404 });
  }

  const upstream = await fetch(pdfUrl, {
    headers: { "User-Agent": PDF_FETCH_UA, Accept: "application/pdf" },
    cache: "no-store",
  });
  if (!upstream.ok || !upstream.body) {
    return NextResponse.json(
      { ok: false, error: `upstream ${upstream.status}` },
      { status: 502 },
    );
  }

  const filename = sanitizeFilename(`delibera_${data.numero}.pdf`);
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Cache-Control", "private, max-age=3600");

  return new NextResponse(upstream.body, { status: 200, headers });
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 200);
}
