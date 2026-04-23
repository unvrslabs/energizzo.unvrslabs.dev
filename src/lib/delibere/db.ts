import { createClient } from "@/lib/supabase/server";
import type { UiSector } from "@/lib/delibere/api";

export type DbDelibera = {
  id: number;
  numero: string;
  titolo: string;
  descrizione: string | null;
  tipo: string | null;
  settore: string | null;
  data_delibera: string | null;
  data_scadenza: string | null;
  data_pubblicazione: string | null;
  fonte: string | null;
  url_riferimento: string | null;
  documento_url: string | null;
  documenti_urls: string[] | null;
  stato: string | null;
  note: string | null;
  autore: { id: number; name: string } | null;
  api_created_at: string | null;
  api_updated_at: string | null;
  ai_summary: string | null;
  ai_bullets: string[] | null;
  ai_sectors: UiSector[] | null;
  ai_generated_at: string | null;
  ai_model: string | null;
  ai_source: string | null;
  ai_error: string | null;
  synced_at: string;
  created_at: string;
  updated_at: string;
};

/**
 * List delibere for network view: sorted by data_delibera desc (nulls last),
 * limit by recency. Returns everything needed by the UI.
 */
export async function listDelibere(opts?: { limit?: number }): Promise<DbDelibera[]> {
  const supabase = await createClient();
  let query = supabase
    .from("delibere_cache")
    .select("*")
    .order("data_delibera", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (opts?.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw new Error(`listDelibere: ${error.message}`);
  return (data ?? []) as DbDelibera[];
}

export async function getDeliberaById(id: number): Promise<DbDelibera | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`getDeliberaById: ${error.message}`);
  return (data ?? null) as DbDelibera | null;
}

export async function countDelibere(): Promise<{ total: number; withSummary: number }> {
  const supabase = await createClient();
  const [{ count: total }, { count: withSummary }] = await Promise.all([
    supabase.from("delibere_cache").select("*", { count: "exact", head: true }),
    supabase
      .from("delibere_cache")
      .select("*", { count: "exact", head: true })
      .not("ai_generated_at", "is", null),
  ]);
  return { total: total ?? 0, withSummary: withSummary ?? 0 };
}

export async function listDelibereMissingSummary(limit = 30): Promise<DbDelibera[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("*")
    .is("ai_generated_at", null)
    .is("ai_error", null)
    .order("data_delibera", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw new Error(`listDelibereMissingSummary: ${error.message}`);
  return (data ?? []) as DbDelibera[];
}
