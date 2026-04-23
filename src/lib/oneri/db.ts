import { createClient } from "@/lib/supabase/server";
import type { Commodity } from "@/lib/oneri/meta";

export type OneriRow = {
  id: number;
  commodity: Commodity;
  periodo_da: string;
  periodo_a: string;
  periodo_key: string;
  data: Record<string, unknown>;
  fallback_period: boolean;
  synced_at: string;
  created_at: string;
  updated_at: string;
};

export async function listAvailablePeriods(
  commodity: Commodity,
): Promise<{ key: string; da: string; a: string; fallback: boolean }[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oneri_tariffe_cache")
    .select("periodo_key, periodo_da, periodo_a, fallback_period")
    .eq("commodity", commodity)
    .order("periodo_da", { ascending: false });
  if (error) throw new Error(`listAvailablePeriods: ${error.message}`);
  return (data ?? []).map((r) => ({
    key: r.periodo_key,
    da: r.periodo_da,
    a: r.periodo_a,
    fallback: !!r.fallback_period,
  }));
}

export async function getOneriByPeriod(
  commodity: Commodity,
  periodoKey: string,
): Promise<OneriRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oneri_tariffe_cache")
    .select("*")
    .eq("commodity", commodity)
    .eq("periodo_key", periodoKey)
    .maybeSingle();
  if (error) throw new Error(`getOneriByPeriod: ${error.message}`);
  return (data ?? null) as OneriRow | null;
}

export async function getLatestOneri(
  commodity: Commodity,
): Promise<OneriRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("oneri_tariffe_cache")
    .select("*")
    .eq("commodity", commodity)
    .order("periodo_da", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestOneri: ${error.message}`);
  return (data ?? null) as OneriRow | null;
}
