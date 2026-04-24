import { NextResponse } from "next/server";
import { fetchPunForDay } from "@/lib/market/power-pun";
import { getLatestPun, upsertPun } from "@/lib/market/power-pun-db";
import {
  fetchGenerationMix,
  fetchLoadForecast,
  fetchRenewableForecast,
  fetchCrossBorderFlows,
} from "@/lib/market/entsoe-fetchers";
import { getLatestEntsoe, upsertEntsoe } from "@/lib/market/entsoe-db";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * GET /api/cron/market-sync
 *
 * Sincronizza PUN stimato per i giorni mancanti fino a ieri.
 * Da chiamare una volta al giorno dal crontab VPS:
 *
 *   30 6 * * * curl -H "Authorization: Bearer $CRON_SECRET" \
 *       https://ildispaccio.energy/api/cron/market-sync
 *
 * Idempotente: upsert per price_day unique.
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const startedAt = Date.now();
  const stats = {
    pun_synced: 0,
    pun_skipped: 0,
    generation_mix_synced: 0,
    load_forecast_synced: 0,
    renewable_forecast_synced: 0,
    cross_border_synced: 0,
    errors: [] as string[],
    latest_day_in_db: null as string | null,
    latest_day_synced: null as string | null,
    took_ms: 0,
  };

  try {
    const latest = await getLatestPun();
    stats.latest_day_in_db = latest?.price_day ?? null;

    // Vai da ultimo giorno+1 a ieri (dato ENTSO-E del giorno corrente incompleto)
    const yesterday = new Date();
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    const endIso = yesterday.toISOString().slice(0, 10);

    const startDate = latest
      ? (() => {
          const d = new Date(latest.price_day);
          d.setUTCDate(d.getUTCDate() + 1);
          return d;
        })()
      : (() => {
          const d = new Date();
          d.setUTCDate(d.getUTCDate() - 14); // primo avvio: recupera 14 giorni
          return d;
        })();

    const end = new Date(endIso);

    for (
      let d = new Date(startDate);
      d <= end;
      d.setUTCDate(d.getUTCDate() + 1)
    ) {
      const iso = d.toISOString().slice(0, 10);
      try {
        const row = await fetchPunForDay(iso);
        if (!row) {
          stats.pun_skipped++;
          continue;
        }
        await upsertPun(row);
        stats.pun_synced++;
        stats.latest_day_synced = iso;
      } catch (err) {
        stats.errors.push(
          `pun ${iso}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }

    // ─── Sync ENTSO-E extra indicators ──────────────────
    // Per ciascuno: sync solo l'ultimo giorno mancante (non backfill completo)
    const yesterdayIso = endIso;
    const todayIso = new Date().toISOString().slice(0, 10);

    const syncMetric = async (
      metric:
        | "generation_mix"
        | "load_forecast"
        | "renewable_forecast"
        | "cross_border_flows",
      fetcher: (day: string) => Promise<unknown | null>,
      statKey: keyof typeof stats,
      allowToday = false,
    ) => {
      try {
        const existing = await getLatestEntsoe(metric);
        const targetDay = allowToday ? todayIso : yesterdayIso;
        if (existing && existing.reference_day >= targetDay) return;
        const data = await fetcher(targetDay);
        if (!data) return;
        await upsertEntsoe({
          metric_type: metric,
          reference_day: targetDay,
          payload: data as Record<string, unknown>,
        });
        (stats[statKey] as number)++;
      } catch (err) {
        stats.errors.push(
          `${metric}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    };

    // Generation mix: dato "Realised" → ha senso il giorno passato
    await syncMetric("generation_mix", fetchGenerationMix, "generation_mix_synced");
    // Load forecast day-ahead: ha senso chiedere OGGI (dati pubblicati serata prima)
    await syncMetric("load_forecast", fetchLoadForecast, "load_forecast_synced", true);
    // Renewable forecast day-ahead: come sopra
    await syncMetric(
      "renewable_forecast",
      fetchRenewableForecast,
      "renewable_forecast_synced",
      true,
    );
    // Cross-border flows: physical flows giorno passato (finalizzati)
    await syncMetric("cross_border_flows", fetchCrossBorderFlows, "cross_border_synced");
  } catch (err) {
    stats.errors.push(
      `top-level: ${err instanceof Error ? err.message : String(err)}`,
    );
  }

  stats.took_ms = Date.now() - startedAt;
  return NextResponse.json(stats, {
    status: stats.errors.length && stats.pun_synced === 0 ? 500 : 200,
  });
}
