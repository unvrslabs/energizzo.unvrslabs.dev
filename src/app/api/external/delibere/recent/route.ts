import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth, importanceGte, type Importance } from "../../_lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const sinceDays = Math.max(1, Number(url.searchParams.get("since_days") ?? 7));
  const minImportance = (url.searchParams.get("min_importance") ?? "alta") as Importance;
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 10)));

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - sinceDays);
  const cutoffIso = cutoff.toISOString().slice(0, 10);

  const supabase = await createClient();
  // data_pubblicazione è quasi sempre null. scraped_data_pubblicazione lo
  // riempie quando lo scraper trova la data sul portale ARERA. Per le
  // delibere appena importate da Energizzo entrambi i campi possono essere
  // null: in quel caso usiamo created_at come proxy ("entrate nel sistema
  // negli ultimi N giorni") così non scompaiono dalla coda.
  const { data, error } = await supabase
    .from("delibere_cache")
    .select(
      "id,numero,titolo,ai_summary,ai_importanza,ai_categoria_impatto,data_pubblicazione,scraped_data_pubblicazione,url_riferimento,created_at",
    )
    .in("numero_suffix", ["eel", "gas", "com"])
    .or(
      `data_pubblicazione.gte.${cutoffIso},scraped_data_pubblicazione.gte.${cutoffIso},created_at.gte.${cutoffIso}`,
    )
    .order("created_at", { ascending: false })
    .limit(limit * 3);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const filtered = (data ?? [])
    .filter((d) => importanceGte(d.ai_importanza, minImportance))
    .slice(0, limit);

  const summary = filtered.length
    ? `Ultime ${filtered.length} delibere ${minImportance}+:\n${filtered
        .map((d) => `- ${d.numero} — ${d.titolo}`)
        .join("\n")}`
    : `Nessuna delibera ${minImportance}+ negli ultimi ${sinceDays} giorni`;

  const preview = filtered.map((d) => ({
    title: `${d.numero} — ${d.titolo}`,
    subtitle: d.ai_categoria_impatto ?? d.ai_importanza ?? "",
    url: d.url_riferimento ?? null,
  }));

  return NextResponse.json({
    items: filtered,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
