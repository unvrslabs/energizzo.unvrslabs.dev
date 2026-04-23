import { createClient } from "@/lib/supabase/server";

export type PunRow = {
  id: number;
  price_day: string;
  price_eur_mwh: number;
  zones: Record<string, number>;
  method: string;
  source: string;
  synced_at: string;
  created_at: string;
};

export async function getLatestPun(): Promise<PunRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_power_pun")
    .select("*")
    .order("price_day", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestPun: ${error.message}`);
  return (data ?? null) as PunRow | null;
}

export async function getPunAt(dayIso: string): Promise<PunRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_power_pun")
    .select("*")
    .eq("price_day", dayIso)
    .maybeSingle();
  if (error) throw new Error(`getPunAt: ${error.message}`);
  return (data ?? null) as PunRow | null;
}

export async function listPunHistory(days = 30): Promise<PunRow[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceIso = since.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("market_power_pun")
    .select("*")
    .gte("price_day", sinceIso)
    .order("price_day", { ascending: true });
  if (error) throw new Error(`listPunHistory: ${error.message}`);
  return (data ?? []) as PunRow[];
}

export async function upsertPun(row: {
  price_day: string;
  price_eur_mwh: number;
  zones: Record<string, number>;
  method: string;
  source: string;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("market_power_pun")
    .upsert(
      {
        price_day: row.price_day,
        price_eur_mwh: row.price_eur_mwh,
        zones: row.zones as never,
        method: row.method,
        source: row.source,
        synced_at: new Date().toISOString(),
      } as never,
      { onConflict: "price_day" },
    );
  if (error) throw new Error(`upsertPun: ${error.message}`);
}
