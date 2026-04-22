import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashSessionToken } from "@/lib/network/crypto";
import { NETWORK_COOKIE_NAME } from "@/lib/network/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(NETWORK_COOKIE_NAME)?.value;

  if (token) {
    try {
      const supabase = createAdminClient();
      await supabase
        .from("network_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("token_hash", hashSessionToken(token));
    } catch (err) {
      console.error("network logout revoke failed", err);
    }
  }

  cookieStore.set({
    name: NETWORK_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
    domain: process.env.NETWORK_SESSION_COOKIE_DOMAIN || undefined,
  });

  return NextResponse.json({ ok: true });
}
