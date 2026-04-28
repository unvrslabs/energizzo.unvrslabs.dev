import { NextResponse, type NextRequest } from "next/server";
import { requireNetworkFromRequest } from "@/lib/network/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { listDelibere } from "@/lib/delibere/db";
import { listScadenzeFuture, SCADENZA_LABEL } from "@/lib/delibere/scadenze";
import { deriveSectorsFromNumero } from "@/lib/delibere/api";
import { getLatestPun, listPunHistory } from "@/lib/market/power-pun-db";
import { getLatestGasStorage } from "@/lib/market/storage-db";
import { getLatestEntsoe } from "@/lib/market/entsoe-db";
import { getLatestPsv, listPsvHistory } from "@/lib/market/gas-psv-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dashboard mobile: stats + liste pronte per il rendering.
 * Cookie OR Authorization: Bearer.
 */
export async function GET(req: NextRequest) {
  const auth = await requireNetworkFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const supabase = createAdminClient();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [
    delibereTotal,
    delibere30dRes,
    notificationsRes,
    recentDelibere,
    scadenze,
    punLatest,
    punHistory14,
    gasLatest,
    loadRow,
    renewRow,
    psvLatest,
    psvHistory14,
  ] = await Promise.all([
    supabase
      .from("delibere_cache")
      .select("*", { count: "exact", head: true })
      .in("numero_suffix", ["eel", "gas", "com"]),
    supabase
      .from("delibere_cache")
      .select("*", { count: "exact", head: true })
      .in("numero_suffix", ["eel", "gas", "com"])
      .gte("created_at", thirtyDaysAgo),
    supabase
      .from("network_notifications")
      .select("*", { count: "exact", head: true })
      .eq("member_id", auth.member.id)
      .is("read_at", null),
    listDelibere({ limit: 5 }),
    listScadenzeFuture(),
    getLatestPun(),
    listPunHistory(14),
    getLatestGasStorage(),
    getLatestEntsoe("load_forecast"),
    getLatestEntsoe("renewable_forecast"),
    getLatestPsv(),
    listPsvHistory(14),
  ]);

  type LoadPayload = {
    reference_day: string;
    hourly_mw: number[];
    peak_mw: number;
    peak_hour: number;
    min_mw: number;
    min_hour: number;
    avg_mw: number;
    total_mwh: number;
  };
  type RenewablePayload = {
    reference_day: string;
    solar_hourly_mw: number[];
    wind_hourly_mw: number[];
    solar_peak_mw: number;
    wind_peak_mw: number;
    solar_total_mwh: number;
    wind_total_mwh: number;
    combined_total_mwh: number;
  };
  const loadPayload = (loadRow?.payload as LoadPayload | undefined) ?? null;
  const renewPayload = (renewRow?.payload as RenewablePayload | undefined) ?? null;

  // PUN delta vs 7gg fa
  let punDeltaPct: number | null = null;
  if (punLatest && punHistory14.length > 1) {
    const sevenIso = sevenDaysAgo.slice(0, 10);
    const weekAgoRow =
      punHistory14.find((row) => row.price_day <= sevenIso) ??
      punHistory14[punHistory14.length - 1];
    if (weekAgoRow && weekAgoRow.price_eur_mwh > 0) {
      punDeltaPct =
        ((punLatest.price_eur_mwh - weekAgoRow.price_eur_mwh) /
          weekAgoRow.price_eur_mwh) *
        100;
    }
  }

  // PSV delta vs 7gg fa
  let psvDeltaPct: number | null = null;
  if (psvLatest && psvHistory14.length > 1) {
    const sevenIso = sevenDaysAgo.slice(0, 10);
    const weekAgoRow =
      psvHistory14.find((row) => row.price_day <= sevenIso) ??
      psvHistory14[psvHistory14.length - 1];
    if (weekAgoRow && weekAgoRow.price_eur_mwh > 0) {
      psvDeltaPct =
        ((psvLatest.price_eur_mwh - weekAgoRow.price_eur_mwh) /
          weekAgoRow.price_eur_mwh) *
        100;
    }
  }

  return NextResponse.json({
    ok: true,
    member: {
      id: auth.member.id,
      ragione_sociale: auth.member.ragione_sociale,
      referente: auth.member.referente,
    },
    stats: {
      delibereTotal: delibereTotal.count ?? 0,
      delibere30d: delibere30dRes.count ?? 0,
      scadenzeFuture: scadenze.length,
      notificationsUnread: notificationsRes.count ?? 0,
    },
    pun: punLatest
      ? {
          eurPerMwh: Number(punLatest.price_eur_mwh.toFixed(2)),
          day: punLatest.price_day,
          deltaPct: punDeltaPct !== null ? Number(punDeltaPct.toFixed(2)) : null,
          history: punHistory14
            .slice()
            .sort((a, b) => (a.price_day < b.price_day ? -1 : 1))
            .map((row) => ({
              day: row.price_day,
              value: Number(row.price_eur_mwh.toFixed(2)),
            })),
        }
      : null,
    gas:
      gasLatest && gasLatest.full_pct !== null
        ? {
            storagePct: Number(gasLatest.full_pct.toFixed(1)),
            day: gasLatest.gas_day,
            trendPct:
              gasLatest.trend_pct !== null
                ? Number(gasLatest.trend_pct.toFixed(2))
                : null,
          }
        : null,
    psv: psvLatest
      ? {
          eurPerMwh: Number(psvLatest.price_eur_mwh.toFixed(2)),
          day: psvLatest.price_day,
          deltaPct: psvDeltaPct !== null ? Number(psvDeltaPct.toFixed(2)) : null,
          source: psvLatest.source,
          history: psvHistory14
            .slice()
            .sort((a, b) => (a.price_day < b.price_day ? -1 : 1))
            .map((row) => ({
              day: row.price_day,
              value: Number(row.price_eur_mwh.toFixed(2)),
            })),
        }
      : null,
    recentDelibere: recentDelibere.map((d) => ({
      code: d.numero,
      title: d.titolo,
      date: d.scraped_data_pubblicazione ?? d.data_pubblicazione ?? d.data_delibera,
      sectors: d.ai_sectors ?? deriveSectorsFromNumero(d.numero),
      importanza: d.ai_importanza,
      summary: d.ai_summary,
    })),
    loadForecast: loadPayload
      ? {
          referenceDay: loadPayload.reference_day,
          hourlyMw: loadPayload.hourly_mw,
          peakMw: loadPayload.peak_mw,
          peakHour: loadPayload.peak_hour,
          minMw: loadPayload.min_mw,
          minHour: loadPayload.min_hour,
          avgMw: loadPayload.avg_mw,
          totalMwh: loadPayload.total_mwh,
        }
      : null,
    renewableForecast: renewPayload
      ? {
          referenceDay: renewPayload.reference_day,
          solarHourlyMw: renewPayload.solar_hourly_mw,
          windHourlyMw: renewPayload.wind_hourly_mw,
          solarPeakMw: renewPayload.solar_peak_mw,
          windPeakMw: renewPayload.wind_peak_mw,
          solarTotalMwh: renewPayload.solar_total_mwh,
          windTotalMwh: renewPayload.wind_total_mwh,
          combinedTotalMwh: renewPayload.combined_total_mwh,
        }
      : null,
    nextScadenze: scadenze.slice(0, 5).map((s) => ({
      date: s.date,
      label: s.label,
      tipo: s.tipo,
      tipoLabel: SCADENZA_LABEL[s.tipo],
      deliberaCode: s.deliberaNumero,
      deliberaTitolo: s.deliberaTitolo,
    })),
  });
}
