"use server";

import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { mapSettoreToSector, type UiSector } from "@/lib/delibere/api";
import { resolveDeliberaPdfUrl, PDF_FETCH_UA } from "@/lib/delibere/resolve-pdf";

const MODEL = "claude-sonnet-4-5-20250929";

const SYSTEM_PROMPT = `Sei un analista regolatorio esperto del mercato energia italiano.
Lavori per Il Dispaccio, il network dei reseller energia italiani.

Ti verrà fornita una delibera ARERA/GME/MASE.
Il tuo compito: produrre un riassunto OPERATIVO per un reseller.

Output OBBLIGATORIO in JSON (niente markdown, niente backtick):

{
  "summary": "1-2 frasi che spiegano di cosa parla la delibera e per chi è rilevante. Italiano tecnico ma asciutto.",
  "bullets": [
    "Bullet 1 operativo: cosa cambia, scadenza, soglia, aliquota, componente impattata",
    "Bullet 2 operativo",
    "Bullet 3 operativo",
    "Bullet 4 operativo"
  ],
  "sectors": ["eel" | "gas" | "com"]
}

Regole:
- 4 bullet esatti, ciascuno ≤ 140 caratteri.
- Ogni bullet deve contenere UN dato concreto (numero, data, %, soglia) se presente nel testo.
- Niente fluff ("si fa presente che", "è importante"). Prima parola → azione o dato.
- "sectors" deve contenere uno o più tra "eel" (energia elettrica), "gas", "com" (comune/entrambi i vettori).
- Se la delibera cita STG, TRAS, DIS, MIS, PUN, asta, tariffa, oneri, switching, recupero crediti → PRIORITIZZA quella info nei bullet.
- Se il PDF è lungo o complesso, concentrati sul dispositivo (la parte decisionale, non le premesse).`;

export type SummaryResult = {
  summary: string;
  bullets: string[];
  sectors: UiSector[];
  source: "pdf" | "url";
};

/**
 * Generate AI summary for a delibera by id.
 * Strategy: download PDF from documento_url (first), pass to Claude as document.
 * If no PDF or PDF fetch fails, fallback to url_riferimento text prompt.
 * Persists result into delibere_cache.
 */
export async function generateDeliberaSummary(
  deliberaId: number,
): Promise<SummaryResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("delibere_cache")
    .select("id, numero, titolo, descrizione, tipo, settore, documento_url, url_riferimento")
    .eq("id", deliberaId)
    .maybeSingle();
  if (error) throw new Error(`summary: db read failed: ${error.message}`);
  if (!row) throw new Error(`summary: delibera ${deliberaId} not found`);

  const anthropic = new Anthropic({ apiKey });

  const header =
    `Delibera ${row.tipo ?? ""} ${row.numero ?? ""}\n` +
    `Titolo: ${row.titolo ?? ""}\n` +
    (row.descrizione ? `Descrizione: ${row.descrizione}\n` : "") +
    (row.settore ? `Settore API: ${row.settore}\n` : "");

  let source: "pdf" | "url" = "url";
  const content: Anthropic.Messages.ContentBlockParam[] = [];

  const pdfUrl = await resolveDeliberaPdfUrl({
    numero: row.numero,
    url_riferimento: row.url_riferimento,
    documento_url: row.documento_url,
  });
  if (pdfUrl) {
    try {
      const pdfBase64 = await fetchPdfAsBase64(pdfUrl);
      content.push({
        type: "document",
        source: { type: "base64", media_type: "application/pdf", data: pdfBase64 },
      });
      source = "pdf";
    } catch (err) {
      console.error("summary: PDF fetch failed", err);
    }
  }

  content.push({
    type: "text",
    text:
      `${header}\n` +
      (source === "pdf"
        ? "Analizza il PDF della delibera sopra allegato.\nProduci il JSON secondo lo schema richiesto."
        : `Non ho il PDF. URL di riferimento: ${row.url_riferimento ?? "n/a"}.\n` +
          "Genera il JSON usando titolo/descrizione/numero come base. Marca i bullet come 'basato su metadati' se non hai il testo integrale."),
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
    throw new Error("summary: no text block from Claude");
  }

  const parsed = extractJson(textBlock.text);
  const result: SummaryResult = {
    summary: String(parsed.summary ?? "").trim(),
    bullets: Array.isArray(parsed.bullets)
      ? parsed.bullets.slice(0, 5).map((b: unknown) => String(b).trim()).filter(Boolean)
      : [],
    sectors: normalizeSectors(parsed.sectors, row.settore),
    source,
  };

  if (!result.summary || result.bullets.length === 0) {
    throw new Error("summary: empty summary/bullets from Claude");
  }

  await supabase
    .from("delibere_cache")
    .update({
      ai_summary: result.summary,
      ai_bullets: result.bullets,
      ai_sectors: result.sectors,
      ai_generated_at: new Date().toISOString(),
      ai_model: MODEL,
      ai_source: result.source,
      ai_error: null,
    })
    .eq("id", deliberaId);

  return result;
}

export async function recordSummaryError(
  deliberaId: number,
  message: string,
): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("delibere_cache")
    .update({ ai_error: message.slice(0, 500) })
    .eq("id", deliberaId);
}

async function fetchPdfAsBase64(url: string): Promise<string> {
  const res = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": PDF_FETCH_UA },
  });
  if (!res.ok) throw new Error(`PDF fetch ${res.status}`);
  const buf = await res.arrayBuffer();
  const maxBytes = 30 * 1024 * 1024;
  if (buf.byteLength > maxBytes) {
    throw new Error(`PDF too large: ${buf.byteLength} bytes`);
  }
  return Buffer.from(buf).toString("base64");
}

function extractJson(text: string): Record<string, unknown> {
  const trimmed = text.trim();
  const jsonStart = trimmed.indexOf("{");
  const jsonEnd = trimmed.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`no JSON in Claude response: ${trimmed.slice(0, 200)}`);
  }
  const slice = trimmed.slice(jsonStart, jsonEnd + 1);
  return JSON.parse(slice);
}

function normalizeSectors(raw: unknown, apiSettore: string | null): UiSector[] {
  if (Array.isArray(raw)) {
    const ok: UiSector[] = [];
    for (const s of raw) {
      const v = String(s).toLowerCase();
      if (v === "eel" || v === "gas" || v === "com") {
        if (!ok.includes(v)) ok.push(v);
      }
    }
    if (ok.length) return ok;
  }
  return mapSettoreToSector(apiSettore);
}
