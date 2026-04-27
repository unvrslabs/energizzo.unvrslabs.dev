import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashSessionToken } from "@/lib/network/crypto";
import {
  NETWORK_COOKIE_NAME,
  extractNetworkToken,
} from "@/lib/network/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const token = extractNetworkToken(req);

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

  // Se la richiesta proviene dal web (cookie presente), spegne il cookie.
  // Per mobile (Authorization header), non serve toccare cookie.
  const cookieStore = await cookies();
  if (cookieStore.get(NETWORK_COOKIE_NAME)?.value) {
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
  }

  return NextResponse.json({ ok: true });
}
