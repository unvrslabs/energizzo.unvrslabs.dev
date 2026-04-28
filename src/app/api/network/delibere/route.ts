import { NextResponse, type NextRequest } from "next/server";
import { requireNetworkFromRequest } from "@/lib/network/session";
import { listDelibere } from "@/lib/delibere/db";
import { deriveSectorsFromNumero, type UiSector } from "@/lib/delibere/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lista delibere paginata con filtri per il mobile.
 * Query: q, sector (eel|gas|com), importanza (critica|alta|normale|bassa),
 *        limit (default 20, max 100), offset (default 0).
 * Auth: cookie OR Authorization: Bearer.
 */
export async function GET(req: NextRequest) {
  const auth = await requireNetworkFromRequest(req);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, error: auth.error }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();
  const sector = url.searchParams.get("sector") as UiSector | null;
  const importanza = url.searchParams.get("importanza");
  const limit = Math.min(100, Math.max(1, Number(url.searchParams.get("limit") ?? "20")));
  const offset = Math.max(0, Number(url.searchParams.get("offset") ?? "0"));

  // Carica tutto poi filtra in memoria — semplice e ok per <1000 delibere.
  const all = await listDelibere({ limit: 500 });
  const enriched = all
    .map((d) => ({
      d,
      sectors: deriveSectorsFromNumero(d.numero),
    }))
    .filter(({ sectors }) => sectors.length > 0);

  let filtered = enriched;
  if (sector) {
    filtered = filtered.filter(({ sectors }) =>
      sectors.includes(sector as UiSector),
    );
  }
  if (importanza) {
    filtered = filtered.filter(({ d }) => d.ai_importanza === importanza);
  }
  if (q.length >= 2) {
    filtered = filtered.filter(({ d }) =>
      d.titolo.toLowerCase().includes(q) ||
      d.numero.toLowerCase().includes(q) ||
      (d.ai_summary?.toLowerCase().includes(q) ?? false),
    );
  }

  const total = filtered.length;
  const slice = filtered.slice(offset, offset + limit);

  return NextResponse.json({
    ok: true,
    total,
    limit,
    offset,
    items: slice.map(({ d, sectors }) => ({
      code: d.numero,
      title: d.titolo,
      date:
        d.scraped_data_pubblicazione ??
        d.data_pubblicazione ??
        d.data_delibera ??
        d.api_created_at ??
        d.created_at,
      sectors,
      importanza: d.ai_importanza,
      summary: d.ai_summary,
      hasSummary: !!d.ai_generated_at && !!d.ai_summary,
      categoriaImpatto: d.ai_categoria_impatto,
      bullets: d.ai_bullets,
    })),
  });
}
