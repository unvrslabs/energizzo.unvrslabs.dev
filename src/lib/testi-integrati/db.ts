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
  // I codici dei TI sono acronimi (TIT, TIV, TIS, ecc.), non formato NNN/YYYY/T/S.
  // Il settore si determina dal campo `settore` API ("elettrico" / "gas"), mai dual.
  let query = supabase
    .from("testi_integrati_cache")
    .select("*")
    .order("data_entrata_vigore", { ascending: false, nullsFirst: false })
    .order("id", { ascending: false });
  if (opts?.limit) query = query.limit(opts.limit);
  const { data, error } = await query;
  if (error) throw new Error(`listTestiIntegrati: ${error.message}`);
  return (data ?? []) as DbTestoIntegrato[];
}

/**
 * Per una lista di codici delibera, ritorna un map codice → metadati.
 * Usato per risolvere `delibera_riferimento` dei testi integrati verso la
 * delibera corrispondente nella nostra cache.
 */
export type DeliberaRefMeta = {
  numero: string;
  titolo: string;
  settore: string | null;
  data_pubblicazione: string | null;
  in_cache: boolean;
};

export async function resolveDelibereRefs(
  codici: string[],
): Promise<Map<string, DeliberaRefMeta>> {
  const unique = [...new Set(codici.filter(Boolean))];
  if (unique.length === 0) return new Map();
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("numero, titolo, settore, scraped_data_pubblicazione, data_pubblicazione, data_delibera")
    .in("numero", unique);
  if (error) throw new Error(`resolveDelibereRefs: ${error.message}`);
  const map = new Map<string, DeliberaRefMeta>();
  for (const row of data ?? []) {
    map.set(row.numero, {
      numero: row.numero,
      titolo: row.titolo,
      settore: row.settore,
      data_pubblicazione:
        row.scraped_data_pubblicazione ??
        row.data_pubblicazione ??
        row.data_delibera ??
        null,
      in_cache: true,
    });
  }
  return map;
}

/**
 * Fallback ARERA: costruisce l'URL della pagina dettaglio delibera.
 * Pattern: https://www.arera.it/atti-e-provvedimenti/dettaglio/{yy}/{n}-{yy}
 */
export function buildAreraDetailUrl(numero: string): string | null {
  const parts = numero.split("/");
  if (parts.length < 2) return null;
  const [n, yyyy] = parts;
  if (!/^\d+$/.test(n) || !/^\d{4}$/.test(yyyy)) return null;
  const yy = yyyy.slice(2);
  return `https://www.arera.it/atti-e-provvedimenti/dettaglio/${yy}/${n}-${yy}`;
}

/**
 * I testi integrati sono SEMPRE mono-settore (elettrico o gas, mai entrambi).
 * Usiamo il campo settore API; fallback al suffisso del codice se presente.
 */
export function deriveSectorsFromTiSettore(
  settore: string | null,
  codice: string,
): UiSector[] {
  const s = (settore ?? "").toLowerCase();
  if (s.includes("elett") || s === "eel" || s === "luce") return ["eel"];
  if (s.includes("gas")) return ["gas"];
  const parts = codice.split("/");
  if (parts.length >= 4) {
    const suf = parts[3].toLowerCase();
    if (suf === "eel") return ["eel"];
    if (suf === "gas") return ["gas"];
  }
  return [];
}
