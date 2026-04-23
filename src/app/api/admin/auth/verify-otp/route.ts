import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneE164 } from "@/lib/network/phone";
import {
  generateSessionToken,
  hashOtp,
  hashSessionToken,
} from "@/lib/network/crypto";
import {
  ADMIN_COOKIE_NAME,
  ADMIN_SESSION_TTL_DAYS,
} from "@/lib/admin/session";

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

  if (ip) {
    const since = new Date(Date.now() - IP_VERIFY_WINDOW_MS).toISOString();
    const { count } = await supabase
      .from("admin_sessions")
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
    .from("admin_otp_codes")
    .select("id, code_hash, attempts, expires_at")
    .eq("phone", phone)
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (otpErr) {
    console.error("admin verify-otp lookup failed", otpErr);
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
        .from("admin_otp_codes")
        .update({ attempts: newAttempts, consumed_at: nowIso })
        .eq("id", otp.id)
        .is("consumed_at", null);
      return NextResponse.json(
        { ok: false, error: "Troppi tentativi. Richiedi un nuovo codice." },
        { status: 429 },
      );
    }
    await supabase
      .from("admin_otp_codes")
      .update({ attempts: newAttempts })
      .eq("id", otp.id);
    return NextResponse.json(
      { ok: false, error: "Codice errato." },
      { status: 400 },
    );
  }

  // Atomic consume: scarta se già consumato da request parallela
  const { data: consumed, error: consumeErr } = await supabase
    .from("admin_otp_codes")
    .update({ consumed_at: nowIso, attempts: newAttempts })
    .eq("id", otp.id)
    .is("consumed_at", null)
    .select("id");
  if (consumeErr) {
    console.error("admin verify-otp consume failed", consumeErr);
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

  const { data: admin } = await supabase
    .from("admin_members")
    .select("id")
    .eq("phone", phone)
    .is("revoked_at", null)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Accesso non disponibile." },
      { status: 403 },
    );
  }

  const token = generateSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(
    Date.now() + ADMIN_SESSION_TTL_DAYS * 24 * 60 * 60 * 1000,
  );

  const userAgent = req.headers.get("user-agent");

  const { error: sessionError } = await supabase.from("admin_sessions").insert({
    token_hash: tokenHash,
    member_id: admin.id,
    expires_at: expiresAt.toISOString(),
    ip,
    user_agent: userAgent,
  });

  if (sessionError) {
    console.error("admin session insert failed", sessionError);
    return NextResponse.json(
      { ok: false, error: "Errore creazione sessione. Riprova." },
      { status: 500 },
    );
  }

  await supabase
    .from("admin_members")
    .update({ last_login_at: nowIso })
    .eq("id", admin.id);

  // Guardia anti-configurazione: l'admin cookie NON deve essere wildcard domain
  // (rischio leak su ildispaccio.energy pubblico)
  const adminCookieDomain = process.env.ADMIN_SESSION_COOKIE_DOMAIN;
  if (adminCookieDomain && adminCookieDomain.startsWith(".")) {
    console.error(
      `ADMIN_SESSION_COOKIE_DOMAIN inizia con punto (${adminCookieDomain}) - rifiutato`,
    );
    return NextResponse.json(
      { ok: false, error: "Configurazione cookie admin errata." },
      { status: 500 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_DAYS * 24 * 60 * 60,
    domain: adminCookieDomain || undefined,
  });

  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
