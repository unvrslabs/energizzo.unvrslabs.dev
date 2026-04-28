import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneE164 } from "@/lib/network/phone";
import { hashOtp } from "@/lib/network/crypto";
import { getNetworkMemberFromRequest } from "@/lib/network/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  newPhone: z.string().min(6).max(30),
  code: z.string().regex(/^\d{6}$/, "Il codice deve essere di 6 cifre."),
});

const MAX_ATTEMPTS = 5;

/**
 * POST /api/network/auth/change-phone/verify-otp
 * Auth: Bearer. Verifica OTP inviato al newPhone, aggiorna phone del member.
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

  const newPhone = normalizePhoneE164(parsed.newPhone);
  if (!newPhone) {
    return NextResponse.json(
      { ok: false, error: "Numero non valido." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();

  // Cerca l'OTP più recente non consumato per questo member + newPhone + purpose
  const { data: otp, error: otpErr } = await supabase
    .from("network_otp_codes")
    .select("id, code_hash, attempts, expires_at")
    .eq("phone", newPhone)
    .eq("purpose", "change_phone")
    .eq("member_id", member.id)
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (otpErr) {
    console.error("change-phone verify lookup failed", otpErr);
    return NextResponse.json(
      { ok: false, error: "Errore temporaneo. Riprova." },
      { status: 500 },
    );
  }
  if (!otp) {
    return NextResponse.json(
      { ok: false, error: "Codice non valido o scaduto. Richiedine uno nuovo." },
      { status: 400 },
    );
  }

  const newAttempts = otp.attempts + 1;
  const inputHash = hashOtp(parsed.code);
  const isMatch = inputHash === otp.code_hash;

  if (!isMatch) {
    if (newAttempts >= MAX_ATTEMPTS) {
      await supabase
        .from("network_otp_codes")
        .update({ attempts: newAttempts, consumed_at: nowIso })
        .eq("id", otp.id)
        .is("consumed_at", null);
      return NextResponse.json(
        { ok: false, error: "Troppi tentativi. Richiedi un nuovo codice." },
        { status: 429 },
      );
    }
    await supabase
      .from("network_otp_codes")
      .update({ attempts: newAttempts })
      .eq("id", otp.id);
    return NextResponse.json(
      { ok: false, error: "Codice errato." },
      { status: 400 },
    );
  }

  // Race protection: dopo aver verificato il codice, ri-controlla che il newPhone
  // non sia stato preso da qualcun altro nel frattempo.
  const { data: clash } = await supabase
    .from("network_members")
    .select("id")
    .eq("phone", newPhone)
    .is("revoked_at", null)
    .maybeSingle();
  if (clash && clash.id !== member.id) {
    return NextResponse.json(
      {
        ok: false,
        error: "Questo numero è stato appena associato a un altro account.",
      },
      { status: 409 },
    );
  }

  // Consume OTP + update member phone in transazione (sequenziale, ok per un'app piccola)
  await supabase
    .from("network_otp_codes")
    .update({ consumed_at: nowIso, attempts: newAttempts })
    .eq("id", otp.id);

  const { error: updErr } = await supabase
    .from("network_members")
    .update({ phone: newPhone })
    .eq("id", member.id);

  if (updErr) {
    console.error("change-phone member update failed", updErr);
    return NextResponse.json(
      { ok: false, error: "Errore aggiornamento numero. Riprova." },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true, phone: newPhone });
}
