import { createClient } from "@/lib/supabase/server";

export type GasStorageRow = {
  id: number;
  country: string;
  company: string;
  gas_day: string;
  gas_in_storage_twh: number | null;
  working_gas_volume_twh: number | null;
  injection_gwh: number | null;
  withdrawal_gwh: number | null;
  net_withdrawal_gwh: number | null;
  injection_capacity_gwh: number | null;
  withdrawal_capacity_gwh: number | null;
  full_pct: number | null;
  trend_pct: number | null;
  status: string | null;
  consumption_gwh: number | null;
  consumption_full_pct: number | null;
  source: string;
  raw_updated_at: string | null;
  synced_at: string;
  created_at: string;
};

export async function getLatestGasStorage(): Promise<GasStorageRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_gas_storage")
    .select("*")
    .eq("country", "IT")
    .eq("company", "aggregate")
    .order("gas_day", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestGasStorage: ${error.message}`);
  return (data ?? null) as GasStorageRow | null;
}

export async function listGasStorageHistory(days = 60): Promise<GasStorageRow[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceIso = since.toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("market_gas_storage")
    .select("*")
    .eq("country", "IT")
    .eq("company", "aggregate")
    .gte("gas_day", sinceIso)
    .order("gas_day", { ascending: true });
  if (error) throw new Error(`listGasStorageHistory: ${error.message}`);
  return (data ?? []) as GasStorageRow[];
}
