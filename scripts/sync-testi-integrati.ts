/**
 * Sync testi integrati ARERA da API Energizzo pubblico.
 * Usage: cd repo && npx tsx scripts/sync-testi-integrati.ts
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

const API = "https://api8055.energizzo.it/api/public/testi-integrati";

type ApiTi = {
  id: number;
  codice: string;
  delibera_riferimento: string | null;
  titolo: string;
  descrizione: string | null;
  settore: string | null;
  data_entrata_vigore: string | null;
  data_scadenza: string | null;
  url_riferimento: string | null;
  stato: string | null;
  note: string | null;
  documento_url: string | null;
  documenti_urls: string[] | null;
  autore: { id: number; name: string } | null;
  created_at: string | null;
  updated_at: string | null;
};

async function main() {
  const res = await fetch(`${API}?per_page=500`);
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = await res.json() as { success: boolean; data: ApiTi[]; total: number };
  if (!json.success) throw new Error("API success=false");

  console.log(`⏳ Fetching ${json.total} testi integrati…`);
  const items = json.data;

  const rows = items.map((d) => ({
    id: d.id,
    codice: d.codice,
    delibera_riferimento: d.delibera_riferimento,
    titolo: d.titolo,
    descrizione: d.descrizione,
    settore: d.settore,
    data_entrata_vigore: d.data_entrata_vigore,
    data_scadenza: d.data_scadenza,
    url_riferimento: d.url_riferimento,
    documento_url: d.documento_url,
    documenti_urls: d.documenti_urls ?? [],
    stato: d.stato,
    note: d.note,
    autore: d.autore,
    api_created_at: d.created_at,
    api_updated_at: d.updated_at,
    synced_at: new Date().toISOString(),
  }));

  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false },
  });

  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase
      .from("testi_integrati_cache")
      .upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`chunk ${i}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log(`✅ ${rows.length} testi integrati upserted`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
