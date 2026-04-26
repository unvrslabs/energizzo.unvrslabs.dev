import { NextResponse, type NextRequest } from "next/server";
import { ADMIN_COOKIE_NAME, getAdminMember } from "@/lib/admin/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { postTweetWithImage } from "@/lib/social/x-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * POST /api/admin/social/[id]/publish/x
 *
 * Pubblica il post su X (Twitter) usando le credenziali OAuth 1.0a configurate
 * via env vars. Aggancia l'immagine generata dal template Satori (o l'image_url
 * Fal media se presente).
 *
 * Risponde con tweetUrl + tweetIds; aggiorna social_posts.published_x_at e
 * scrive il payload tweet in fonte_meta.x_publish.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminMember();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const supabase = createAdminClient();

  // 1. Carica post
  const { data: post, error } = await supabase
    .from("social_posts")
    .select(
      "id, copy_x, hashtags, image_template, image_data, image_url, fonte_meta, published_x_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !post) {
    return NextResponse.json({ error: "Post non trovato" }, { status: 404 });
  }
  if (post.published_x_at) {
    return NextResponse.json(
      { error: "Post già pubblicato su X" },
      { status: 409 },
    );
  }
  if (!post.copy_x || post.copy_x.trim().length === 0) {
    return NextResponse.json(
      { error: "Copy X vuota — non posso pubblicare" },
      { status: 400 },
    );
  }

  // 2. Carica immagine se presente (Fal media url o template Satori loopback)
  let imageBuf: ArrayBuffer | null = null;
  if (post.image_url || post.image_template) {
    try {
      const imgUrl = post.image_url || imageEndpointFallback(id);
      const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)?.value;
      const headers: HeadersInit = {};
      if (!post.image_url && adminCookie) {
        // Loopback all'endpoint interno → forwarda cookie admin per auth
        headers.cookie = `${ADMIN_COOKIE_NAME}=${adminCookie}`;
      }
      const imgRes = await fetch(imgUrl, { cache: "no-store", headers });
      if (imgRes.ok) {
        imageBuf = await imgRes.arrayBuffer();
      } else {
        console.warn("[publish/x] image fetch failed:", imgRes.status);
      }
    } catch (err) {
      console.warn(
        "[publish/x] image fetch error:",
        err instanceof Error ? err.message : String(err),
      );
    }
  }

  // 3. Pubblica
  let result;
  try {
    result = await postTweetWithImage(
      post.copy_x,
      post.hashtags ?? [],
      imageBuf,
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[publish/x] failed:", msg);
    return NextResponse.json(
      { error: `Pubblicazione X fallita: ${msg}` },
      { status: 502 },
    );
  }

  // 4. Aggiorna DB con timestamp + payload tweet
  const nowIso = new Date().toISOString();
  const fonte_meta = (post.fonte_meta ?? {}) as Record<string, unknown>;
  fonte_meta.x_publish = {
    tweet_ids: result.tweetIds,
    first_url: result.firstTweetUrl,
    published_at: nowIso,
    is_thread: result.tweetIds.length > 1,
  };

  const { error: updErr } = await supabase
    .from("social_posts")
    .update({
      published_x_at: nowIso,
      status:
        // Se era già "approvato" o "schedulato", passa a "pubblicato"; altrimenti lascia
        "pubblicato",
      fonte_meta: fonte_meta as never,
    } as never)
    .eq("id", id);

  if (updErr) {
    console.error("[publish/x] update DB failed:", updErr);
    // Ma il tweet è già pubblicato — non possiamo rollback. Restituiamo successo
    // con warning per non lasciare lo user nel limbo.
    return NextResponse.json({
      ok: true,
      warning: "Tweet pubblicato ma update DB fallito",
      ...result,
    });
  }

  return NextResponse.json({ ok: true, ...result });
}

/**
 * Quando il post non ha image_url Fal, fetcheremo dall'endpoint interno che
 * renderizza il template Satori. Su VPS questa chiamata è loopback (origin
 * stesso del processo).
 */
function imageEndpointFallback(id: string): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ?? "https://dash.ildispaccio.energy";
  return `${base}/api/admin/social/image/${id}?format=square`;
}
