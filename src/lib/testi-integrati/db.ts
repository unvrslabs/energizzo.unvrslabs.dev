import { createClient } from "@/lib/supabase/server";
import type { UiSector } from "@/lib/delibere/api";

export type DbTestoIntegrato = {
  id: number;
  codice: string;
  delibera_riferimento: string | null;
  titolo: string;
  descrizione: string | null;
  settore: string | null;
  data_entrata_vigore: string | null;
  data_scadenza: string | null;
  url_riferimento: string | null;
  documento_url: string | null;
  documenti_urls: string[] | null;
  stato: string | null;
  note: string | null;
  autore: { id: number; name: string } | null;
  api_created_at: string | null;
  api_updated_at: string | null;
  scraped_data_pubblicazione: string | null;
  scraped_at: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
  codice_suffix: string | null;
};

export async function listTestiIntegrati(opts?: { limit?: number }): Promise<DbTestoIntegrato[]> {
  const supabase = await createClient();
  let query = supabase
    .from("testi_integrati_cache")
    .select("*")
    .in("codice_suffix", ["eel", "gas", "com"])
    .order("data_entrata_vigore", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (opts?.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw new Error(`listTestiIntegrati: ${error.message}`);
  return (data ?? []) as DbTestoIntegrato[];
}

export function deriveSectorsFromTiSettore(
  settore: string | null,
  codice: string,
): UiSector[] {
  const s = (settore ?? "").toLowerCase();
  if (s.includes("elett") || s === "eel" || s === "luce") return ["eel"];
  if (s.includes("gas")) return ["gas"];
  // fallback dal suffisso codice
  const parts = codice.split("/");
  if (parts.length >= 4) {
    const suf = parts[3].toLowerCase();
    if (suf === "eel") return ["eel"];
    if (suf === "gas") return ["gas"];
    if (suf === "com") return ["eel", "gas"];
  }
  return [];
}
