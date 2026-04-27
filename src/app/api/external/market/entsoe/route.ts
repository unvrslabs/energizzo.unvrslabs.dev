import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../../_lib/auth";

export const dynamic = "force-dynamic";

const VALID_METRICS = [
  "generation_mix",
  "load_forecast",
  "renewable_forecast",
  "cross_border_flows",
  "unavailability",
] as const;
type Metric = (typeof VALID_METRICS)[number];

const METRIC_LABEL_IT: Record<Metric, string> = {
  generation_mix: "Mix di generazione",
  load_forecast: "Previsione domanda",
  renewable_forecast: "Previsione rinnovabili",
  cross_border_flows: "Flussi transfrontalieri",
  unavailability: "Indisponibilità impianti",
};

function summarize(metric: Metric, payload: Record<string, unknown> | null): string {
  if (!payload) return `${METRIC_LABEL_IT[metric]}: nessun dato`;
  if (metric === "generation_mix") {
    const renewPct =
      (payload.renewable_pct as number | undefined) ??
      (payload.renewable_share as number | undefined);
    if (typeof renewPct === "number") {
      return `Mix generazione IT: rinnovabili ${renewPct.toFixed(1)}%`;
    }
    return "Mix di generazione IT disponibile";
  }
  if (metric === "load_forecast") {
    const peak = (payload.peak_gw as number | undefined) ?? (payload.peak as number | undefined);
    if (typeof peak === "number") return `Picco domanda previsto: ${peak.toFixed(2)} GW`;
    return "Previsione domanda disponibile";
  }
  if (metric === "renewable_forecast") {
    const wind = payload.wind_gw as number | undefined;
    const solar = payload.solar_gw as number | undefined;
    if (typeof wind === "number" || typeof solar === "number") {
      return `Rinnovabili previste: wind ${(wind ?? 0).toFixed(2)} GW, solar ${(solar ?? 0).toFixed(2)} GW`;
    }
    return "Previsione rinnovabili disponibile";
  }
  if (metric === "cross_border_flows") {
    return "Flussi cross-border IT disponibili";
  }
  return "Indisponibilità impianti disponibile";
}

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const metric = (url.searchParams.get("metric") ?? "") as Metric;
  if (!VALID_METRICS.includes(metric)) {
    return NextResponse.json(
      {
        error: `metric richiesto, valori validi: ${VALID_METRICS.join(", ")}`,
      },
      { status: 400 },
    );
  }
  const range = (url.searchParams.get("range") ?? "today").toLowerCase();
  const limit = range === "week" ? 7 : 1;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_entsoe")
    .select("reference_day,metric_type,payload")
    .eq("metric_type", metric)
    .order("reference_day", { ascending: false })
    .limit(limit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const items = data ?? [];

  const last = items[0]?.payload as Record<string, unknown> | null;
  const summary = summarize(metric, last);
  const preview = items.map((r) => ({
    title: METRIC_LABEL_IT[metric],
    subtitle: String(r.reference_day),
    url: null,
  }));

  return NextResponse.json({
    items,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
