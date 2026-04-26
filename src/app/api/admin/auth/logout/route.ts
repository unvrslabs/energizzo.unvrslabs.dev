import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashSessionToken } from "@/lib/network/crypto";
import { ADMIN_COOKIE_NAME } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;

  if (token) {
    try {
      const supabase = createAdminClient();
      await supabase
        .from("admin_sessions")
        .update({ revoked_at: new Date().toISOString() })
        .eq("token_hash", hashSessionToken(token));
    } catch (err) {
      console.error("admin logout revoke failed", err);
    }
  }

  cookieStore.set({
    name: ADMIN_COOKIE_NAME,
    value: "",
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
    maxAge: 0,
    domain: process.env.ADMIN_SESSION_COOKIE_DOMAIN || undefined,
  });

  return NextResponse.json({ ok: true });
}
