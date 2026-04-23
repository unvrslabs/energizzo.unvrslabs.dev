/**
 * Import reseller classification from CSV into leads table.
 *
 * Reads data/reseller_classificato.csv and updates matching leads by piva
 * with: categoria, commodity, servizio_tutela, in_gruppo, macroarea, completezza_contatti.
 *
 * Usage:
 *   cd /Users/emanuelemaccari/dashboard-energizzo
 *   npx tsx scripts/import-reseller-classification.ts
 */

import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./_env-loader";

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false, autoRefreshToken: false },
});

type CsvRow = Record<string, string>;

interface Classification {
  piva: string;
  categoria: string | null;
  commodity: string | null;
  servizio_tutela: boolean | null;
  in_gruppo: boolean | null;
  macroarea: string | null;
  completezza_contatti: number | null;
}

function toBool(v: string | undefined | null): boolean | null {
  if (v == null) return null;
  const s = v.trim().toUpperCase();
  if (s === "SI" || s === "SÌ" || s === "TRUE" || s === "1") return true;
  if (s === "NO" || s === "FALSE" || s === "0") return false;
  return null;
}

function toCompletezza(v: string | undefined | null): number | null {
  if (!v) return null;
  const s = v.trim();
  const m = s.match(/^(\d+)\s*\/\s*5$/);
  if (m) return parseInt(m[1], 10);
  const n = parseInt(s, 10);
  return Number.isFinite(n) ? n : null;
}

function cleanString(v: string | undefined | null): string | null {
  if (v == null) return null;
  const s = v.trim();
  return s.length ? s : null;
}

async function main() {
  const csvPath = resolve(process.cwd(), "data/reseller_classificato.csv");
  const raw = readFileSync(csvPath, "utf8");

  const rows: CsvRow[] = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    relax_column_count: true,
    trim: false,
  });

  console.log(`CSV rows parsed: ${rows.length}`);

  const classifications: Classification[] = [];
  const skipped: Array<{ row: number; reason: string }> = [];

  rows.forEach((row, idx) => {
    const pivaRaw = row.piva;
    if (pivaRaw == null || pivaRaw === "") {
      skipped.push({ row: idx + 2, reason: "missing piva" });
      return;
    }
    const piva = String(pivaRaw).replace(/\s/g, "").padStart(11, "0");
    classifications.push({
      piva,
      categoria: cleanString(row.categoria),
      commodity: cleanString(row.commodity),
      servizio_tutela: toBool(row.servizio_tutela),
      in_gruppo: toBool(row.in_gruppo),
      macroarea: cleanString(row.macroarea),
      completezza_contatti: toCompletezza(row.completezza_contatti),
    });
  });

  console.log(`Classifications ready: ${classifications.length}`);
  if (skipped.length) console.log(`Skipped rows: ${skipped.length}`, skipped.slice(0, 5));

  // Fetch existing PIVE to know which will match
  const pivasInCsv = classifications.map((c) => c.piva);
  const { data: existing, error: existingErr } = await supabase
    .from("leads")
    .select("piva")
    .in("piva", pivasInCsv);

  if (existingErr) {
    console.error("Error fetching existing leads:", existingErr);
    process.exit(1);
  }

  const existingSet = new Set((existing ?? []).map((r) => r.piva as string));
  const matched = classifications.filter((c) => existingSet.has(c.piva));
  const unmatched = classifications.filter((c) => !existingSet.has(c.piva));

  console.log(`PIVE matched in DB: ${matched.length}`);
  console.log(`PIVE NOT matched: ${unmatched.length}`);

  // Update in batches (per-piva update, since leads has different schema than CSV)
  let updatedOk = 0;
  let updateErr = 0;
  const batchSize = 50;

  for (let i = 0; i < matched.length; i += batchSize) {
    const batch = matched.slice(i, i + batchSize);
    await Promise.all(
      batch.map(async (c) => {
        const { error } = await supabase
          .from("leads")
          .update({
            categoria: c.categoria,
            commodity: c.commodity,
            servizio_tutela: c.servizio_tutela,
            in_gruppo: c.in_gruppo,
            macroarea: c.macroarea,
            completezza_contatti: c.completezza_contatti,
          })
          .eq("piva", c.piva);
        if (error) {
          updateErr++;
          console.error(`Update error piva=${c.piva}:`, error.message);
        } else {
          updatedOk++;
        }
      })
    );
    process.stdout.write(`\rProgress: ${Math.min(i + batchSize, matched.length)}/${matched.length}`);
  }
  process.stdout.write("\n");

  console.log("\n========== REPORT ==========");
  console.log(`CSV rows parsed         : ${rows.length}`);
  console.log(`Classifications ready   : ${classifications.length}`);
  console.log(`PIVE matched in DB      : ${matched.length}`);
  console.log(`PIVE NOT matched in DB  : ${unmatched.length}`);
  console.log(`Rows updated OK         : ${updatedOk}`);
  console.log(`Rows update errored     : ${updateErr}`);

  if (unmatched.length) {
    console.log("\nUnmatched PIVE list:");
    unmatched.forEach((c) => console.log(`  ${c.piva}`));
  }
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
