import { TwitterApi } from "twitter-api-v2";

/**
 * Client X (Twitter) per pubblicare tweet con immagine.
 * Usa OAuth 1.0a User Context (richiede 4 credenziali):
 *   - X_CONSUMER_KEY        (app)
 *   - X_CONSUMER_SECRET     (app)
 *   - X_ACCESS_TOKEN        (utente @il_dispaccio)
 *   - X_ACCESS_TOKEN_SECRET (utente @il_dispaccio)
 *
 * Le credenziali utente si generano in console.x.com → Keys → "Authentication
 * Tokens" → Generate Access Token & Secret.
 */
function getClient(): TwitterApi {
  const appKey = process.env.X_CONSUMER_KEY;
  const appSecret = process.env.X_CONSUMER_SECRET;
  const accessToken = process.env.X_ACCESS_TOKEN;
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET;

  if (!appKey || !appSecret || !accessToken || !accessSecret) {
    throw new Error(
      "X API non configurata. Mancano variabili: X_CONSUMER_KEY, X_CONSUMER_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET",
    );
  }

  return new TwitterApi({ appKey, appSecret, accessToken, accessSecret });
}

const X_LIMIT = 280;

/**
 * Splitta `text` in più tweet di max 280 caratteri preservando i confini di
 * parola. I segmenti successivi ricevono numerazione `n/N` in coda.
 */
export function splitForThread(text: string, hashtagSuffix?: string): string[] {
  // Se l'utente ha già usato `---` su riga vuota come separatore esplicito
  // di thread, rispettiamo quel separatore.
  const explicit = text.split(/\n\n---\n\n/).map((t) => t.trim()).filter(Boolean);
  if (explicit.length > 1) {
    const total = explicit.length;
    return explicit.map((t, i) => withSuffix(t, i, total, hashtagSuffix));
  }

  // Altrimenti splittiamo automatico se troppo lungo.
  const fullText = hashtagSuffix ? `${text}\n\n${hashtagSuffix}`.trim() : text;
  if (fullText.length <= X_LIMIT) return [fullText];

  // Heuristic: dividi su paragrafo, poi su frase, poi su parola.
  const segments: string[] = [];
  let remaining = text.trim();
  // Riserva ~10 char per il suffisso n/N
  const budget = X_LIMIT - 10;
  while (remaining.length > 0) {
    if (remaining.length <= budget) {
      segments.push(remaining);
      break;
    }
    let cut = remaining.lastIndexOf("\n\n", budget);
    if (cut < 100) cut = remaining.lastIndexOf(". ", budget);
    if (cut < 100) cut = remaining.lastIndexOf(" ", budget);
    if (cut < 100) cut = budget; // fallback hard
    segments.push(remaining.slice(0, cut + 1).trim());
    remaining = remaining.slice(cut + 1).trim();
  }

  const total = segments.length;
  return segments.map((t, i) => withSuffix(t, i, total, hashtagSuffix));
}

function withSuffix(t: string, i: number, total: number, hashtags?: string): string {
  const idx = total > 1 ? `${i + 1}/${total}` : "";
  // Hashtag solo nel primo tweet
  const tail = i === 0 && hashtags ? `\n\n${hashtags}` : "";
  const suffix = idx && total > 1 ? ` ${idx}` : "";
  const composed = `${t}${tail}${suffix}`;
  // Se ancora oltre il limite (può capitare con hashtag lunghi), tronca con ellipsis
  if (composed.length > X_LIMIT) {
    return composed.slice(0, X_LIMIT - 1) + "…";
  }
  return composed;
}

export type PublishResult = {
  tweetIds: string[];
  firstTweetUrl: string;
};

/**
 * Pubblica un tweet (o thread) con un'immagine allegata al primo tweet.
 *
 * @param text       Copy completo del post X. Se contiene `\n\n---\n\n` viene
 *                   trattato come thread esplicito; altrimenti viene auto-splittato.
 * @param hashtags   Lista di hashtag senza `#`. Vengono aggiunti al primo tweet.
 * @param imageBuf   Immagine PNG in arrayBuffer. Se null, tweet text-only.
 */
export async function postTweetWithImage(
  text: string,
  hashtags: string[],
  imageBuf: ArrayBuffer | null,
): Promise<PublishResult> {
  const client = getClient();

  const hashtagSuffix = hashtags.length
    ? hashtags.map((h) => `#${h.replace(/^#/, "")}`).join(" ")
    : undefined;
  const segments = splitForThread(text, hashtagSuffix);

  let mediaId: string | null = null;
  if (imageBuf) {
    const buf = Buffer.from(imageBuf);
    mediaId = await client.v1.uploadMedia(buf, { mimeType: "image/png" });
  }

  const tweetIds: string[] = [];
  let inReplyTo: string | undefined;
  let username = "i"; // fallback per URL se non riusciamo a leggere lo screen_name
  try {
    const me = await client.v2.me({ "user.fields": ["username"] });
    if (me.data?.username) username = me.data.username;
  } catch {
    // Read access può non essere abilitato sul tier free — non bloccare la pubblicazione
  }

  for (let i = 0; i < segments.length; i++) {
    const payload: {
      text: string;
      reply?: { in_reply_to_tweet_id: string };
      media?: { media_ids: string[] };
    } = { text: segments[i] };
    if (inReplyTo) payload.reply = { in_reply_to_tweet_id: inReplyTo };
    if (i === 0 && mediaId) payload.media = { media_ids: [mediaId] };

    // SDK richiede tuple ([string]); il nostro array è un singleton, cast sicuro.
    const res = await client.v2.tweet(payload as Parameters<typeof client.v2.tweet>[0]);
    const id = res.data.id;
    tweetIds.push(id);
    inReplyTo = id;
  }

  return {
    tweetIds,
    firstTweetUrl: `https://x.com/${username}/status/${tweetIds[0]}`,
  };
}
