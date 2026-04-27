import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../_lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").trim();
  const limit = Math.max(1, Math.min(50, Number(url.searchParams.get("limit") ?? 15)));

  const supabase = await createClient();
  let query = supabase
    .from("testi_integrati_cache")
    .select("id,codice,titolo,settore,data_entrata_vigore,ai_summary");

  if (q) {
    query = query.or(
      `codice.ilike.%${q}%,titolo.ilike.%${q}%,ai_summary.ilike.%${q}%`,
    );
  } else {
    query = query.order("data_entrata_vigore", {
      ascending: false,
      nullsFirst: false,
    });
  }

  const { data, error } = await query.limit(limit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const items = data ?? [];

  const summary = q
    ? `${items.length} Testi Integrati trovati per "${q}"`
    : `Ultimi ${items.length} Testi Integrati ARERA`;
  const preview = items.map((t) => ({
    title: `${t.codice ?? ""} ${t.titolo ?? ""}`.trim(),
    subtitle: t.settore ?? "",
    url: null,
  }));

  return NextResponse.json({
    items,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
