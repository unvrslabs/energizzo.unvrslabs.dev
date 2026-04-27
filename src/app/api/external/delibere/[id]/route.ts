import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkBearerAuth } from "../../_lib/auth";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authErr = checkBearerAuth(req);
  if (authErr) return authErr;

  const { id: idStr } = await params;
  const id = Number(idStr);
  if (!id) {
    return NextResponse.json({ error: "id invalido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select(
      "id,numero,numero_suffix,titolo,descrizione,data_pubblicazione,scraped_data_pubblicazione,settore,stato,ai_summary,ai_bullets,ai_scadenze,ai_importanza,ai_categoria_impatto,url_riferimento,documento_url",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) {
    return NextResponse.json({ error: "delibera non trovata" }, { status: 404 });
  }

  return NextResponse.json({
    items: [data],
    summary: data.ai_summary ?? `${data.numero} — ${data.titolo}`,
    preview: [
      {
        title: `${data.numero} — ${data.titolo}`,
        subtitle: data.ai_categoria_impatto ?? data.ai_importanza ?? "",
        url: data.url_riferimento ?? null,
      },
    ],
    fetched_at: new Date().toISOString(),
  });
}
