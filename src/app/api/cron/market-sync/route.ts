import { NextResponse } from "next/server";
import { fetchPunForDay } from "@/lib/market/power-pun";
import { getLatestPun, upsertPun } from "@/lib/market/power-pun-db";

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
          `${iso}: ${err instanceof Error ? err.message : String(err)}`,
        );
      }
    }
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
