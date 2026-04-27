import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../_lib/auth";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const url = new URL(req.url);
  const sinceHours = Math.max(1, Number(url.searchParams.get("since_hours") ?? 24));
  const limit = Math.max(1, Math.min(100, Number(url.searchParams.get("limit") ?? 20)));

  const cutoff = new Date(Date.now() - sinceHours * 3600 * 1000).toISOString();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("network_notifications")
    .select("id,severity,title,body,link,created_at")
    .is("member_id", null)
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  const items = data ?? [];

  const summary = `${items.length} notifiche broadcast nelle ultime ${sinceHours} ore`;
  const preview = items.map((n) => ({
    title: n.title ?? "(senza titolo)",
    subtitle: n.created_at ?? "",
    url: n.link ?? null,
  }));

  return NextResponse.json({
    items,
    summary,
    preview,
    fetched_at: new Date().toISOString(),
  });
}
