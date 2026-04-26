import { NextResponse } from "next/server";
import { syncScadenzeImminenti } from "@/lib/network/notifications";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * GET /api/cron/notifications-daily
 *
 * Scansiona le scadenze entro 7 giorni e crea notifiche broadcast per i membri
 * (idempotente via dedup_key). Da schedulare ogni mattina via crontab VPS:
 *
 *   0 7 * * * curl -H "Authorization: Bearer $CRON_SECRET" \
 *       https://ildispaccio.energy/api/cron/notifications-daily
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const startedAt = Date.now();
  const created = await syncScadenzeImminenti(7);
  return NextResponse.json({
    ok: true,
    scadenze_created: created,
    duration_ms: Date.now() - startedAt,
  });
}
