import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../_lib/auth";

export const dynamic = "force-dynamic";

type ScadenzaItem = {
  data: string;
  label: string;
  tipo?: string;
  delibera_id: number;
  delibera_numero: string;
  delibera_titolo: string;
};

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const daysAhead = Math.max(1, Number(url.searchParams.get("days_ahead") ?? 30));
  const limit = Math.max(1, Math.min(200, Number(url.searchParams.get("limit") ?? 20)));

  const today = new Date();
  const cutoff = new Date(today);
  cutoff.setDate(cutoff.getDate() + daysAhead);

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("id,numero,titolo,ai_scadenze")
    .not("ai_scadenze", "is", null)
    .limit(500);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const out: ScadenzaItem[] = [];
  for (const d of data ?? []) {
    const scadenze = d.ai_scadenze as
      | Array<{ date: string; label: string; tipo?: string }>
      | null;
    if (!scadenze) continue;
    for (const s of scadenze) {
      if (!s.date) continue;
      const ds = new Date(s.date);
      if (ds >= today && ds <= cutoff) {
        out.push({
          data: s.date,
          label: s.label,
          tipo: s.tipo,
          delibera_id: d.id,
          delibera_numero: d.numero,
          delibera_titolo: d.titolo,
        });
      }
    }
  }
  out.sort((a, b) => a.data.localeCompare(b.data));
  const items = out.slice(0, limit);

  const summary = `${items.length} scadenze nei prossimi ${daysAhead} giorni`;
  const preview = items.map((s) => ({
    title: s.label,
    subtitle: `${s.data} · ${s.delibera_numero}`,
    url: null,
  }));

  return NextResponse.json({
    items,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
