import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../../_lib/auth";

export const dynamic = "force-dynamic";

// 'today' fetches 2 records so we can compute delta vs previous day, regardless
// of whether today's PSV is published yet (GME chiude MGP-Gas dopo le 14:30 IT).
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
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return iso;
  const dt = new Date(Date.UTC(y, m - 1, d));
  return `${WEEKDAY_IT[dt.getUTCDay()]} ${d} ${MONTH_IT[m - 1]} ${y}`;
}

function todayIsoRome(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Rome" });
  return fmt.format(new Date());
}

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const range = (url.searchParams.get("range") ?? "today").toLowerCase();
  const limit = RANGE_LIMIT[range] ?? 2;

  const supabase = await createClient();

  // PSV price (prezzo gas all'ingrosso Italia, fonte GME MGP-Gas via Apify scraper).
  // `market_gas_psv` non è nei generated types Supabase, cast esplicito (allineato a gas-psv-db.ts).
  const { data: priceData, error: priceErr } = await (supabase as unknown as {
    from: (t: string) => {
      select: (s: string) => {
        order: (c: string, o: { ascending: boolean }) => {
          limit: (n: number) => Promise<{
            data: Array<{ price_day: string; price_eur_mwh: number; source: string }> | null;
            error: { message: string } | null;
          }>;
        };
      };
    };
  })
    .from("market_gas_psv")
    .select("price_day,price_eur_mwh,source")
    .order("price_day", { ascending: false })
    .limit(limit);
  if (priceErr) {
    return NextResponse.json({ error: priceErr.message }, { status: 500 });
  }
  const priceItems = priceData ?? [];

  // Storage gas (AGSI riempimento) — bonus context
  const { data: storageData } = await supabase
    .from("market_gas_storage")
    .select("gas_day,full_pct,gas_in_storage_twh,trend_pct")
    .eq("country", "IT")
    .eq("company", "aggregate")
    .order("gas_day", { ascending: false })
    .limit(1);
  const storage = storageData?.[0] ?? null;

  let summary = "Nessun dato PSV disponibile";
  const todayIso = todayIsoRome();

  if (priceItems.length > 0) {
    const latest = priceItems[0];
    const latestPrice = Number(latest.price_eur_mwh);
    const isToday = latest.price_day === todayIso;
    const dateLabel = fmtItalianDate(latest.price_day);

    if (range === "today" || range === "yesterday") {
      const stalenessNote = isToday
        ? "(dato di oggi)"
        : `(ultimo dato disponibile — il PSV ${todayIso} non è ancora pubblicato; GME chiude MGP-Gas dopo le 14:30 italiane)`;

      if (priceItems.length >= 2) {
        const prev = priceItems[1];
        const prevPrice = Number(prev.price_eur_mwh);
        const delta = latestPrice - prevPrice;
        const pct = prevPrice ? (delta / prevPrice) * 100 : 0;
        const arrow = delta > 0 ? "▲" : delta < 0 ? "▼" : "▬";
        summary =
          `PSV ${dateLabel}: ${latestPrice.toFixed(2)} €/MWh ${stalenessNote}\n` +
          `Variazione vs ${fmtItalianDate(prev.price_day)} (${prevPrice.toFixed(2)} €/MWh): ${arrow} ${delta >= 0 ? "+" : ""}${delta.toFixed(2)} €/MWh (${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%)`;
      } else {
        summary = `PSV ${dateLabel}: ${latestPrice.toFixed(2)} €/MWh ${stalenessNote}`;
      }
      if (storage) {
        summary += `\nStoccaggi gas IT ${storage.gas_day}: ${Number(storage.full_pct ?? 0).toFixed(1)}% (${Number(storage.gas_in_storage_twh ?? 0).toFixed(2)} TWh, trend ${Number(storage.trend_pct ?? 0).toFixed(2)}%)`;
      }
    } else {
      const prices = priceItems
        .map((r) => Number(r.price_eur_mwh))
        .filter((n) => Number.isFinite(n));
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      summary = `PSV ultimi ${priceItems.length} giorni (${fmtItalianDate(priceItems[priceItems.length - 1].price_day)} → ${dateLabel}) — media ${avg.toFixed(2)} €/MWh, min ${min.toFixed(2)}, max ${max.toFixed(2)}`;
    }
  }

  const items = priceItems.map((r) => ({
    ...r,
    weekday_it: fmtItalianDate(r.price_day).split(" ")[0],
    is_today: r.price_day === todayIso,
  }));

  const preview = priceItems.map((r) => ({
    title: `${fmtItalianDate(r.price_day)}: ${Number(r.price_eur_mwh).toFixed(2)} €/MWh`,
    subtitle: r.source ?? "",
    url: null,
  }));

  return NextResponse.json({
    items,
    storage,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
