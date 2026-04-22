import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizePhoneE164 } from "@/lib/network/phone";
import { generateOtpCode, hashOtp } from "@/lib/network/crypto";
import { sendWhatsAppText } from "@/lib/wasender";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BodySchema = z.object({ phone: z.string().min(6).max(30) });

const OTP_TTL_SECONDS = 300;
const RATE_WINDOW_MINUTES = 15;
const RATE_MAX_PER_PHONE = 3;

const GENERIC_OK = { ok: true as const, expiresInSeconds: OTP_TTL_SECONDS };

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
      { ok: false, error: "Numero non valido." },
      { status: 400 },
    );
  }

  const phone = normalizePhoneE164(parsed.phone);
  if (!phone) {
    return NextResponse.json(
      { ok: false, error: "Numero non valido. Usa il formato +39 333 1234567." },
      { status: 400 },
    );
  }

  const supabase = createAdminClient();
  const ip = clientIp(req);
  const userAgent = req.headers.get("user-agent");

  const rateSince = new Date(Date.now() - RATE_WINDOW_MINUTES * 60_000).toISOString();
  const { count: recentCount } = await supabase
    .from("network_otp_codes")
    .select("id", { count: "exact", head: true })
    .eq("phone", phone)
    .gte("created_at", rateSince);

  if ((recentCount ?? 0) >= RATE_MAX_PER_PHONE) {
    return NextResponse.json(GENERIC_OK);
  }

  const { data: member } = await supabase
    .from("network_members")
    .select("id")
    .eq("phone", phone)
    .is("revoked_at", null)
    .maybeSingle();

  if (!member) {
    return NextResponse.json(GENERIC_OK);
  }

  const code = generateOtpCode();
  const codeHash = hashOtp(code);
  const expiresAt = new Date(Date.now() + OTP_TTL_SECONDS * 1000).toISOString();

  const { error: insertError } = await supabase.from("network_otp_codes").insert({
    phone,
    code_hash: codeHash,
    expires_at: expiresAt,
    ip,
    user_agent: userAgent,
  });

  if (insertError) {
    console.error("network otp insert failed", insertError);
    return NextResponse.json(GENERIC_OK);
  }

  const text = `Il Dispaccio — Codice accesso: ${code}\nValido 5 minuti. Non condividerlo con nessuno.`;
  try {
    await sendWhatsAppText(phone, text);
  } catch (err) {
    console.error("wasender send failed", err);
  }

  return NextResponse.json(GENERIC_OK);
}
