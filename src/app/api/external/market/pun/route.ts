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
    .from("market_power_pun")
    .select("price_day,price_eur_mwh,zones,source")
    .order("price_day", { ascending: false })
    .limit(limit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const items = data ?? [];

  let summary = "Nessun dato PUN disponibile";
  if (items.length > 0) {
    const prices = items
      .map((r) => Number(r.price_eur_mwh))
      .filter((n) => Number.isFinite(n));
    if (range === "today" && items.length === 1) {
      summary = `PUN ${items[0].price_day}: ${prices[0].toFixed(2)} €/MWh`;
    } else if (range === "yesterday" && items.length >= 2) {
      const oggi = prices[0];
      const ieri = prices[1];
      const delta = oggi - ieri;
      const pct = ieri ? (delta / ieri) * 100 : 0;
      summary = `PUN ${items[0].price_day}: ${oggi.toFixed(2)} €/MWh (vs ieri ${ieri.toFixed(2)}, ${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`;
    } else {
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      summary = `PUN ultimi ${items.length}gg — media ${avg.toFixed(2)} €/MWh (min ${min.toFixed(2)}, max ${max.toFixed(2)})`;
    }
  }

  const preview = items.map((r) => ({
    title: `${r.price_day}: ${Number(r.price_eur_mwh).toFixed(2)} €/MWh`,
    subtitle: r.source ?? "",
    url: null,
  }));

  return NextResponse.json({
    items,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
