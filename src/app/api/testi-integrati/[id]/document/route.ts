import { NextResponse, type NextRequest } from "next/server";
import { getAdminMember } from "@/lib/admin/session";
import { getNetworkMember } from "@/lib/network/session";
import { createClient } from "@/lib/supabase/server";
import { PDF_FETCH_UA, isAllowedPdfUrl } from "@/lib/delibere/resolve-pdf";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const HTML_TIMEOUT_MS = 15_000;
const PDF_TIMEOUT_MS = 45_000;

/**
 * Proxy download PDF di un testo integrato.
 * Lo storage Energizzo è 403. Strategia:
 * 1. Scraping della pagina ARERA `url_riferimento` per primo link `.pdf`
 * 2. Fallback: redirect a url_riferimento (solo se su host whitelistato)
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
  const tiId = Number(id);
  if (!Number.isFinite(tiId)) {
    return NextResponse.json({ ok: false, error: "invalid id" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("testi_integrati_cache")
    .select("codice, url_riferimento, documento_url")
    .eq("id", tiId)
    .maybeSingle();
  if (error) {
    console.error(`ti document lookup failed ${tiId}:`, error);
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ ok: false, error: "not found" }, { status: 404 });
  }

  const pdfUrl = await resolveTiPdfUrl(data.url_riferimento);

  if (!pdfUrl) {
    if (data.url_riferimento && isAllowedPdfUrl(data.url_riferimento)) {
      return NextResponse.redirect(data.url_riferimento, 302);
    }
    return NextResponse.json({ ok: false, error: "PDF not resolvable" }, { status: 404 });
  }

  if (!isAllowedPdfUrl(pdfUrl)) {
    return NextResponse.json({ ok: false, error: "PDF url not allowed" }, { status: 403 });
  }

  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), PDF_TIMEOUT_MS);
  let upstream: Response;
  try {
    upstream = await fetch(pdfUrl, {
      headers: { "User-Agent": PDF_FETCH_UA, Accept: "application/pdf" },
      cache: "no-store",
      signal: ctrl.signal,
    });
  } catch (e) {
    console.error("ti pdf upstream failed", e);
    return NextResponse.json({ ok: false, error: "upstream unreachable" }, { status: 502 });
  } finally {
    clearTimeout(to);
  }
  if (!upstream.ok || !upstream.body) {
    if (data.url_riferimento && isAllowedPdfUrl(data.url_riferimento)) {
      return NextResponse.redirect(data.url_riferimento, 302);
    }
    return NextResponse.json(
      { ok: false, error: `upstream ${upstream.status}` },
      { status: 502 },
    );
  }

  const filename = sanitizeFilename(`testo_integrato_${data.codice}.pdf`);
  const headers = new Headers();
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `attachment; filename="${filename}"`);
  const len = upstream.headers.get("content-length");
  if (len) headers.set("Content-Length", len);
  headers.set("Cache-Control", "private, max-age=3600");

  return new NextResponse(upstream.body, { status: 200, headers });
}

async function resolveTiPdfUrl(pageUrl: string | null): Promise<string | null> {
  if (!pageUrl || !isAllowedPdfUrl(pageUrl)) return null;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), HTML_TIMEOUT_MS);
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": PDF_FETCH_UA },
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/href="([^"]+\.pdf)"/i);
    if (!m) return null;
    const href = m[1];
    let abs = href;
    if (href.startsWith("//")) abs = `https:${href}`;
    else if (href.startsWith("/")) {
      const base = new URL(pageUrl);
      abs = `${base.protocol}//${base.host}${href}`;
    } else if (!/^https?:/i.test(href)) {
      const base = new URL(pageUrl);
      abs = new URL(href, `${base.protocol}//${base.host}`).toString();
    }
    if (!isAllowedPdfUrl(abs)) return null;
    const hCtrl = new AbortController();
    const hTo = setTimeout(() => hCtrl.abort(), HTML_TIMEOUT_MS);
    try {
      const head = await fetch(abs, {
        method: "HEAD",
        headers: { "User-Agent": PDF_FETCH_UA },
        signal: hCtrl.signal,
      });
      if (!head.ok) return null;
      const ct = head.headers.get("content-type") ?? "";
      return ct.includes("pdf") ? abs : null;
    } finally {
      clearTimeout(hTo);
    }
  } catch (e) {
    console.error("ti pdf scrape failed:", e);
    return null;
  } finally {
    clearTimeout(to);
  }
}

function sanitizeFilename(name: string): string {
  return name.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 200);
}
