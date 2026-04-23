/**
 * Resolve the best downloadable PDF URL for a delibera.
 *
 * Strategy:
 * 1. If url_riferimento points to arera.it, try well-known pattern
 *    https://www.arera.it/fileadmin/allegati/docs/{YY}/{N}-{YYYY}-{T}-{S}.pdf
 *    derived from `numero` (eg. "568/2025/R/gas").
 * 2. If that fails, scrape the HTML page for the first .pdf href.
 * 3. Fallback to Energizzo `documento_url` (often 403, but try).
 */

const UA =
  "Mozilla/5.0 (compatible; IlDispaccioBot/1.0; +https://ildispaccio.energy)";

export async function resolveDeliberaPdfUrl(params: {
  numero: string;
  url_riferimento: string | null;
  documento_url: string | null;
}): Promise<string | null> {
  const { numero, url_riferimento, documento_url } = params;

  if (url_riferimento && /arera\.it/i.test(url_riferimento)) {
    const guess = buildAreraPdfUrl(numero);
    if (guess && (await headOk(guess))) return guess;

    const scraped = await scrapeFirstPdf(url_riferimento);
    if (scraped && (await headOk(scraped))) return scraped;
  }

  if (documento_url && (await headOk(documento_url))) return documento_url;
  return null;
}

function buildAreraPdfUrl(numero: string): string | null {
  // "568/2025/R/gas" → "568-2025-R-gas.pdf"
  const parts = numero.split("/");
  if (parts.length < 4) return null;
  const [n, yyyy, t, s] = parts;
  const yy = yyyy.slice(2);
  return `https://www.arera.it/fileadmin/allegati/docs/${yy}/${n}-${yyyy}-${t}-${s}.pdf`;
}

async function scrapeFirstPdf(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/href="([^"]+\.pdf)"/i);
    if (!m) return null;
    const href = m[1];
    if (href.startsWith("http")) return href;
    if (href.startsWith("//")) return `https:${href}`;
    const base = new URL(pageUrl);
    return new URL(href, `${base.protocol}//${base.host}`).toString();
  } catch {
    return null;
  }
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    return ct.includes("pdf");
  } catch {
    return false;
  }
}

export const PDF_FETCH_UA = UA;
