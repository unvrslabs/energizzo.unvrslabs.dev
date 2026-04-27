import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneE164 } from "@/lib/network/phone";
import {
  generateSessionToken,
  hashOtp,
  hashSessionToken,
} from "@/lib/network/crypto";
import { NETWORK_SESSION_TTL_DAYS } from "@/lib/network/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({
  phone: z.string().min(6).max(30),
  code: z.string().regex(/^\d{6}$/, "Il codice deve essere di 6 cifre."),
});

const MAX_ATTEMPTS = 5;
const IP_VERIFY_WINDOW_MS = 15 * 60 * 1000;
const IP_VERIFY_MAX = 30;

function clientIp(req: NextRequest): string | null {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    null
  );
}

/**
 * Verify OTP per client mobile (no cookie httpOnly).
 * Stessa logica di /verify-otp ma ritorna il sessionToken in JSON,
 * cosi' il mobile lo salva in expo-secure-store e lo manda come
 * Authorization: Bearer <token> nelle richieste autenticate.
 */
export async function POST(req: NextRequest) {
  let parsed;
  try {
    parsed = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json(
      { ok: false, error: "Dati non validi." },
      { status: 400 },
    );
  }

  const phone = normalizePhoneE164(parsed.phone);
  if (!phone) {
    return NextResponse.json(
      { ok: false, error: "Numero non valido." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const nowIso = new Date().toISOString();
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent");

  if (ip) {
    const since = new Date(Date.now() - IP_VERIFY_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("network_sessions")
      .select("id", { count: "exact", head: true })
      .eq("ip", ip)
      .gte("created_at", since);
    if ((count ?? 0) > IP_VERIFY_MAX) {
      return NextResponse.json(
        { ok: false, error: "Troppi tentativi. Riprova più tardi." },
        { status: 429 },
      );
    }
  }

  const { data: otp, error: otpErr } = await supabase
    .from("network_otp_codes")
    .select("id, code_hash, attempts, expires_at")
    .eq("phone", phone)
    .eq("purpose", "login")
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (otpErr) {
    console.error("verify-otp-mobile lookup failed", otpErr);
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

  const { data: consumed, error: consumeErr } = await supabase
    .from("network_otp_codes")
    .update({ consumed_at: nowIso, attempts: newAttempts })
    .eq("id", otp.id)
    .is("consumed_at", null)
    .select("id");
  if (consumeErr) {
    console.error("verify-otp-mobile consume failed", consumeErr);
    return NextResponse.json(
      { ok: false, error: "Errore temporaneo. Riprova." },
      { status: 500 },
    );
  }
  if (!consumed || consumed.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Codice già usato. Richiedine uno nuovo." },
      { status: 400 },
    );
  }

  const { data: member } = await supabase
    .from("network_members")
    .select("id, phone, ragione_sociale, piva, referente, approved_at, last_login_at")
    .eq("phone", phone)
    .is("revoked_at", null)
    .maybeSingle();

  if (!member) {
    return NextResponse.json(
      { ok: false, error: "Accesso non disponibile. Contatta l'admin." },
      { status: 403 },
    );
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(
    Date.now() + NETWORK_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const { error: sessionError } = await supabase.from("network_sessions").insert({
    token_hash: tokenHash,
    member_id: member.id,
    expires_at: expiresAt.toISOString(),
    ip,
    user_agent: userAgent,
  });

  if (sessionError) {
    console.error("verify-otp-mobile session insert failed", sessionError);
    return NextResponse.json(
      { ok: false, error: "Errore creazione sessione. Riprova." },
      { status: 500 },
    );
  }

  await supabase
    .from("network_members")
    .update({ last_login_at: nowIso })
    .eq("id", member.id);

  return NextResponse.json({
    ok: true,
    sessionToken: token,
    expiresAt: expiresAt.toISOString(),
    member: {
      id: member.id,
      phone: member.phone,
      ragione_sociale: member.ragione_sociale,
      piva: member.piva,
      referente: member.referente,
    },
  });
}
