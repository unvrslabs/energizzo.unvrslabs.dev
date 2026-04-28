import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getNetworkMember, getNetworkMemberFromRequest } from "@/lib/network/session";

export const dynamic = "force-dynamic";

/**
 * GET /api/network/agent-chat/mention?q=<query>
 * Autocomplete delibere per menu @ nel drawer chat.
 * Auth: cookie (web) OR Bearer (mobile).
 */
export async function GET(req: NextRequest) {
  const [memberCookie, memberBearer] = await Promise.all([
    getNetworkMember(),
    getNetworkMemberFromRequest(req),
  ]);
  if (!memberCookie && !memberBearer) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const supabase = await createClient();

  let query = supabase
    .from("delibere_cache")
    .select(
      "id,numero,titolo,data_pubblicazione,settore,ai_importanza,ai_summary",
    )
    .order("data_pubblicazione", { ascending: false, nullsFirst: false });

  if (q.length > 0) {
    query = query.or(`numero.ilike.%${q}%,titolo.ilike.%${q}%`);
  }
  query = query.limit(10);

  const { data, error } = await query;
  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const items = (data ?? []).map((d) => ({
    id: d.id,
    numero: d.numero,
    titolo: (d.titolo ?? "").slice(0, 120),
    data: d.data_pubblicazione?.slice(0, 10) ?? null,
    settore: d.settore,
    importanza: d.ai_importanza,
    has_analysis: Boolean(d.ai_summary),
  }));

  return NextResponse.json({ ok: true, items });
}
