import { createClient } from "@/lib/supabase/server";

export type EntsoeMetricType =
  | "generation_mix"
  | "load_forecast"
  | "renewable_forecast"
  | "cross_border_flows"
  | "unavailability";

export type EntsoeRow = {
  id: number;
  metric_type: EntsoeMetricType;
  reference_day: string;
  payload: Record<string, unknown>;
  source: string;
  synced_at: string;
  created_at: string;
};

export async function getLatestEntsoe(
  metric: EntsoeMetricType,
): Promise<EntsoeRow | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_entsoe")
    .select("*")
    .eq("metric_type", metric)
    .order("reference_day", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(`getLatestEntsoe(${metric}): ${error.message}`);
  return (data ?? null) as EntsoeRow | null;
}

export async function listEntsoeHistory(
  metric: EntsoeMetricType,
  days = 30,
): Promise<EntsoeRow[]> {
  const supabase = await createClient();
  const since = new Date();
  since.setUTCDate(since.getUTCDate() - days);
  const sinceIso = since.toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from("market_entsoe")
    .select("*")
    .eq("metric_type", metric)
    .gte("reference_day", sinceIso)
    .order("reference_day", { ascending: true });
  if (error) throw new Error(`listEntsoeHistory(${metric}): ${error.message}`);
  return (data ?? []) as EntsoeRow[];
}

export async function upsertEntsoe(row: {
  metric_type: EntsoeMetricType;
  reference_day: string;
  payload: Record<string, unknown>;
}): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("market_entsoe")
    .upsert(
      {
        metric_type: row.metric_type,
        reference_day: row.reference_day,
        payload: row.payload as never,
        source: "ENTSO-E",
        synced_at: new Date().toISOString(),
      } as never,
      { onConflict: "metric_type,reference_day" },
    );
  if (error) throw new Error(`upsertEntsoe: ${error.message}`);
}
