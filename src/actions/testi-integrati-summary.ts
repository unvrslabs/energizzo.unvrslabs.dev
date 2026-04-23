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

const PDF_FETCH_TIMEOUT_MS = 60_000;
const HTML_FETCH_TIMEOUT_MS = 15_000;
const AI_LOCK_TTL_MS = 5 * 60 * 1000;

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

  // Lock DB atomico
  const lockCutoff = new Date(Date.now() - AI_LOCK_TTL_MS).toISOString();
  const now = new Date().toISOString();
  const { data: locked, error: lockErr } = await supabase
    .from("testi_integrati_cache")
    .update({ ai_generating_at: now })
    .eq("id", tiId)
    .is("ai_generated_at", null)
    .or(`ai_generating_at.is.null,ai_generating_at.lt.${lockCutoff}`)
    .select("id");
  if (lockErr) {
    throw new Error(`ti summary: lock acquire fallito: ${lockErr.message}`);
  }
  if (!locked || locked.length === 0) {
    throw new Error(
      "Sommario AI già in generazione da un altro utente. Attendi qualche secondo e ricarica.",
    );
  }

  try {
    return await generateTiImpl(supabase, row, tiId, apiKey);
  } catch (err) {
    await supabase
      .from("testi_integrati_cache")
      .update({ ai_generating_at: null })
      .eq("id", tiId);
    throw err;
  }
}

type TiRow = {
  id: number;
  codice: string;
  titolo: string;
  descrizione: string | null;
  settore: string | null;
  delibera_riferimento: string | null;
  documento_url: string | null;
  url_riferimento: string | null;
  ai_summary: string | null;
  ai_bullets: unknown;
  ai_source: string | null;
  ai_generated_at: string | null;
};

async function generateTiImpl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: TiRow,
  tiId: number,
  apiKey: string,
): Promise<TiSummaryResult> {
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
    const ctrl = new AbortController();
    const to = setTimeout(() => ctrl.abort(), PDF_FETCH_TIMEOUT_MS);
    try {
      const res = await fetch(pdfUrl, {
        headers: { "User-Agent": PDF_FETCH_UA, Accept: "application/pdf" },
        cache: "no-store",
        signal: ctrl.signal,
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
    } finally {
      clearTimeout(to);
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
    max_tokens: 2048,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content }],
  });

  if (resp.stop_reason === "max_tokens") {
    throw new Error("summary: risposta Claude troncata (max_tokens). Contenuto troppo lungo.");
  }

  const textBlock = resp.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("no text from Claude");
  }
  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson(textBlock.text);
  } catch (err) {
    throw new Error(
      `ti summary: JSON non parsabile. Estratto: ${textBlock.text.slice(0, 200)} (${err instanceof Error ? err.message : err})`,
    );
  }

  const summary = String(parsed.summary ?? "").trim();
  const bullets = Array.isArray(parsed.bullets)
    ? parsed.bullets.slice(0, 5).map((b: unknown) => String(b).trim()).filter(Boolean)
    : [];
  if (!summary || bullets.length === 0) {
    throw new Error("empty summary or bullets");
  }

  const { error: updErr } = await supabase
    .from("testi_integrati_cache")
    .update({
      ai_summary: summary,
      ai_bullets: bullets,
      ai_generated_at: new Date().toISOString(),
      ai_generating_at: null,
      ai_model: MODEL,
      ai_source: source,
      ai_error: null,
    })
    .eq("id", tiId);
  if (updErr) {
    throw new Error(`ti summary: persist fallito: ${updErr.message}`);
  }

  try {
    revalidatePath("/network/testi-integrati");
  } catch (e) {
    console.error("revalidatePath ti summary failed:", e);
  }

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
  if (urlRiferimento && isAllowedUrl(urlRiferimento)) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), HTML_FETCH_TIMEOUT_MS);
      const res = await fetch(urlRiferimento, {
        headers: { "User-Agent": PDF_FETCH_UA },
        signal: ctrl.signal,
      });
      clearTimeout(to);
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
          if (!isAllowedUrl(abs)) return null;
          const hCtrl = new AbortController();
          const hTo = setTimeout(() => hCtrl.abort(), HTML_FETCH_TIMEOUT_MS);
          try {
            const head = await fetch(abs, {
              method: "HEAD",
              headers: { "User-Agent": PDF_FETCH_UA },
              signal: hCtrl.signal,
            });
            if (head.ok && (head.headers.get("content-type") ?? "").includes("pdf")) {
              return abs;
            }
          } finally {
            clearTimeout(hTo);
          }
        }
      }
    } catch (e) {
      console.error("ti pdf scrape failed:", e);
    }
  }

  // 2. Fallback: Energizzo documento_url (funzionerà solo se storage sarà abilitato)
  if (documentoUrl && isAllowedUrl(documentoUrl)) {
    try {
      const ctrl = new AbortController();
      const to = setTimeout(() => ctrl.abort(), HTML_FETCH_TIMEOUT_MS);
      const head = await fetch(documentoUrl, {
        method: "HEAD",
        headers: { "User-Agent": PDF_FETCH_UA },
        signal: ctrl.signal,
      });
      clearTimeout(to);
      if (head.ok) return documentoUrl;
    } catch (e) {
      console.error("ti documento head failed:", e);
    }
  }

  return null;
}

const ALLOWED_PDF_HOSTS = new Set([
  "www.arera.it",
  "arera.it",
  "www.autorita.energia.it",
  "autorita.energia.it",
  "energizzo.it",
  "www.energizzo.it",
]);

function isAllowedUrl(url: string): boolean {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") return false;
    return ALLOWED_PDF_HOSTS.has(u.hostname.toLowerCase());
  } catch {
    return false;
  }
}
