import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneE164 } from "@/lib/network/phone";
import { generateOtpCode, hashOtp } from "@/lib/network/crypto";
import { sendWhatsAppText } from "@/lib/wasender";
import { getNetworkMember } from "@/lib/network/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ phone: z.string().min(6).max(30) });

const OTP_TTL_SECONDS = 300;
const RATE_WINDOW_MINUTES = 15;
const RATE_MAX_PER_MEMBER = 3;

function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

export async function POST(req: NextRequest) {
  const member = await getNetworkMember();
  if (!member) {
    return NextResponse.json({ ok: false, error: "Non autorizzato." }, { status: 401 });
  }

  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ ok: false, error: "Numero non valido." }, { status: 400 });
  }

  const newPhone = normalizePhoneE164(parsed.phone);
  if (!newPhone) {
    return NextResponse.json(
      { ok: false, error: "Numero non valido. Usa il formato +39 333 1234567." },
      { status: 400 },
    );
  }

  if (newPhone === member.phone) {
    return NextResponse.json(
      { ok: false, error: "È già il tuo numero attuale." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();

  // Verifica che il nuovo numero non sia già usato da un altro membro
  const { data: existing } = await supabase
    .from("network_members")
    .select("id")
    .eq("phone", newPhone)
    .is("revoked_at", null)
    .maybeSingle();
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "Questo numero è già associato a un altro account network." },
      { status: 409 },
    );
  }

  // Rate limit per membro
  const rateSince = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000).toISOString();
  const { count: recentCount } = await supabase
    .from("network_otp_codes")
    .select("id", { count: "exact", head: true })
    .eq("member_id", member.id)
    .eq("purpose", "change_phone")
    .gte("created_at", rateSince);

  if ((recentCount ?? 0) >= RATE_MAX_PER_MEMBER) {
    return NextResponse.json(
      { ok: false, error: "Troppe richieste. Riprova tra qualche minuto." },
      { status: 429 },
    );
  }

  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

  const { error: insertError } = await supabase.from("network_otp_codes").insert({
    phone: newPhone,
    code_hash: codeHash,
    expires_at: expiresAt,
    purpose: "change_phone",
    member_id: member.id,
    ip: clientIp(req),
    user_agent: req.headers.get("user-agent"),
  });

  if (insertError) {
    console.error("change-phone otp insert failed", insertError);
    return NextResponse.json(
      { ok: false, error: "Errore invio codice. Riprova." },
      { status: 500 },
    );
  }

  const text = `Il Dispaccio — Codice verifica nuovo numero: ${code}\nValido 5 minuti. Se non hai richiesto tu il cambio, ignora questo messaggio.`;
  try {
    await sendWhatsAppText(newPhone, text);
  } catch (err) {
    console.error("wasender send failed", err);
    return NextResponse.json(
      { ok: false, error: "Invio WhatsApp non riuscito. Verifica il numero." },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, expiresInSeconds: OTP_TTL_SECONDS });
}
