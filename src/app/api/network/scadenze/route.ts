import { NextResponse, type NextRequest } from "next/server";
import { requireNetworkFromRequest } from "@/lib/network/session";
import { listScadenzeFuture, SCADENZA_LABEL } from "@/lib/delibere/scadenze";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lista completa scadenze future, raggruppate per mese.
 * Auth: cookie OR Authorization: Bearer.
 */
export async function GET(req: NextRequest) {
  const auth = await requireNetworkFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const all = await listScadenzeFuture();

  return NextResponse.json({
    ok: true,
    total: all.length,
    items: all.map((s) => ({
      date: s.date,
      label: s.label,
      tipo: s.tipo,
      tipoLabel: SCADENZA_LABEL[s.tipo],
      deliberaCode: s.deliberaNumero,
      deliberaTitolo: s.deliberaTitolo,
    })),
  });
}
