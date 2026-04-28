import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneE164 } from "@/lib/network/phone";
import { generateOtpCode, hashOtp } from "@/lib/network/crypto";
import { getNetworkMemberFromRequest } from "@/lib/network/session";
import { sendWhatsAppText } from "@/lib/wasender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ newPhone: z.string().min(6).max(30) });

const OTP_TTL_SECONDS = 300;
const RATE_WINDOW_MINUTES = 15;
const RATE_MAX_PER_MEMBER = 5;

/**
 * POST /api/network/auth/change-phone/request-otp
 * Auth: Bearer (mobile). Invia OTP al NUOVO numero per provare ownership.
 * Quando l'utente verifica, il phone del member viene aggiornato.
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
      { ok: false, error: "Numero non valido." },
      { status: 400 },
    );
  }

  const newPhone = normalizePhoneE164(parsed.newPhone);
  if (!newPhone) {
    return NextResponse.json(
      { ok: false, error: "Numero non valido. Usa il formato +39 333 1234567." },
      { status: 400 },
    );
  }

  if (newPhone === member.phone) {
    return NextResponse.json(
      { ok: false, error: "Questo è già il tuo numero attuale." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // Verifica che il nuovo numero non sia già preso da un altro member attivo.
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
        error: "Questo numero è già associato a un altro account del network.",
      },
      { status: 409 },
    );
  }

  // Rate limit per member su change-phone
  const rateSince = new Date(
    Date.now() - RATE_WINDOW_MINUTES * 60_000,
  ).toISOString();
  const { count: recentCount } = await supabase
    .from("network_otp_codes")
    .select("id", { count: "exact", head: true })
    .eq("member_id", member.id)
    .eq("purpose", "change_phone")
    .gte("created_at", rateSince);

  if ((recentCount ?? 0) >= RATE_MAX_PER_MEMBER) {
    return NextResponse.json(
      {
        ok: false,
        error: "Troppi tentativi. Riprova tra qualche minuto.",
      },
      { status: 429 },
    );
  }

  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

  const { error: insertError } = await supabase
    .from("network_otp_codes")
    .insert({
      phone: newPhone,
      code_hash: codeHash,
      expires_at: expiresAt,
      purpose: "change_phone",
      member_id: member.id,
    });

  if (insertError) {
    console.error("change-phone otp insert failed", insertError);
    return NextResponse.json(
      { ok: false, error: "Errore invio codice. Riprova." },
      { status: 500 },
    );
  }

  const text = `Il Dispaccio — Codice cambio numero: ${code}\nValido 5 minuti. Se non hai richiesto tu il cambio, ignora questo messaggio.`;
  try {
    await sendWhatsAppText(newPhone, text);
  } catch (err) {
    console.error("wasender change-phone send failed", err);
    return NextResponse.json(
      { ok: false, error: "Invio WhatsApp non riuscito. Riprova tra poco." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, expiresInSeconds: OTP_TTL_SECONDS });
}
