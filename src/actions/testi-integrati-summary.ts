"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { PDF_FETCH_UA } from "@/lib/delibere/resolve-pdf";

const MODEL = "claude-sonnet-4-5-20250929";

const SYSTEM_PROMPT = `Sei un analista regolatorio esperto del mercato energia italiano.
Lavori per Il Dispaccio, il network dei reseller energia italiani.

Ti verrà fornito un Testo Integrato ARERA (atto consolidato che raggruppa le disposizioni vigenti
su una specifica materia, es. TIT, TIC, TIV, TIMOE).
Il tuo compito: produrre un riassunto OPERATIVO per un reseller energia.

Output OBBLIGATORIO in JSON (niente markdown, niente backtick):

{
  "summary": "1-2 frasi che spiegano l'oggetto del testo integrato e per chi è rilevante.",
  "bullets": [
    "Bullet 1 operativo: componente/meccanismo/obbligo chiave + soglia/valore/scadenza",
    "Bullet 2 operativo",
    "Bullet 3 operativo",
    "Bullet 4 operativo"
  ]
}

Regole:
- 4 bullet esatti, ≤ 140 caratteri ciascuno.
- Ogni bullet contiene UN dato concreto se presente nel testo (aliquota, soglia, scadenza, formula).
- Prima parola → azione, obbligo o dato numerico.
- Niente fluff ("si fa presente che", "è importante").
- Concentrati sulle parti operative: definizioni, componenti tariffarie, obblighi comunicativi, tempistiche.`;

export type TiSummaryResult = {
  summary: string;
  bullets: string[];
  source: "pdf" | "metadata";
  cached: boolean;
};

export async function generateTestoIntegratoSummary(
  tiId: number,
): Promise<TiSummaryResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("testi_integrati_cache")
    .select(
      "id, codice, titolo, descrizione, settore, delibera_riferimento, documento_url, url_riferimento, ai_summary, ai_bullets, ai_source, ai_generated_at",
    )
    .eq("id", tiId)
    .maybeSingle();
  if (error) throw new Error(`summary: db read failed: ${error.message}`);
  if (!row) throw new Error(`summary: testo integrato ${tiId} not found`);

  if (row.ai_generated_at && row.ai_summary && Array.isArray(row.ai_bullets)) {
    return {
      summary: row.ai_summary,
      bullets: row.ai_bullets as string[],
      source: row.ai_source === "pdf" ? "pdf" : "metadata",
      cached: true,
    };
  }

  const anthropic = new Anthropic({ apiKey });

  const header =
    `Testo Integrato ${row.codice}\n` +
    `Titolo: ${row.titolo}\n` +
    (row.descrizione ? `Descrizione: ${row.descrizione}\n` : "") +
    (row.delibera_riferimento ? `Delibera di riferimento: ${row.delibera_riferimento}\n` : "") +
    (row.settore ? `Settore: ${row.settore}\n` : "");

  const pdfUrl = await resolveTiPdfUrl(row.url_riferimento, row.documento_url);
  let source: "pdf" | "metadata" = "metadata";
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  if (pdfUrl) {
    try {
      const res = await fetch(pdfUrl, {
        headers: { "User-Agent": PDF_FETCH_UA, Accept: "application/pdf" },
        cache: "no-store",
      });
      if (!res.ok) throw new Error(`PDF ${res.status}`);
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 30 * 1024 * 1024) throw new Error(`too large ${buf.byteLength}`);
      content.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: Buffer.from(buf).toString("base64"),
        },
      });
      source = "pdf";
    } catch (err) {
      console.error("ti summary PDF fetch failed:", err);
    }
  }

  content.push({
    type: "text",
    text:
      `${header}\n` +
      (source === "pdf"
        ? "Analizza il PDF del Testo Integrato sopra allegato. Produci il JSON richiesto."
        : "Non ho il PDF integrale. Basati su titolo/descrizione/codice per produrre un JSON che descriva il contesto generale del testo integrato (anche se generico). Marca i bullet come informativi."),
  });

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content }],
  });

  const textBlock = resp.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("no text from Claude");
  }
  const parsed = extractJson(textBlock.text);

  const summary = String(parsed.summary ?? "").trim();
  const bullets = Array.isArray(parsed.bullets)
    ? parsed.bullets.slice(0, 5).map((b: unknown) => String(b).trim()).filter(Boolean)
    : [];
  if (!summary || bullets.length === 0) {
    throw new Error("empty summary or bullets");
  }

  await supabase
    .from("testi_integrati_cache")
    .update({
      ai_summary: summary,
      ai_bullets: bullets,
      ai_generated_at: new Date().toISOString(),
      ai_model: MODEL,
      ai_source: source,
      ai_error: null,
    })
    .eq("id", tiId);

  try {
    revalidatePath("/network/testi-integrati");
  } catch {}

  return { summary, bullets, source, cached: false };
}

export async function recordTiSummaryError(
  tiId: number,
  message: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("testi_integrati_cache")
    .update({ ai_error: message.slice(0, 500) })
    .eq("id", tiId);
}

function extractJson(text: string): Record<string, unknown> {
  const t = text.trim();
  const s = t.indexOf("{");
  const e = t.lastIndexOf("}");
  if (s === -1 || e === -1) throw new Error("no JSON");
  return JSON.parse(t.slice(s, e + 1));
}

async function resolveTiPdfUrl(
  urlRiferimento: string | null,
  documentoUrl: string | null,
): Promise<string | null> {
  // 1. Scraping pagina ARERA (url_riferimento) per primo .pdf
  if (urlRiferimento) {
    try {
      const res = await fetch(urlRiferimento, {
        headers: { "User-Agent": PDF_FETCH_UA },
      });
      if (res.ok) {
        const html = await res.text();
        const m = html.match(/href="([^"]+\.pdf)"/i);
        if (m) {
          const href = m[1];
          let abs = href;
          if (href.startsWith("//")) abs = `https:${href}`;
          else if (href.startsWith("/")) {
            const b = new URL(urlRiferimento);
            abs = `${b.protocol}//${b.host}${href}`;
          }
          const head = await fetch(abs, {
            method: "HEAD",
            headers: { "User-Agent": PDF_FETCH_UA },
          });
          if (head.ok && (head.headers.get("content-type") ?? "").includes("pdf")) {
            return abs;
          }
        }
      }
    } catch {}
  }

  // 2. Fallback: Energizzo documento_url (funzionerà solo se storage sarà abilitato)
  if (documentoUrl) {
    try {
      const head = await fetch(documentoUrl, {
        method: "HEAD",
        headers: { "User-Agent": PDF_FETCH_UA },
      });
      if (head.ok) return documentoUrl;
    } catch {}
  }

  return null;
}
