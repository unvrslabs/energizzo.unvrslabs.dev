import { NextResponse, type NextRequest } from "next/server";
import { requireNetworkFromRequest } from "@/lib/network/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { countScadenzeFuture } from "@/lib/delibere/scadenze";
import { getLatestPun, listPunHistory } from "@/lib/market/power-pun-db";
import { getLatestGasStorage } from "@/lib/market/storage-db";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Aggregato stats per la home mobile (e potenzialmente desktop).
 * Cookie OR Authorization: Bearer.
 */
export async function GET(req: NextRequest) {
  const auth = await requireNetworkFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const supabase = createAdminClient();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    delibereTotalRes,
    delibere30dRes,
    scadenzeCount,
    notificationsRes,
    punLatest,
    punHistory,
    gasLatest,
  ] = await Promise.all([
    supabase
      .from("delibere_cache")
      .select("*", { count: "exact", head: true }),
    supabase
      .from("delibere_cache")
      .select("*", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgo),
    countScadenzeFuture(),
    supabase
      .from("network_notifications")
      .select("*", { count: "exact", head: true })
      .eq("member_id", auth.member.id)
      .is("read_at", null),
    getLatestPun(),
    listPunHistory(8),
    getLatestGasStorage(),
  ]);

  // PUN delta vs ~7gg fa
  let punDeltaPct: number | null = null;
  if (punLatest && punHistory.length > 1) {
    const sevenDaysIso = sevenDaysAgo.slice(0, 10);
    const weekAgoRow =
      punHistory.find((row) => row.price_day <= sevenDaysIso) ??
      punHistory[punHistory.length - 1];
    if (weekAgoRow && weekAgoRow.price_eur_mwh > 0) {
      punDeltaPct =
        ((punLatest.price_eur_mwh - weekAgoRow.price_eur_mwh) /
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
    delibere: {
      total: delibereTotalRes.count ?? 0,
      last30Days: delibere30dRes.count ?? 0,
    },
    scadenze: {
      future: scadenzeCount,
    },
    notifications: {
      unread: notificationsRes.count ?? 0,
    },
    pun: punLatest
      ? {
          eurPerMwh: Number(punLatest.price_eur_mwh.toFixed(2)),
          day: punLatest.price_day,
          deltaPct: punDeltaPct !== null ? Number(punDeltaPct.toFixed(2)) : null,
        }
      : null,
    gas:
      gasLatest && gasLatest.full_pct !== null
        ? {
            storagePct: Number(gasLatest.full_pct.toFixed(1)),
            day: gasLatest.gas_day,
          }
        : null,
  });
}
