"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
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
  "sectors": ["eel" | "gas"],
  "scadenze": [
    { "date": "YYYY-MM-DD", "label": "Breve descrizione ≤ 90 char", "tipo": "entrata_vigore" }
  ],
  "importanza": "critica" | "alta" | "normale" | "bassa",
  "categoria_impatto": "Breve label ≤ 40 char che descrive il tipo di impatto"
}

Regole summary/bullets:
- 4 bullet esatti, ciascuno ≤ 140 caratteri.
- Ogni bullet deve contenere UN dato concreto (numero, data, %, soglia) se presente nel testo.
- Niente fluff ("si fa presente che", "è importante"). Prima parola → azione o dato.
- "sectors": uno o più tra "eel" (energia elettrica), "gas". Entrambi se la delibera è trasversale. Array vuoto se non pertinente.
- Se la delibera cita STG, TRAS, DIS, MIS, PUN, asta, tariffa, oneri, switching, recupero crediti → PRIORITIZZA quella info nei bullet.
- Concentrati sul dispositivo (la parte decisionale, non le premesse).

Regole scadenze:
- Estrai TUTTE le date future rilevanti per un reseller menzionate nel testo.
- Tipi ammessi: "entrata_vigore" (decorrenza disposizioni), "adempimento" (obbligo operatore entro X), "consultazione" (fine commenti), "asta" (data asta), "scadenza" (termine generico), "reporting" (invio dati ARERA).
- SOLO date presenti nel testo (non inventate). Formato YYYY-MM-DD.
- SOLO date dal 2026-04-01 in avanti (passate non interessano).
- Label ≤ 90 char, concreta (es. "Decorrenza nuove tariffe TRAS 2026", "Avvio obblighi comunicativi CDISP").
- Se non ci sono scadenze future nel testo, ritorna array vuoto [].
- Massimo 6 scadenze (prendi le più importanti se ce ne sono più).

Regole importanza (classificazione business impact per reseller):
- "critica" = aggiornamento tariffario diretto che cambia il prezzo finale cliente:
  * Componente QVD (vendita gas), CMEM, CCR, QE (Quadro Energia)
  * Aggiornamento TRAS/DIS/MIS distribuzione elettrica o gas
  * Aggiornamento oneri generali di sistema (ASOS, ARIM, UC)
  * Nuove fasce tariffarie o scaglioni
  * Aggiornamenti trimestrali/annuali delle tariffe regolate
- "alta" = cambio operativo forte con impatto su processi reseller:
  * Nuove regole STG, aste gas, mercato della capacità
  * Switching, SII, recupero crediti, morosità
  * Obblighi comunicativi nuovi verso ARERA/CSEA/Acquirente Unico
  * Bonus sociale, disciplina clienti vulnerabili
  * CDISP, market coupling, meccanismo reintegrazione costi
- "normale" = atti su singoli operatori, sanzioni individuali, integrazioni anni passati, approvazioni proposte
- "bassa" = modifiche amministrative, aggiornamenti registri, proroghe tecniche, atti procedurali

