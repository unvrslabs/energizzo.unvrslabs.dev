/**
 * Fetcher ENTSO-E Transparency Platform per indicatori oltre al PUN.
 *
 * A75 generation_mix         - Actual generation per fuel type (B04 gas, B16 solar, B19 wind, B11 hydro, B25 storage, ...)
 * A65 load_forecast          - Day-ahead total load forecast
 * A69 renewable_forecast     - Wind + Solar forecast day-ahead
 * A11 cross_border_flows     - Physical flows scheduled on tie lines
 * A80 unavailability         - skipped (zip response, TODO)
 *
 * Domain Italy bidding zones - usiamo IT-North come proxy dove richiesto
 * (rappresenta ~47% del carico nazionale; per MVP basta).
 */

const BASE = "https://web-api.tp.entsoe.eu/api";

const IT_NORTH = "10Y1001A1001A73I";
const IT_CNORTH = "10Y1001A1001A70O";
const IT_CSUD = "10Y1001A1001A71M";
const IT_SUD = "10Y1001A1001A788";
const IT_SICILY = "10Y1001A1001A75E";
const IT_SARDINIA = "10Y1001A1001A74G";
const IT_CALABRIA = "10Y1001C--00096J";
const FR = "10YFR-RTE------C";
const CH = "10YCH-SWISSGRIDZ";
const AT = "10YAT-APG------L";
const SI = "10YSI-ELES-----O";

const IT_ZONES: Array<{ code: string; key: string; weight: number }> = [
  { code: IT_NORTH, key: "IT-North", weight: 0.47 },
  { code: IT_CNORTH, key: "IT-Centre-North", weight: 0.11 },
  { code: IT_CSUD, key: "IT-Centre-South", weight: 0.13 },
  { code: IT_SUD, key: "IT-South", weight: 0.14 },
  { code: IT_SICILY, key: "IT-Sicily", weight: 0.06 },
  { code: IT_SARDINIA, key: "IT-Sardinia", weight: 0.04 },
  { code: IT_CALABRIA, key: "IT-Calabria", weight: 0.05 },
];

// ─── PSR type → etichette italiane ─────────────────────────

export const PSR_LABELS: Record<string, string> = {
  B01: "Biomassa",
  B02: "Lignite",
  B04: "Gas fossile",
  B05: "Carbone",
  B06: "Olio combustibile",
  B09: "Geotermico",
  B10: "Idro pompaggio",
  B11: "Idro fluente",
  B12: "Idro bacino",
  B14: "Nucleare",
  B15: "Altre rinnovabili",
  B16: "Solare",
  B17: "Rifiuti",
  B18: "Eolico offshore",
  B19: "Eolico onshore",
  B20: "Altro",
  B25: "Accumulo",
};

export const RENEWABLE_PSR = ["B01", "B09", "B11", "B12", "B15", "B16", "B18", "B19"];
export const FOSSIL_PSR = ["B02", "B04", "B05", "B06", "B17"];

// ─── Utils ──────────────────────────────────────────────────

function italianDayBoundsUtc(dayIso: string): { start: string; end: string } {
  // CEST (aprile-ottobre): day IT va da (day-1) 22:00 UTC a day 22:00 UTC
  const d = new Date(`${dayIso}T00:00:00+02:00`);
  const startUtc = d;
  const endUtc = new Date(startUtc.getTime() + 24 * 3600 * 1000);
  const fmt = (x: Date) =>
    x.toISOString().replace(/[-:T]/g, "").slice(0, 12);
  return { start: fmt(startUtc), end: fmt(endUtc) };
}

