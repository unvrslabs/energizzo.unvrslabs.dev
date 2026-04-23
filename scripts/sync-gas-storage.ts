/**
 * Sync AGSI+ gas storage Italia su Supabase market_gas_storage.
 *
 * Usage:
 *   npx tsx scripts/sync-gas-storage.ts           # ultimi 7 giorni
 *   npx tsx scripts/sync-gas-storage.ts --days 90
 *   npx tsx scripts/sync-gas-storage.ts --backfill  # 1 anno
 */

import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = resolve(process.cwd(), ".env.local");
if (existsSync(envPath)) {
  const envRaw = readFileSync(envPath, "utf8");
  for (const line of envRaw.split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (!m) continue;
    if (!process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const AGSI_KEY = process.env.AGSI_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE || !AGSI_KEY) {
  console.error("Missing env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, AGSI_API_KEY");
  process.exit(1);
}

type AgsiPoint = {
  code?: string;
  updatedAt?: string;
  gasDayStart?: string;
  gasDayEnd?: string;
  gasInStorage?: string;
  consumption?: string;
  consumptionFull?: string;
  injection?: string;
  withdrawal?: string;
  netWithdrawal?: string;
  workingGasVolume?: string;
  injectionCapacity?: string;
  withdrawalCapacity?: string;
  full?: string;
  trend?: string;
  status?: string;
};

function num(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

function daysAgoISO(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

async function main() {
  const argDaysIdx = process.argv.indexOf("--days");
  const backfill = process.argv.includes("--backfill");
  const days = backfill ? 365 : argDaysIdx >= 0 ? Number(process.argv[argDaysIdx + 1] ?? "7") : 7;

  const from = daysAgoISO(days);
  const to = daysAgoISO(0);

  console.log(`⏳ Fetching AGSI Italia · ${from} → ${to}…`);
  const url = `https://agsi.gie.eu/api?country=IT&from=${from}&to=${to}&size=500`;
  const res = await fetch(url, {
    headers: { "x-key": AGSI_KEY!, Accept: "application/json" },
  });
  if (!res.ok) {
    console.error(`AGSI ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const json = (await res.json()) as { total: number; data: AgsiPoint[] };
  console.log(`   ${json.total} records`);

  const rows = json.data
    .filter((p) => !!p.gasDayStart)
    .map((p) => ({
      country: p.code ?? "IT",
      company: "aggregate",
      gas_day: p.gasDayStart!,
      gas_in_storage_twh: num(p.gasInStorage),
      working_gas_volume_twh: num(p.workingGasVolume),
      injection_gwh: num(p.injection),
      withdrawal_gwh: num(p.withdrawal),
      net_withdrawal_gwh: num(p.netWithdrawal),
      injection_capacity_gwh: num(p.injectionCapacity),
      withdrawal_capacity_gwh: num(p.withdrawalCapacity),
      full_pct: num(p.full),
      trend_pct: num(p.trend),
      status: p.status ?? null,
      consumption_gwh: num(p.consumption),
      consumption_full_pct: num(p.consumptionFull),
      source: "AGSI" as const,
      raw_updated_at: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
      synced_at: new Date().toISOString(),
    }));

  if (rows.length === 0) {
    console.log("   nothing to upsert");
    return;
  }

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false },
  });

  for (let i = 0; i < rows.length; i += 200) {
    const chunk = rows.slice(i, i + 200);
    const { error } = await supabase
      .from("market_gas_storage")
      .upsert(chunk, { onConflict: "country,company,gas_day,source" });
    if (error) {
      console.error(`chunk ${i}: ${error.message}`);
      process.exit(1);
    }
  }

  const latest = rows.reduce((a, b) => (a.gas_day > b.gas_day ? a : b));
  console.log(`✅ ${rows.length} rows upserted`);
  console.log(
    `   Ultimo giorno: ${latest.gas_day} · riempimento ${latest.full_pct}% · trend ${latest.trend_pct}%`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
