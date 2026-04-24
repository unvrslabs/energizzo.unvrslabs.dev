/**
 * Fal.ai wrapper per generazione immagini AI (Nano Banana / Gemini 2.5 Flash Image).
 *
 * Usa fetch diretto invece di @fal-ai/client per minimizzare dipendenze.
 * Richiede FAL_KEY in env.
 */

const FAL_BASE = "https://fal.run";
const DEFAULT_MODEL = process.env.FAL_IMAGE_MODEL ?? "fal-ai/nano-banana";

type FalImageInput = {
  prompt: string;
  num_images?: number;
  image_size?: "square_hd" | "square" | "portrait_4_3" | "portrait_16_9" | "landscape_4_3" | "landscape_16_9";
};

type FalImageResponse = {
  images: Array<{
    url: string;
    content_type?: string;
    file_name?: string;
    width?: number | null;
    height?: number | null;
  }>;
  description?: string;
  seed?: number;
};

export type FalImageResult = {
  url: string;
  width: number | null;
  height: number | null;
  content_type: string;
  provider: "fal";
  model: string;
};

export async function generateFalImage(
  prompt: string,
  opts: { imageSize?: FalImageInput["image_size"]; model?: string } = {},
): Promise<FalImageResult | null> {
  const key = process.env.FAL_KEY;
  if (!key) return null;
  if (!prompt || prompt.trim().length < 10) return null;

  const model = opts.model ?? DEFAULT_MODEL;
  const input: FalImageInput = {
    prompt: prompt.slice(0, 2000),
    num_images: 1,
  };
  if (opts.imageSize) input.image_size = opts.imageSize;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 90_000); // 90s hard timeout

  try {
    const res = await fetch(`${FAL_BASE}/${model}`, {
      method: "POST",
      headers: {
        Authorization: `Key ${key}`,
        "Content-Type": "application/json",
        "user-agent": "ildispaccio/1.0",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });
    if (!res.ok) {
      const errTxt = await res.text().catch(() => "");
      console.error(`[fal-image] HTTP ${res.status}: ${errTxt.slice(0, 200)}`);
      return null;
    }
    const data = (await res.json()) as FalImageResponse;
    const img = data.images?.[0];
    if (!img?.url) return null;
    return {
      url: img.url,
      width: img.width ?? null,
      height: img.height ?? null,
      content_type: img.content_type ?? "image/png",
      provider: "fal",
      model,
    };
  } catch (err) {
    console.error(`[fal-image] ${err instanceof Error ? err.message : String(err)}`);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Aggiunge elementi brand-consistent al prompt editoriale Claude
 * per mantenere coerenza visiva con Il Dispaccio.
 */
export function wrapBrandPrompt(corePrompt: string): string {
  return `${corePrompt.trim()}

Visual style: editorial photography, dark moody atmosphere, deep emerald green accents, high contrast, cinematic depth of field, professional corporate energy sector aesthetic. Subtle texture. Background gradient dark emerald (#061a17) to near-black. No text overlays on image. Framing: strong focal subject, negative space. Medium format look.`;
}
