/**
 * ENTSO-E Transparency Platform API client.
 * Docs: https://transparency.entsoe.eu/content/static_content/Static%20content/web%20api/Guide.html
 *
 * Richiede token ENTSOE_TOKEN in env.
 * Endpoint base: https://web-api.tp.entsoe.eu/api
 * Day-ahead prices: documentType=A44, in_Domain=EIC, out_Domain=EIC
 */

const BASE = "https://web-api.tp.entsoe.eu/api";

// EIC codes ufficiali 7 zone bidding italiane
export const EIC_CODES: Record<string, string> = {
  "IT-North": "10Y1001A1001A73I",
  "IT-Centre-North": "10Y1001A1001A70O",
  "IT-Centre-South": "10Y1001A1001A71M",
  "IT-South": "10Y1001A1001A788",
  "IT-Sicily": "10Y1001A1001A75E",
  "IT-Sardinia": "10Y1001A1001A74G",
  "IT-Calabria": "10Y1001C--00096J",
};

export const ENTSOE_ZONES = Object.keys(EIC_CODES);

/**
 * Formatta data ISO YYYY-MM-DD in YYYYMMDDHHMM UTC per query ENTSO-E.
 * Italia è CEST (UTC+2) da marzo a ottobre, CET (UTC+1) altrimenti.
 * Italian day X va da day-1 22:00 UTC a day X 22:00 UTC (in CEST).
 */
function italianDayBoundsUtc(dayIso: string): { start: string; end: string } {
  const d = new Date(`${dayIso}T00:00:00+02:00`); // assumiamo CEST
  const startUtc = new Date(d.getTime());
  startUtc.setHours(startUtc.getUTCHours() - 0); // già in UTC grazie al +02:00

  const endUtc = new Date(startUtc.getTime() + 24 * 3600 * 1000);

  const fmt = (x: Date) =>
    x
      .toISOString()
      .replace(/[-:T]/g, "")
      .slice(0, 12); // YYYYMMDDHHMM

  return {
    start: fmt(startUtc),
    end: fmt(endUtc),
  };
}

async function fetchEntsoeXmlOnce(
  eic: string,
  dayIso: string,
): Promise<string | null> {
  const token = process.env.ENTSOE_TOKEN;
  if (!token) return null;
  const { start, end } = italianDayBoundsUtc(dayIso);
  const url = `${BASE}?securityToken=${token}&documentType=A44&in_Domain=${eic}&out_Domain=${eic}&periodStart=${start}&periodEnd=${end}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/xml", "user-agent": "ildispaccio/1.0" },
    });
    if (!res.ok) return null;
    return await res.text();
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchEntsoeXml(
  eic: string,
  dayIso: string,
): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const xml = await fetchEntsoeXmlOnce(eic, dayIso);
      if (xml) return xml;
    } catch {
      /* retry */
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
  }
  return null;
}

/**
 * Estrae tutti i <price.amount> dall'XML.
 * Funziona anche se il documento ha più Period (es. 2 giorni nella finestra).
 * Se ci sono più Period, prende il primo (day richiesto).
 */
export function parseEntsoeDayAheadPrices(xml: string): number[] {
  // Prima cerchiamo il primo <Period>...</Period> (giorno richiesto)
  const periodMatch = xml.match(/<Period>[\s\S]*?<\/Period>/);
  const scope = periodMatch ? periodMatch[0] : xml;
  const matches = scope.matchAll(/<price\.amount>([\d.]+)<\/price\.amount>/g);
  const out: number[] = [];
  for (const m of matches) {
    const v = Number(m[1]);
    if (!isNaN(v)) out.push(v);
  }
  return out;
}

/**
 * Media giornaliera €/MWh per una zona italiana nel giorno indicato.
 * Ritorna null se: token mancante, API down, nessun prezzo.
 */
export async function fetchEntsoeDayAheadForZone(
  zoneKey: string,
  dayIso: string,
): Promise<number | null> {
  const eic = EIC_CODES[zoneKey];
  if (!eic) return null;
  const xml = await fetchEntsoeXml(eic, dayIso);
  if (!xml) return null;
  const prices = parseEntsoeDayAheadPrices(xml);
  if (prices.length === 0) return null;
  return prices.reduce((a, b) => a + b, 0) / prices.length;
}
