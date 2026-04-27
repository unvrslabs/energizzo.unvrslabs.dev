import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../../_lib/auth";

export const dynamic = "force-dynamic";

// 'today' fetches 2 records so we can compute delta vs previous day, regardless
// of whether today's PUN is published yet (ENTSO-E day-ahead lands ~12:42 IT time).
const RANGE_LIMIT: Record<string, number> = {
  today: 2,
  yesterday: 2,
  week: 7,
  month: 30,
};

const WEEKDAY_IT = [
  "domenica",
  "lunedì",
  "martedì",
  "mercoledì",
  "giovedì",
  "venerdì",
  "sabato",
];

const MONTH_IT = [
  "gennaio",
  "febbraio",
  "marzo",
  "aprile",
  "maggio",
  "giugno",
  "luglio",
  "agosto",
  "settembre",
  "ottobre",
  "novembre",
  "dicembre",
];

function fmtItalianDate(iso: string): string {
  // iso = "YYYY-MM-DD"
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${WEEKDAY_IT[dt.getUTCDay()]} ${d} ${MONTH_IT[m - 1]} ${y}`;
}

function todayIsoRome(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });
  return fmt.format(new Date()); // YYYY-MM-DD
}

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") ?? "today").toLowerCase();
  const limit = RANGE_LIMIT[range] ?? 2;

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
  const todayIso = todayIsoRome();

  let summary = "Nessun dato PUN disponibile";
  if (items.length > 0) {
    const latest = items[0];
    const latestPrice = Number(latest.price_eur_mwh);
    const isToday = latest.price_day === todayIso;
    const dateLabel = fmtItalianDate(latest.price_day);

    if (range === "today" || range === "yesterday") {
      const stalenessNote = isToday
        ? "(dato di oggi)"
        : `(ultimo dato disponibile — il PUN ${todayIso} non è ancora pubblicato; ENTSO-E rilascia il day-ahead alle 12:42 italiane)`;

      if (items.length >= 2) {
        const prev = items[1];
        const prevPrice = Number(prev.price_eur_mwh);
        const delta = latestPrice - prevPrice;
        const pct = prevPrice ? (delta / prevPrice) * 100 : 0;
        const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "▬";
        summary =
          `PUN ${dateLabel}: ${latestPrice.toFixed(2)} €/MWh ${stalenessNote}\n` +
          `Variazione vs ${fmtItalianDate(prev.price_day)} (${prevPrice.toFixed(2)} €/MWh): ${arrow} ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} €/MWh (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`;
      } else {
        summary = `PUN ${dateLabel}: ${latestPrice.toFixed(2)} €/MWh ${stalenessNote}`;
      }
    } else {
      const prices = items.map((r) => Number(r.price_eur_mwh)).filter((n) => Number.isFinite(n));
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      summary = `PUN ultimi ${items.length} giorni (${fmtItalianDate(items[items.length - 1].price_day)} → ${dateLabel}) — media ${avg.toFixed(2)} €/MWh, min ${min.toFixed(2)}, max ${max.toFixed(2)}`;
    }
  }

  const preview = items.map((r) => ({
    title: `${fmtItalianDate(r.price_day)}: ${Number(r.price_eur_mwh).toFixed(2)} €/MWh`,
    subtitle: r.source ?? "",
    url: null,
  }));

  return NextResponse.json({
    items: items.map((r) => ({
      ...r,
      weekday_it: fmtItalianDate(r.price_day).split(" ")[0],
      is_today: r.price_day === todayIso,
    })),
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
