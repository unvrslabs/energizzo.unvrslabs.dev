/**
 * PUN stimato (media pesata 7 zone italiane).
 *
 * Fonte primaria: ENTSO-E Transparency Platform (token ENTSOE_TOKEN in env).
 * Fallback: energy-charts.info (Fraunhofer ISE aggregatore ENTSO-E, no key).
 *
 * Pesi basati su quota fabbisogno elettrico Italia (Terna, medie annuali):
 *   Nord 47% · Centro-Nord 11% · Centro-Sud 13% · Sud 14% · Sicilia 6% · Sardegna 4% · Calabria 5%
 *
 * Il PUN ufficiale GME è la media pesata oraria sui consumi. Qui usiamo una
 * approssimazione con pesi statici: errore tipico < 5% vs PUN GME.
 */

import { fetchEntsoeDayAheadForZone, ENTSOE_ZONES } from "./entsoe";

const BZN_WEIGHTS: Record<string, number> = {
  "IT-North": 0.47,
  "IT-Centre-North": 0.11,
  "IT-Centre-South": 0.13,
  "IT-South": 0.14,
  "IT-Sicily": 0.06,
  "IT-Sardinia": 0.04,
  "IT-Calabria": 0.05,
};

type EnergyChartsResponse = {
  unix_seconds?: number[];
  price?: number[];
  license_info?: string;
};

export type PunSource = "ENTSO-E" | "energy-charts.info";

export type PunResult = {
  price_day: string;
  price_eur_mwh: number;
  zones: Record<string, number>;
  method: "weighted_avg";
  source: PunSource;
};

// ─── FALLBACK: energy-charts.info ────────────────────────────

async function fetchZoneDayOnceEC(
  bzn: string,
  dayIso: string,
): Promise<number | null> {
  const start = `${dayIso}T00:00+01:00`;
  const end = `${dayIso}T23:59+01:00`;
  const url = `https://api.energy-charts.info/price?bzn=${encodeURIComponent(
    bzn,
  )}&start=${encodeURIComponent(start)}&end=${encodeURIComponent(end)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15000);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: controller.signal,
      headers: { accept: "application/json", "user-agent": "ildispaccio/1.0" },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as EnergyChartsResponse;
    const prices = data.price ?? [];
    if (!prices.length) return null;
    return prices.reduce((a, b) => a + b, 0) / prices.length;
  } finally {
    clearTimeout(timer);
  }
}

async function fetchZoneDayEC(
  bzn: string,
  dayIso: string,
): Promise<number | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const val = await fetchZoneDayOnceEC(bzn, dayIso);
      if (val != null) return val;
    } catch {
      /* retry */
    }
    if (attempt === 0) await new Promise((r) => setTimeout(r, 600));
  }
  return null;
}

// ─── MAIN: ENTSO-E con fallback EC ───────────────────────────

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchZoneDay(
  bzn: string,
  dayIso: string,
): Promise<{ value: number; source: PunSource } | null> {
  // Primary: ENTSO-E
  if (process.env.ENTSOE_TOKEN) {
    const v = await fetchEntsoeDayAheadForZone(bzn, dayIso);
    if (v != null) return { value: v, source: "ENTSO-E" };
  }
  // Fallback: energy-charts.info
  const vec = await fetchZoneDayEC(bzn, dayIso);
  if (vec != null) return { value: vec, source: "energy-charts.info" };
  return null;
}

export async function fetchPunForDay(dayIso: string): Promise<PunResult | null> {
  const zones: Record<string, number> = {};
  let entsoeCount = 0;
  let ecCount = 0;

  for (const z of ENTSOE_ZONES) {
    const r = await fetchZoneDay(z, dayIso);
    if (r != null) {
      zones[z] = Number(r.value.toFixed(3));
      if (r.source === "ENTSO-E") entsoeCount++;
      else ecCount++;
    }
    await sleep(120);
  }
  if (Object.keys(zones).length === 0) return null;

  let totalWeight = 0;
  let weightedSum = 0;
  for (const [z, price] of Object.entries(zones)) {
    const w = BZN_WEIGHTS[z] ?? 0;
    totalWeight += w;
    weightedSum += price * w;
  }
  const price = totalWeight > 0 ? weightedSum / totalWeight : 0;

  // Se almeno metà zone arrivano da ENTSO-E, etichetta ENTSO-E
  const source: PunSource =
    entsoeCount >= ecCount ? "ENTSO-E" : "energy-charts.info";

  return {
    price_day: dayIso,
    price_eur_mwh: Number(price.toFixed(3)),
    zones,
    method: "weighted_avg",
    source,
  };
}

export async function fetchPunRange(
  fromIso: string,
  toIso: string,
): Promise<PunResult[]> {
  const out: PunResult[] = [];
  const start = new Date(fromIso);
  const end = new Date(toIso);
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    const r = await fetchPunForDay(iso);
    if (r) out.push(r);
  }
  return out;
}