"categoria_impatto": label breve tipo "Componente QVD gas", "Tariffe distribuzione", "Asta STG", "Obblighi SII", "Sanzione operatore", "Bonus sociale", ecc.`;

export type Scadenza = {
  date: string;
  label: string;
  tipo: "entrata_vigore" | "adempimento" | "consultazione" | "asta" | "scadenza" | "reporting";
};

export type Importanza = "critica" | "alta" | "normale" | "bassa";

export type SummaryResult = {
  summary: string;
  bullets: string[];
  sectors: UiSector[];
  scadenze: Scadenza[];
  importanza: Importanza;
  categoria_impatto: string | null;
  source: "pdf" | "url";
};

// In-process lock per evitare doppia call Claude sulla stessa delibera
// (utente che clicca 2 volte, o 2 utenti simultanei). Protegge da cost-leak.
// Per setup multi-istanza servirà lock DB-based.
const pendingDelibereIds = new Set<number>();

const PDF_FETCH_TIMEOUT_MS = 60_000;

/**
 * Generate AI summary for a delibera by id.
 * Strategy: download PDF from documento_url (first), pass to Claude as document.
 * If no PDF or PDF fetch fails, fallback to url_riferimento text prompt.
 * Persists result into delibere_cache.
 */
export async function generateDeliberaSummary(
  deliberaId: number,
): Promise<SummaryResult & { cached: boolean }> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  if (pendingDelibereIds.has(deliberaId)) {
    throw new Error("Sommario AI già in generazione. Attendi qualche secondo e ricarica la pagina.");
  }

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("delibere_cache")
    .select(
      "id, numero, titolo, descrizione, tipo, settore, documento_url, url_riferimento, ai_summary, ai_bullets, ai_sectors, ai_source, ai_generated_at",
    )
    .eq("id", deliberaId)
    .maybeSingle();
  if (error) throw new Error(`summary: db read failed: ${error.message}`);
  if (!row) throw new Error(`summary: delibera ${deliberaId} not found`);

  // Summary già presente: ritorna cached, non rigenerare (evita costi duplicati).
  if (row.ai_generated_at && row.ai_summary && Array.isArray(row.ai_bullets)) {
    const raw = row as Record<string, unknown>;
    return {
      summary: row.ai_summary,
      bullets: row.ai_bullets as string[],
      sectors: Array.isArray(row.ai_sectors)
        ? (row.ai_sectors as UiSector[])
        : mapSettoreToSector(row.settore),
      scadenze: Array.isArray(raw.ai_scadenze) ? (raw.ai_scadenze as Scadenza[]) : [],
      importanza: isImportanza(raw.ai_importanza) ? (raw.ai_importanza as Importanza) : "normale",
      categoria_impatto: typeof raw.ai_categoria_impatto === "string" ? (raw.ai_categoria_impatto as string) : null,
      source: row.ai_source === "pdf" ? "pdf" : "url",
      cached: true,
    };
  }

  pendingDelibereIds.add(deliberaId);
  try {
    return await generateImpl(supabase, row, deliberaId, apiKey);
  } finally {
    pendingDelibereIds.delete(deliberaId);
  }
}

type DeliberaRow = {
  id: number;
  numero: string | null;
  titolo: string | null;
  descrizione: string | null;
  tipo: string | null;
  settore: string | null;
  documento_url: string | null;
  url_riferimento: string | null;
  ai_summary: string | null;
  ai_bullets: unknown;
  ai_sectors: unknown;
  ai_source: string | null;
  ai_generated_at: string | null;
};

async function generateImpl(
  supabase: Awaited<ReturnType<typeof createClient>>,
  row: DeliberaRow,
  deliberaId: number,
  apiKey: string,
): Promise<SummaryResult & { cached: boolean }> {
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
    throw new Error("summary: risposta Claude troncata (max_tokens). Contenuto PDF troppo lungo.");
  }

  const textBlock = resp.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("summary: no text block from Claude");
  }

  let parsed: Record<string, unknown>;
  try {
    parsed = extractJson(textBlock.text);
  } catch (err) {
    throw new Error(
      `summary: JSON Claude non parsabile. Estratto: ${textBlock.text.slice(0, 200)} (${err instanceof Error ? err.message : err})`,
    );
  }
  const result: SummaryResult = {
    summary: String(parsed.summary ?? "").trim(),
    bullets: Array.isArray(parsed.bullets)
      ? parsed.bullets.slice(0, 5).map((b: unknown) => String(b).trim()).filter(Boolean)
      : [],
    sectors: normalizeSectors(parsed.sectors, row.settore),
    scadenze: normalizeScadenze(parsed.scadenze),
    importanza: isImportanza(parsed.importanza) ? (parsed.importanza as Importanza) : "normale",
    categoria_impatto: typeof parsed.categoria_impatto === "string" && parsed.categoria_impatto.trim()
      ? String(parsed.categoria_impatto).trim().slice(0, 60)
      : null,
    source,
  };

  if (!result.summary || result.bullets.length === 0) {
    throw new Error("summary: empty summary/bullets from Claude");
  }

  const { error: updErr } = await supabase
    .from("delibere_cache")
    .update({
      ai_summary: result.summary,
      ai_bullets: result.bullets,
      ai_sectors: result.sectors,
      ai_scadenze: result.scadenze,
      ai_importanza: result.importanza,
      ai_categoria_impatto: result.categoria_impatto,
      ai_generated_at: new Date().toISOString(),
      ai_model: MODEL,
      ai_source: result.source,
      ai_error: null,
    })
    .eq("id", deliberaId);
  if (updErr) {
    throw new Error(`summary: persist fallito: ${updErr.message}`);
  }

  try {
    revalidatePath("/network/delibere");
    revalidatePath("/network");
  } catch (e) {
    console.error("revalidatePath after summary failed:", e);
  }

  return { ...result, cached: false };
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
  const ctrl = new AbortController();
  const timeout = setTimeout(() => ctrl.abort(), PDF_FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      cache: "no-store",
      headers: { "User-Agent": PDF_FETCH_UA },
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`PDF fetch ${res.status}`);
    const buf = await res.arrayBuffer();
    const maxBytes = 30 * 1024 * 1024;
    if (buf.byteLength > maxBytes) {
      throw new Error(`PDF too large: ${buf.byteLength} bytes`);
    }
    return Buffer.from(buf).toString("base64");
  } finally {
    clearTimeout(timeout);
  }
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
      if (v === "eel" || v === "gas") {
        if (!ok.includes(v)) ok.push(v);
      }
    }
    return ok;
  }
  return mapSettoreToSector(apiSettore);
}

const VALID_SCADENZA_TIPI = new Set([
  "entrata_vigore",
  "adempimento",
  "consultazione",
  "asta",
  "scadenza",
  "reporting",
]);

function isImportanza(v: unknown): boolean {
  return v === "critica" || v === "alta" || v === "normale" || v === "bassa";
}

function normalizeScadenze(raw: unknown): Scadenza[] {
  if (!Array.isArray(raw)) return [];
  const result: Scadenza[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const obj = item as Record<string, unknown>;
    const date = String(obj.date ?? "").trim();
    const label = String(obj.label ?? "").trim();
    const tipo = String(obj.tipo ?? "").toLowerCase().trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    if (!label) continue;
    if (!VALID_SCADENZA_TIPI.has(tipo)) continue;
    result.push({ date, label: label.slice(0, 120), tipo: tipo as Scadenza["tipo"] });
  }
  return result.slice(0, 6);
}
