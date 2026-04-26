import { NextResponse } from "next/server";
import { TwitterApi } from "twitter-api-v2";
import { getAdminMember } from "@/lib/admin/session";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/admin/social/x-health
 *
 * Verifica che le 4 env X_* siano configurate e che le credenziali siano
 * valide chiamando v2/users/me. Non pubblica nulla. Solo per debug setup.
 */
export async function GET() {
  const admin = await getAdminMember();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const env = {
    X_CONSUMER_KEY: !!process.env.X_CONSUMER_KEY,
    X_CONSUMER_SECRET: !!process.env.X_CONSUMER_SECRET,
    X_ACCESS_TOKEN: !!process.env.X_ACCESS_TOKEN,
    X_ACCESS_TOKEN_SECRET: !!process.env.X_ACCESS_TOKEN_SECRET,
  };
  const allSet = Object.values(env).every(Boolean);
  if (!allSet) {
    return NextResponse.json(
      { ok: false, env, error: "Missing env vars" },
      { status: 500 },
    );
  }

  try {
    const client = new TwitterApi({
      appKey: process.env.X_CONSUMER_KEY!,
      appSecret: process.env.X_CONSUMER_SECRET!,
      accessToken: process.env.X_ACCESS_TOKEN!,
      accessSecret: process.env.X_ACCESS_TOKEN_SECRET!,
    });
    const me = await client.v2.me({
      "user.fields": ["username", "name", "verified"],
    });
    return NextResponse.json({
      ok: true,
      env,
      account: {
        username: me.data?.username,
        name: me.data?.name,
        id: me.data?.id,
        verified: me.data?.verified ?? null,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    // twitter-api-v2 attaches data on error responses
    const errData =
      err && typeof err === "object" && "data" in err ? (err as { data: unknown }).data : null;
    return NextResponse.json(
      { ok: false, env, error: msg, details: errData },
      { status: 502 },
    );
  }
}
