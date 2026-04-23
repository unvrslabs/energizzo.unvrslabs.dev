/**
 * Resolve the best downloadable PDF URL for a delibera.
 *
 * Strategy:
 * 1. If url_riferimento points to arera.it, try well-known pattern
 *    https://www.arera.it/fileadmin/allegati/docs/{YY}/{N}-{YYYY}-{T}-{S}.pdf
 *    derived from `numero` (eg. "568/2025/R/gas").
 * 2. If that fails, scrape the HTML page for the first .pdf href che contiene
 *    i segmenti del numero delibera (anti-random-link).
 * 3. Fallback to Energizzo `documento_url` (spesso 403, ma tentiamo).
 *
 * Tutte le fetch sono ristrette a host whitelisted (anti-SSRF).
 */

const UA =
  "Mozilla/5.0 (compatible; IlDispaccioBot/1.0; +https://ildispaccio.energy)";

const FETCH_TIMEOUT_MS = 15_000;

const ALLOWED_HOSTS = new Set([
  "www.arera.it",
  "arera.it",
  "www.autorita.energia.it",
  "autorita.energia.it",
  "energizzo.it",
  "www.energizzo.it",
]);

export function isAllowedPdfUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return ALLOWED_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export async function resolveDeliberaPdfUrl(params: {
  numero: string | null;
  url_riferimento: string | null;
  documento_url: string | null;
}): Promise<string | null> {
  const { numero, url_riferimento, documento_url } = params;

  if (url_riferimento && /arera\.it/i.test(url_riferimento) && isAllowedPdfUrl(url_riferimento)) {
    if (numero) {
      const guess = buildAreraPdfUrl(numero);
      if (guess && (await headOk(guess))) return guess;
    }

    const scraped = await scrapeFirstPdf(url_riferimento, numero);
    if (scraped && (await headOk(scraped))) return scraped;
  }

  if (documento_url && isAllowedPdfUrl(documento_url) && (await headOk(documento_url))) {
    return documento_url;
  }
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

async function scrapeFirstPdf(pageUrl: string, numero: string | null): Promise<string | null> {
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(pageUrl, {
      headers: { "User-Agent": UA },
      signal: ctrl.signal,
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Cerca TUTTI i PDF; preferisci quelli che contengono i segmenti del numero
    // (es. "568-2025"), evita il primo PDF random (guida utente, cookie policy, ecc.)
    const matches = Array.from(html.matchAll(/href="([^"]+\.pdf)"/gi)).map((m) => m[1]);
    if (matches.length === 0) return null;

    const parts = numero ? numero.split("/") : [];
    const key = parts.length >= 2 ? `${parts[0]}-${parts[1]}` : null;

    const preferred = key ? matches.find((h) => h.includes(key)) : null;
    const chosen = preferred ?? matches[0];

    let absolute: string;
    if (chosen.startsWith("http")) absolute = chosen;
    else if (chosen.startsWith("//")) absolute = `https:${chosen}`;
    else {
      const base = new URL(pageUrl);
      absolute = new URL(chosen, `${base.protocol}//${base.host}`).toString();
    }
    if (!isAllowedPdfUrl(absolute)) return null;
    return absolute;
  } catch (e) {
    console.error("scrapeFirstPdf failed:", e);
    return null;
  } finally {
    clearTimeout(to);
  }
}

async function headOk(url: string): Promise<boolean> {
  if (!isAllowedPdfUrl(url)) return false;
  const ctrl = new AbortController();
  const to = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      method: "HEAD",
      headers: { "User-Agent": UA },
      signal: ctrl.signal,
    });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    return ct.includes("pdf");
  } catch {
    return false;
  } finally {
    clearTimeout(to);
  }
}

export const PDF_FETCH_UA = UA;
