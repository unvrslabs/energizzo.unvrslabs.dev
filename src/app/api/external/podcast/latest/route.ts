import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../../_lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const limit = Math.max(1, Math.min(20, Number(url.searchParams.get("limit") ?? 3)));

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_guests")
    .select(
      "id,episode_title,episode_url,external_name,external_company,external_role,category,status,published_at,recorded_at,selected_episode_slug,notes",
    )
    .eq("status", "published")
    .not("published_at", "is", null)
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(limit);

  if (error) {
    return NextResponse.json({
      items: [],
      summary: `Tabella podcast non disponibile: ${error.message}`,
      preview: [],
      fetched_at: new Date().toISOString(),
    });
  }

  const items = data ?? [];
  const summary = items.length
    ? `Ultimi ${items.length} episodi pubblicati de "Il Reseller":\n${items
        .map((e) => `- ${e.episode_title ?? "(senza titolo)"} — ${e.external_name ?? ""}`)
        .join("\n")}`
    : "Nessun episodio podcast pubblicato";

  const preview = items.map((e) => ({
    title: e.episode_title ?? "(senza titolo)",
    subtitle: [e.external_name, e.external_company].filter(Boolean).join(" · "),
    url: e.episode_url ?? null,
  }));

  return NextResponse.json({
    items,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