async function fetchEntsoeXmlOnce(params: string): Promise<string | null> {
  const token = process.env.ENTSOE_TOKEN;
  if (!token) return null;
  const url = `${BASE}?securityToken=${token}&${params}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 25000);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/xml", "user-agent": "ildispaccio/1.0" },
    });
    if (!res.ok) return null;
    const text = await res.text();
    // Se è zip binary, ritorna null (A80 non supportato)
    if (text.startsWith("PK")) return null;
    return text;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchEntsoeXml(params: string): Promise<string | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const xml = await fetchEntsoeXmlOnce(params);
      if (xml) return xml;
    } catch {
      /* retry */
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 700));
  }
  return null;
}

/** Estrae tutti i <quantity>X</quantity> dal primo <Period>...</Period>. */
function parseQuantities(xml: string): number[] {
  const m = xml.match(/<Period>[\s\S]*?<\/Period>/);
  const scope = m ? m[0] : xml;
  const out: number[] = [];
  for (const match of scope.matchAll(/<quantity>([\d.]+)<\/quantity>/g)) {
    const v = Number(match[1]);
    if (!isNaN(v)) out.push(v);
  }
  return out;
}

/** Divide XML in TimeSeries (una per psrType/direzione/ecc). */
function splitTimeSeries(xml: string): string[] {
  const out: string[] = [];
  for (const match of xml.matchAll(/<TimeSeries>[\s\S]*?<\/TimeSeries>/g)) {
    out.push(match[0]);
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// ═══════════════════════════════════════════════════════════════
// A75 - Generation mix per psrType
// Ritorna MWh per fuel type aggregati sul giorno (somma oraria)
// ═══════════════════════════════════════════════════════════════

export type GenerationMixResult = {
  reference_day: string;
  by_type_mwh: Record<string, number>; // B04 → MWh totali giorno
  total_mwh: number;
  renewable_pct: number;
  fossil_pct: number;
  other_pct: number;
  top_source: { psr: string; label: string; share_pct: number };
};

export async function fetchGenerationMix(
  dayIso: string,
): Promise<GenerationMixResult | null> {
  // A75 processType=A16 (Realised) per domain IT-North come proxy
  const { start, end } = italianDayBoundsUtc(dayIso);
  const params = `documentType=A75&processType=A16&in_Domain=${IT_NORTH}&periodStart=${start}&periodEnd=${end}`;
  const xml = await fetchEntsoeXml(params);
  if (!xml) return null;

  const byType: Record<string, number> = {};
  const tsList = splitTimeSeries(xml);
  for (const ts of tsList) {
    const psrMatch = ts.match(/<psrType>(B\d+)<\/psrType>/);
    if (!psrMatch) continue;
    const psr = psrMatch[1];
    const qs = parseQuantities(ts);
    if (qs.length === 0) continue;
    // MWh totali = somma di quantity (assumendo risoluzione 1h — ENTSO-E spesso PT60M per A75)
    const sumMwh = qs.reduce((a, b) => a + b, 0);
    byType[psr] = (byType[psr] ?? 0) + sumMwh;
  }

  const total = Object.values(byType).reduce((a, b) => a + b, 0);
  if (total === 0) return null;

  const renewable = RENEWABLE_PSR.reduce((s, p) => s + (byType[p] ?? 0), 0);
  const fossil = FOSSIL_PSR.reduce((s, p) => s + (byType[p] ?? 0), 0);
  const other = total - renewable - fossil;

  const sorted = Object.entries(byType).sort((a, b) => b[1] - a[1]);
  const top = sorted[0];

  return {
    reference_day: dayIso,
    by_type_mwh: byType,
    total_mwh: Math.round(total),
    renewable_pct: Number(((renewable / total) * 100).toFixed(1)),
    fossil_pct: Number(((fossil / total) * 100).toFixed(1)),
    other_pct: Number(((other / total) * 100).toFixed(1)),
    top_source: {
      psr: top[0],
      label: PSR_LABELS[top[0]] ?? top[0],
      share_pct: Number(((top[1] / total) * 100).toFixed(1)),
    },
  };
}

// ═══════════════════════════════════════════════════════════════
// A65 - Load forecast day-ahead
// Sum di tutte le 7 zone italiane per avere total IT load
// ═══════════════════════════════════════════════════════════════

export type LoadForecastResult = {
  reference_day: string;
  hourly_mw: number[]; // 24 valori (medie orarie, o 96 se PT15M)
  peak_mw: number;
  peak_hour: number;
  min_mw: number;
  min_hour: number;
  avg_mw: number;
  total_mwh: number;
};

async function fetchLoadForecastZone(
  eic: string,
  dayIso: string,
): Promise<number[] | null> {
  const { start, end } = italianDayBoundsUtc(dayIso);
  const params = `documentType=A65&processType=A01&outBiddingZone_Domain=${eic}&periodStart=${start}&periodEnd=${end}`;
  const xml = await fetchEntsoeXml(params);
  if (!xml) return null;
  const qs = parseQuantities(xml);
  if (qs.length === 0) return null;
  return qs;
}

export async function fetchLoadForecast(
  dayIso: string,
): Promise<LoadForecastResult | null> {
  // Somma delle 7 zone per load totale IT
  const perZone: number[][] = [];
  for (const z of IT_ZONES) {
    const vals = await fetchLoadForecastZone(z.code, dayIso);
    if (vals && vals.length > 0) perZone.push(vals);
    await sleep(100);
  }
  if (perZone.length === 0) return null;

  // Allinea alla minima lunghezza (robusto se ENTSO-E mischia PT15M e PT60M)
  const minLen = Math.min(...perZone.map((v) => v.length));
  const hourly: number[] = [];
  for (let i = 0; i < minLen; i++) {
    hourly.push(perZone.reduce((s, v) => s + v[i], 0));
  }

  if (hourly.length === 0) return null;

  // Normalizza a 24h: se PT15M (96 valori), rimedio a 24 accorpando 4 quarti
  let series = hourly;
  if (hourly.length >= 90) {
    const grouped: number[] = [];
    for (let i = 0; i < 24; i++) {
      const slice = hourly.slice(i * 4, i * 4 + 4);
      grouped.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
    series = grouped;
  }

  const peak = Math.max(...series);
  const peakIdx = series.indexOf(peak);
  const min = Math.min(...series);
  const minIdx = series.indexOf(min);
  const avg = series.reduce((a, b) => a + b, 0) / series.length;
  const totalMwh = series.reduce((a, b) => a + b, 0);

  return {
    reference_day: dayIso,
    hourly_mw: series.map((v) => Math.round(v)),
    peak_mw: Math.round(peak),
    peak_hour: peakIdx,
    min_mw: Math.round(min),
    min_hour: minIdx,
    avg_mw: Math.round(avg),
    total_mwh: Math.round(totalMwh),
  };
}

// ═══════════════════════════════════════════════════════════════
// A69 - Renewable forecast (wind + solar) day-ahead
// ═══════════════════════════════════════════════════════════════

export type RenewableForecastResult = {
  reference_day: string;
  solar_hourly_mw: number[];
  wind_hourly_mw: number[];
  solar_peak_mw: number;
  wind_peak_mw: number;
  solar_total_mwh: number;
  wind_total_mwh: number;
  combined_total_mwh: number;
};

async function fetchRenewableForecastZone(
  eic: string,
  dayIso: string,
): Promise<{ solar: number[]; wind: number[] } | null> {
  const { start, end } = italianDayBoundsUtc(dayIso);
  const params = `documentType=A69&processType=A01&in_Domain=${eic}&periodStart=${start}&periodEnd=${end}`;
  const xml = await fetchEntsoeXml(params);
  if (!xml) return null;

  const solar: number[] = [];
  const wind: number[] = [];
  for (const ts of splitTimeSeries(xml)) {
    const psrMatch = ts.match(/<psrType>(B\d+)<\/psrType>/);
    if (!psrMatch) continue;
    const qs = parseQuantities(ts);
    if (psrMatch[1] === "B16") solar.push(...qs);
    if (psrMatch[1] === "B19" || psrMatch[1] === "B18") wind.push(...qs);
  }
  return { solar, wind };
}

export async function fetchRenewableForecast(
  dayIso: string,
): Promise<RenewableForecastResult | null> {
  const perZoneSolar: number[][] = [];
  const perZoneWind: number[][] = [];
  for (const z of IT_ZONES) {
    const r = await fetchRenewableForecastZone(z.code, dayIso);
    if (r) {
      if (r.solar.length) perZoneSolar.push(r.solar);
      if (r.wind.length) perZoneWind.push(r.wind);
    }
    await sleep(100);
  }

  const sumSeries = (arr: number[][]) => {
    if (arr.length === 0) return [];
    const minLen = Math.min(...arr.map((v) => v.length));
    const out: number[] = [];
    for (let i = 0; i < minLen; i++) out.push(arr.reduce((s, v) => s + v[i], 0));
    return out;
  };

  const normalize24 = (series: number[]) => {
    if (series.length < 90) return series; // PT60M already
    const grouped: number[] = [];
    for (let i = 0; i < 24; i++) {
      const slice = series.slice(i * 4, i * 4 + 4);
      grouped.push(slice.reduce((a, b) => a + b, 0) / slice.length);
    }
    return grouped;
  };

  const solar = normalize24(sumSeries(perZoneSolar)).map(Math.round);
  const wind = normalize24(sumSeries(perZoneWind)).map(Math.round);

  if (solar.length === 0 && wind.length === 0) return null;

  return {
    reference_day: dayIso,
    solar_hourly_mw: solar,
    wind_hourly_mw: wind,
    solar_peak_mw: solar.length ? Math.max(...solar) : 0,
    wind_peak_mw: wind.length ? Math.max(...wind) : 0,
    solar_total_mwh: solar.reduce((a, b) => a + b, 0),
    wind_total_mwh: wind.reduce((a, b) => a + b, 0),
    combined_total_mwh:
      solar.reduce((a, b) => a + b, 0) + wind.reduce((a, b) => a + b, 0),
  };
}

// ═══════════════════════════════════════════════════════════════
// A11 - Cross-border physical flows (scheduled)
// Flow IT ↔ FR / CH / AT / SI. Net import = positive se Italia riceve.
// ═══════════════════════════════════════════════════════════════

export type CrossBorderResult = {
  reference_day: string;
  borders: Array<{
    country: string;
    country_label: string;
    import_mwh: number; // flow IN (country → IT)
    export_mwh: number; // flow OUT (IT → country)
    net_mwh: number; // import - export, positivo = net import
  }>;
  total_net_import_mwh: number;
};

async function fetchBorderFlow(
  fromEic: string,
  toEic: string,
  dayIso: string,
): Promise<number> {
  const { start, end } = italianDayBoundsUtc(dayIso);
  const params = `documentType=A11&in_Domain=${toEic}&out_Domain=${fromEic}&periodStart=${start}&periodEnd=${end}`;
  const xml = await fetchEntsoeXml(params);
  if (!xml) return 0;
  const qs = parseQuantities(xml);
  return qs.reduce((a, b) => a + b, 0);
}

export async function fetchCrossBorderFlows(
  dayIso: string,
): Promise<CrossBorderResult | null> {
  // Per semplicità MVP, consideriamo i flows su IT-North (zona di frontiera EU)
  const neighbors: Array<{ eic: string; country: string; label: string }> = [
    { eic: FR, country: "FR", label: "Francia" },
    { eic: CH, country: "CH", label: "Svizzera" },
    { eic: AT, country: "AT", label: "Austria" },
    { eic: SI, country: "SI", label: "Slovenia" },
  ];

  const borders: CrossBorderResult["borders"] = [];
  for (const n of neighbors) {
    const importMwh = await fetchBorderFlow(n.eic, IT_NORTH, dayIso);
    await sleep(120);
    const exportMwh = await fetchBorderFlow(IT_NORTH, n.eic, dayIso);
    await sleep(120);
    borders.push({
      country: n.country,
      country_label: n.label,
      import_mwh: Math.round(importMwh),
      export_mwh: Math.round(exportMwh),
      net_mwh: Math.round(importMwh - exportMwh),
    });
  }

  const totalNet = borders.reduce((s, b) => s + b.net_mwh, 0);
  if (borders.every((b) => b.import_mwh === 0 && b.export_mwh === 0)) return null;

  return {
    reference_day: dayIso,
    borders,
    total_net_import_mwh: Math.round(totalNet),
  };
}
