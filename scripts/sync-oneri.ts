/**
 * Sync oneri tariffari vigenti (luce + gas) da API Energizzo.
 * Upsert su (commodity, periodo_da, periodo_a) così ogni mese accumula storico.
 *
 * Usage: cd repo && npx tsx scripts/sync-oneri.ts
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
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing env vars");
  process.exit(1);
}

const LUCE_URL = "https://api8055.energizzo.it/api/public/oneri/vigenti";
const GAS_URL = "https://api8055.energizzo.it/api/public/oneri-gas/vigenti";

type ApiResponse = {
  success: boolean;
  periodo?: { da: string; a: string } | null;
  fallback?: boolean;
  data: unknown;
};

async function fetchOne(url: string): Promise<ApiResponse | null> {
  const res = await fetch(url);
  if (!res.ok) return null;
  return (await res.json()) as ApiResponse;
}

function periodoKey(iso: string): string {
  return iso.slice(0, 7); // YYYY-MM
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false },
  });

  for (const { commodity, url } of [
    { commodity: "luce" as const, url: LUCE_URL },
    { commodity: "gas" as const, url: GAS_URL },
  ]) {
    console.log(`\n⏳ ${commodity.toUpperCase()} — ${url}`);
    const resp = await fetchOne(url);
    if (!resp) {
      console.log("   ❌ fetch failed, skip");
      continue;
    }
    if (!resp.success) {
      console.log("   ❌ success=false, skip");
      continue;
    }
    if (!resp.periodo?.da || !resp.periodo?.a) {
      console.log("   ⚠️  no periodo, skip");
      continue;
    }
    if (
      !resp.data ||
      (Array.isArray(resp.data) && resp.data.length === 0) ||
      (typeof resp.data === "object" && Object.keys(resp.data as object).length === 0)
    ) {
      console.log(`   ⚠️  empty data for ${resp.periodo.da}..${resp.periodo.a}`);
      continue;
    }

    const row = {
      commodity,
      periodo_da: resp.periodo.da.slice(0, 10),
      periodo_a: resp.periodo.a.slice(0, 10),
      periodo_key: periodoKey(resp.periodo.da),
      data: resp.data,
      fallback_period: !!resp.fallback,
      synced_at: new Date().toISOString(),
    };

    const { error } = await supabase
      .from("oneri_tariffe_cache")
      .upsert(row, { onConflict: "commodity,periodo_da,periodo_a" });
    if (error) {
      console.log(`   ❌ upsert failed: ${error.message}`);
      continue;
    }
    console.log(
      `   ✅ ${row.periodo_da} → ${row.periodo_a} ${resp.fallback ? "(fallback)" : ""}`,
    );
  }

  console.log("\nDone");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
