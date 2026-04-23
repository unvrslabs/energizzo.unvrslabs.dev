/**
 * Backfill scraped_data_pubblicazione on delibere_cache by scraping the
 * ARERA detail page (url_riferimento) for the italian publication date.
 *
 * Usage: npx tsx scripts/backfill-delibere-dates.ts [limit]
 */

import { createClient } from "@supabase/supabase-js";
import { loadEnvLocal } from "./_env-loader";

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing env vars");
  process.exit(1);
}

const UA = "Mozilla/5.0 (compatible; IlDispaccioBot/1.0; +https://ildispaccio.energy)";

const MONTHS_IT: Record<string, number> = {
  gennaio: 0, febbraio: 1, marzo: 2, aprile: 3, maggio: 4, giugno: 5,
  luglio: 6, agosto: 7, settembre: 8, ottobre: 9, novembre: 10, dicembre: 11,
};

function parseAreraDate(html: string): Date | null {
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

async function scrapeOne(pageUrl: string): Promise<Date | null> {
  try {
    const res = await fetch(pageUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const html = await res.text();
    return parseAreraDate(html);
  } catch {
    return null;
  }
}

async function main() {
  const limitArg = process.argv[2];
  const limit = limitArg ? parseInt(limitArg, 10) : 500;

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from("delibere_cache")
    .select("id, numero, url_riferimento")
    .is("scraped_data_pubblicazione", null)
    .not("url_riferimento", "is", null)
    .limit(limit);
  if (error) {
    console.error(error.message);
    process.exit(1);
  }
  if (!data || data.length === 0) {
    console.log("nothing to scrape");
    return;
  }

  console.log(`⏳ Scraping ${data.length} delibere…`);
  let ok = 0;
  let miss = 0;

  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    process.stdout.write(`   [${i + 1}/${data.length}] ${row.numero}… `);
    const url = row.url_riferimento;
    if (!url || !/arera\.it/i.test(url)) {
      console.log("skip (not ARERA)");
      miss++;
      continue;
    }
    const date = await scrapeOne(url);
    if (!date) {
      console.log("NO DATE");
      miss++;
      await supabase
        .from("delibere_cache")
        .update({ scraped_at: new Date().toISOString() })
        .eq("id", row.id);
      continue;
    }
    await supabase
      .from("delibere_cache")
      .update({
        scraped_data_pubblicazione: date.toISOString(),
        scraped_at: new Date().toISOString(),
      })
      .eq("id", row.id);
    console.log(`✓ ${date.toISOString().slice(0, 10)}`);
    ok++;
  }

  console.log(`\n→ ${ok} with date, ${miss} without`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
