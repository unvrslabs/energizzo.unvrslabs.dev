"use server";

import { createClient } from "@/lib/supabase/server";
import { fetchAllDelibere, type EnergizzoDelibera } from "@/lib/delibere/api";

export type SyncResult = {
  total: number;
  inserted: number;
  updated: number;
  errors: string[];
};

/**
 * Sync delibere from Energizzo API into delibere_cache.
 * Upserts by id. Preserves any existing AI summary fields.
 */
export async function syncDelibereFromApi(): Promise<SyncResult> {
  const supabase = await createClient();
  const all = await fetchAllDelibere(25);

  const { data: existing, error: selErr } = await supabase
    .from("delibere_cache")
    .select("id, api_updated_at");
  if (selErr) {
    throw new Error(`sync: failed reading existing ids: ${selErr.message}`);
  }
  const existingMap = new Map<number, string | null>(
    (existing ?? []).map((e) => [e.id as number, e.api_updated_at as string | null]),
  );

  const rows = all.map((d) => apiToRow(d));

  const { error: upsertErr } = await supabase
    .from("delibere_cache")
    .upsert(rows, { onConflict: "id" });
  if (upsertErr) {
    throw new Error(`sync: upsert failed: ${upsertErr.message}`);
  }

  let inserted = 0;
  let updated = 0;
  for (const r of rows) {
    if (existingMap.has(r.id)) {
      if (existingMap.get(r.id) !== r.api_updated_at) updated++;
    } else {
      inserted++;
    }
  }

  return {
    total: rows.length,
    inserted,
    updated,
    errors: [],
  };
}

function apiToRow(d: EnergizzoDelibera) {
  return {
    id: d.id,
    numero: d.numero,
    titolo: d.titolo,
    descrizione: d.descrizione,
    tipo: d.tipo,
    settore: d.settore,
    data_delibera: d.data_delibera,
    data_scadenza: d.data_scadenza,
    data_pubblicazione: d.data_pubblicazione,
    fonte: d.fonte,
    url_riferimento: d.url_riferimento,
    documento_url: d.documento_url,
    documenti_urls: d.documenti_urls ?? [],
    stato: d.stato,
    note: d.note,
    autore: d.autore,
    api_created_at: d.created_at,
    api_updated_at: d.updated_at,
    synced_at: new Date().toISOString(),
  };
}
