/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "@/lib/supabase/server";

export type PsvRow = {
  id: number;
  price_day: string;
  price_eur_mwh: number;
  volume_mwh: number | null;
  trades_count: number | null;
  method: string;
  source: string;
  synced_at: string;
  created_at: string;
};

// market_gas_psv non e' ancora nei tipi auto-generati Supabase finche' non
// applichiamo la migration. Cast `any` temporaneo: rimuovere dopo `supabase
// gen types` quando la tabella esiste nel DB live.

export async function getLatestPsv(): Promise<PsvRow | null> {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("market_gas_psv")
    .select("*")
    .order("price_day", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestPsv: ${error.message}`);
  return (data ?? null) as PsvRow | null;
}

export async function listPsvHistory(days = 30): Promise<PsvRow[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceIso = since.toISOString().slice(0, 10);
  const { data, error } = await (supabase as any)
    .from("market_gas_psv")
    .select("*")
    .gte("price_day", sinceIso)
    .order("price_day", { ascending: true });
  if (error) throw new Error(`listPsvHistory: ${error.message}`);
  return (data ?? []) as PsvRow[];
}

export async function upsertPsv(row: {
  price_day: string;
  price_eur_mwh: number;
  volume_mwh?: number | null;
  trades_count?: number | null;
  method?: string;
  source?: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await (supabase as any).from("market_gas_psv").upsert(
    {
      price_day: row.price_day,
      price_eur_mwh: row.price_eur_mwh,
      volume_mwh: row.volume_mwh ?? null,
      trades_count: row.trades_count ?? null,
      method: row.method ?? "auction_close",
      source: row.source ?? "gme",
      synced_at: new Date().toISOString(),
    },
    { onConflict: "price_day" },
  );
  if (error) throw new Error(`upsertPsv: ${error.message}`);
}
