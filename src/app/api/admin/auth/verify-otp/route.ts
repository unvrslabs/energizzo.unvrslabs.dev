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

  const { data: otp } = await supabase
    .from("admin_otp_codes")
    .select("id, code_hash, attempts, expires_at")
    .eq("phone", phone)
    .is("consumed_at", null)
    .gt("expires_at", nowIso)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!otp) {
    return NextResponse.json(
      { ok: false, error: "Codice non valido o scaduto. Richiedine uno nuovo." },
      { status: 400 },
    );
  }

  const newAttempts = otp.attempts + 1;
  await supabase
    .from("admin_otp_codes")
    .update({ attempts: newAttempts })
    .eq("id", otp.id);

  if (newAttempts > MAX_ATTEMPTS) {
    await supabase
      .from("admin_otp_codes")
      .update({ consumed_at: nowIso })
      .eq("phone", phone)
      .is("consumed_at", null);
    return NextResponse.json(
      { ok: false, error: "Troppi tentativi. Richiedi un nuovo codice." },
      { status: 429 },
    );
  }

  const inputHash = hashOtp(parsed.code);
  if (inputHash !== otp.code_hash) {
    return NextResponse.json(
      { ok: false, error: "Codice errato." },
      { status: 400 },
    );
  }

  await supabase
    .from("admin_otp_codes")
    .update({ consumed_at: nowIso })
    .eq("phone", phone)
    .is("consumed_at", null);

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

  const ip = clientIp(req);
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

  const cookieStore = await cookies();
  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_SESSION_TTL_DAYS * 24 * 60 * 60,
    domain: process.env.ADMIN_SESSION_COOKIE_DOMAIN || undefined,
  });

  return NextResponse.json({ ok: true, redirect: "/dashboard" });
}
