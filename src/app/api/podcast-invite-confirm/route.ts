import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const BodySchema = z.object({
  token: z.string().uuid(),
  name: z.string().min(1).max(200),
  whatsapp: z.string().min(5).max(50),
  availability: z.string().max(2000).nullable().optional(),
});

export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Input non valido" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("confirm_podcast_invite", {
    p_token: parsed.token,
    p_name: parsed.name,
    p_whatsapp: parsed.whatsapp,
    p_availability: parsed.availability ?? null,
  });

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  const result = data as { ok: boolean; error?: string } | null;
  if (!result || !result.ok) {
    return NextResponse.json(
      { ok: false, error: result?.error ?? "Errore" },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
