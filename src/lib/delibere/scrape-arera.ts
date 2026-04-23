/**
 * Scrape real publication date from ARERA detail page.
 *
 * Example page contains:
 *   Data pubblicazione: 31 luglio 2025
 * We extract and convert to ISO timestamp.
 */

const UA =
  "Mozilla/5.0 (compatible; IlDispaccioBot/1.0; +https://ildispaccio.energy)";

const MONTHS_IT: Record<string, number> = {
  gennaio: 0,
  febbraio: 1,
  marzo: 2,
  aprile: 3,
  maggio: 4,
  giugno: 5,
  luglio: 6,
  agosto: 7,
  settembre: 8,
  ottobre: 9,
  novembre: 10,
  dicembre: 11,
};

export async function scrapeAreraPublicationDate(
  pageUrl: string,
): Promise<Date | null> {
  try {
    const res = await fetch(pageUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const html = await res.text();
    return parseAreraPublicationDate(html);
  } catch {
    return null;
  }
}

export function parseAreraPublicationDate(html: string): Date | null {
  const m = html.match(
    /Data\s+pubblicazione[^<]*?:\s*(\d{1,2})\s+(gennaio|febbraio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s+(\d{4})/i,
  );
  if (!m) return null;
  const day = parseInt(m[1], 10);
  const month = MONTHS_IT[m[2].toLowerCase()];
  const year = parseInt(m[3], 10);
  if (isNaN(day) || month === undefined || isNaN(year)) return null;
  const d = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return isNaN(d.getTime()) ? null : d;
}
