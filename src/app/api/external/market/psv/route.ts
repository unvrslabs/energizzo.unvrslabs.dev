import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../../_lib/auth";

export const dynamic = "force-dynamic";

const RANGE_LIMIT: Record<string, number> = {
  today: 1,
  yesterday: 2,
  week: 7,
  month: 30,
};

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") ?? "today").toLowerCase();
  const limit = RANGE_LIMIT[range] ?? 1;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("market_gas_storage")
    .select(
      "gas_day,full_pct,gas_in_storage_twh,working_gas_volume_twh,trend_pct,net_withdrawal_gwh,country,company",
    )
    .eq("country", "IT")
    .eq("company", "aggregate")
    .order("gas_day", { ascending: false })
    .limit(limit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const items = data ?? [];

  let summary = "Nessun dato storage gas disponibile";
  if (items.length > 0) {
    const last = items[0];
    summary = `Storage gas IT ${last.gas_day}: ${Number(last.full_pct ?? 0).toFixed(1)}% (${Number(last.gas_in_storage_twh ?? 0).toFixed(2)} TWh), trend ${Number(last.trend_pct ?? 0).toFixed(2)}%`;
  }

  const preview = items.map((r) => ({
    title: `${r.gas_day}: ${Number(r.full_pct ?? 0).toFixed(1)}% (${Number(r.gas_in_storage_twh ?? 0).toFixed(2)} TWh)`,
    subtitle: `trend ${Number(r.trend_pct ?? 0).toFixed(2)}%`,
    url: null,
  }));

  return NextResponse.json({
    items,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
