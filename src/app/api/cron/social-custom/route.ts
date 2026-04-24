import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  generateAndInsert,
  type SocialPostTipo,
} from "@/lib/social/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * POST /api/cron/social-custom
 * Body: { tipo: SocialPostTipo, brief?: string, force_ai?: boolean, fonte_kind?, fonte_id?, notes? }
 * Auth: Bearer CRON_SECRET
 *
 * Genera un singolo post on-demand con brief custom.
 * Usato per post speciali (lancio account, annunci, evento una-tantum).
 */
export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json(
      { ok: false, error: "body json non valido" },
      { status: 400 },
    );
  }

  const tipo = String(body.tipo ?? "libero") as SocialPostTipo;
  const baseBrief = body.brief ? String(body.brief) : "";
  const forceAi = Boolean(body.force_ai);
  const fonte_kind = body.fonte_kind ? String(body.fonte_kind) : null;
  const fonte_id = body.fonte_id ? String(body.fonte_id) : null;
  const notes = body.notes ? String(body.notes) : "🧑‍💻 Custom one-shot";

  const aiOverride = forceAi
    ? `\n\nIMAGE_STRATEGY OVERRIDE: devi generare ESCLUSIVAMENTE image_strategy.type="ai" con ai_prompt molto dettagliato (100-160 parole) in inglese per un'immagine editoriale d'impatto. Stile: cinematic, atmospheric, dark emerald accents, high contrast, no text on image, professional energy sector aesthetic.`
    : "";

  const supabase = await createClient();
  const started = Date.now();

  try {
    const post = await generateAndInsert(
      supabase,
      {
        tipo,
        fonte_kind,
        fonte_id,
        brief: (baseBrief + aiOverride) || undefined,
      },
      { generatedBy: "manual", notes },
    );
    const p = post as Record<string, unknown>;
    return NextResponse.json({
      ok: true,
      took_ms: Date.now() - started,
      id: p.id,
      tipo: p.tipo,
      hook: p.hook,
      image_url: p.image_url ?? null,
      image_template: p.image_template,
      copy_linkedin_preview: String(p.copy_linkedin ?? "").slice(0, 240),
    });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
        took_ms: Date.now() - started,
      },
      { status: 500 },
    );
  }
}
