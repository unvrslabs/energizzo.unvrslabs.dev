import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNetworkMemberFromRequest } from "@/lib/network/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  expoToken: z.string().min(20).max(200),
  platform: z.enum(["ios", "android"]),
  deviceName: z.string().max(120).optional().nullable(),
});

/**
 * POST /api/network/push-token/register
 * Mobile registra/aggiorna il proprio Expo push token.
 * Auth: Bearer (mobile only).
 */
export async function POST(req: NextRequest) {
  const member = await getNetworkMemberFromRequest(req);
  if (!member) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Dati non validi." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Upsert per token: se esiste già, aggiorna member + last_used_at.
  // Permette migrazione token tra account sullo stesso device.
  const { error } = await supabase
    .from("network_push_tokens")
    .upsert(
      {
        member_id: member.id,
        expo_token: parsed.expoToken,
        platform: parsed.platform,
        device_name: parsed.deviceName ?? null,
        last_used_at: nowIso,
      },
      { onConflict: "expo_token" },
    );

  if (error) {
    console.error("push-token register failed:", error);
    return NextResponse.json(
      { ok: false, error: "DB error" },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
