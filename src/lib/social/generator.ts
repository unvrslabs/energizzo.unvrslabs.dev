import Anthropic from "@anthropic-ai/sdk";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export const MODEL = "claude-sonnet-4-5-20250929";
export const PROMPT_VERSION = "v2-conversazionale-informato-rich-images";

export type SocialPostTipo =
  | "delibera"
  | "market"
  | "scadenza"
  | "digest"
  | "educational"
  | "podcast"
  | "libero";

export type GeneratedBy = "manual" | "auto";

export type GenerateInput = {
  tipo: SocialPostTipo;
  fonte_kind?: string | null;
  fonte_id?: string | null;
  brief?: string;
  context?: string;
};

type Supa = SupabaseClient<Database>;

// ═════════════════════════════════════════════════════════════
// SYSTEM PROMPT v2
// ═════════════════════════════════════════════════════════════

export const SYSTEM_PROMPT = `Sei il copywriter social di "Il Dispaccio", il primo network italiano dei reseller energia.

PUBBLICO: CEO, direttori commerciali e responsabili regolatori di società di vendita energia/gas in Italia. Persone informate, pragmatiche, allergiche al marketing gonfio.

TONO: conversazionale informato. Come un analyst di settore che parla ai colleghi — competente ma approachable. Niente hype, niente buzzword. Specifiche numeriche dove possibili. Taglia ogni frase che un reseller pensa "ovvio". Zero emoji a inizio post (massimo 1-2 interne dove aiutano la scansione).

HOOK: prima riga deve essere un gancio concreto — una notizia, un numero che sorprende, o una domanda operativa che risuona. MAI iniziare con "In un mondo in cui..." "Oggi parliamo di..." o altre aperture vuote.

FORMATO OUTPUT: JSON stretto senza backtick né markdown.

{
  "hook": "Prima riga pensata per fermare lo scroll (max 110 char).",
  "copy_linkedin": "Post LinkedIn 800-1400 caratteri, include il hook come prima riga. Paragrafi brevi con a-capo doppi. Bullet con — (em dash) dove serve. Chiusura con soft-CTA (domanda o rimando a Il Dispaccio). NON inserire hashtag nel body: vanno nel campo hashtags.",
  "copy_x": "Post X singolo (max 270 char) o thread numerato [1/3][2/3][3/3] separato da '\\n\\n---\\n\\n'. Stesso tono, più stringato, più punchy.",
  "hashtags": ["energia", "ARERA", "PUN", "..."],
  "image_strategy": {
    "type": "template",
    "template": "quote_card" | "data_card" | "scadenza_card",
    "template_data": { ...campi specifici del template, vedi sotto... },
    "ai_prompt": null
  }
}

═══ SCELTA TEMPLATE IMMAGINE ═══

OGNI post deve avere un'immagine template (no "ai" per ora).

▪ quote_card → per delibere, educational, libero, podcast teaser, digest
  Campi template_data (TUTTI obbligatori se applicabili):
  {
    "kicker": "DELIBERA · ARERA" (max 30 char UPPERCASE, la label in alto),
    "numero": "40/2014/R/gas" (max 20 char, solo se esiste un identificativo es. numero delibera; altrimenti stringa vuota),
    "titolo": "Claim forte 4-10 parole ad alto impatto visivo" (max 80 char, va GRANDE al centro),
    "sottotitolo": "Descrizione di una riga che spiega il claim" (max 130 char)
  }

▪ data_card → per market snapshot (PUN, PSV, TTF, AGSI)
  Campi template_data (TUTTI obbligatori):
  {
    "kicker": "MERCATO · SETTIMANA 17" (max 30 char),
    "label": "PUN" (max 8 char, il nome dell'indicatore),
    "valore_grande": "89,40" (SOLO il numero, niente unità),
    "unita": "€/MWh" (max 10 char),
    "variazione": "+3,2%" oppure "-1,8%" (con segno; stringa vuota se non disponibile),
    "sottotitolo": "vs settimana scorsa · media 7 giorni" (max 100 char)
  }

▪ scadenza_card → per scadenze regolatorie
  Campi template_data (TUTTI obbligatori):
  {
    "kicker": "SCADENZA · ARERA" (max 30 char),
    "data": "31 GEN" (formato "GG MMM" maiuscolo, sillaba corta; IL GIORNO appare enorme),
    "titolo": "Oggetto della scadenza 4-8 parole" (max 80 char),
    "sottotitolo": "Riferimento normativo o dettaglio" (max 100 char),
    "giorni_mancanti": "8" (solo numero, stringa vuota se non calcolabile)
  }

═══ REGOLE COPY ═══

LinkedIn:
- Hook come prima riga (autonoma, forte)
- Corpo con paragrafi brevi, molto respiro
- Bullet solo se servono (3-5 max, con —)
- Dati sempre con unità di misura (€/MWh, €/Smc, %)
- Chiusura con domanda o richiamo a Il Dispaccio
- MAI: "follow for more", "like se sei d'accordo", "tag qualcuno"

X:
- Singolo tweet: hook + dato chiave + riferimento. 270 car max
- Thread: 3-5 tweet numerati [1/n], ogni uno autonomo
- Cifre sempre esplicite (non "molti", non "alcuni")

Hashtag:
- Max 5, rilevanti al settore (#energia #ARERA #PUN #PSV #TTF #gas #mercatoelettrico #reseller #regolazione #tariffe)

Produci SEMPRE JSON parseable. Nessun preambolo, nessuna spiegazione.`;

// ═════════════════════════════════════════════════════════════
// CONTEXT LOADERS
// ═════════════════════════════════════════════════════════════

type Delibera = {
  id: number;
  numero: string | null;
  titolo: string | null;
  descrizione: string | null;
  ai_summary: string | null;
  ai_bullets: string[] | null;
  settore: string | null;
  data_pubblicazione: string | null;
  ai_importanza: string | null;
  ai_scadenze: Array<{ date: string; label: string; tipo?: string }> | null;
};

export async function loadFonteContext(
  supabase: Supa,
  input: GenerateInput,
): Promise<{ contextText: string; fonte_meta: Record<string, unknown> }> {
  if (input.fonte_kind === "delibera" && input.fonte_id) {
    const { data } = await supabase
      .from("delibere_cache")
      .select(
        "id,numero,titolo,descrizione,ai_summary,ai_bullets,settore,data_pubblicazione,ai_importanza,ai_scadenze",
      )
      .eq("id", Number(input.fonte_id))
      .maybeSingle();
    if (data) {
      const d = data as unknown as Delibera;
      const anno = d.data_pubblicazione?.slice(0, 4);
      const lines = [
        `DELIBERA: ${d.numero ?? ""}/${anno ?? ""} — ${d.titolo ?? ""}`,
        d.settore ? `Settore: ${d.settore}` : "",
        d.data_pubblicazione
          ? `Pubblicata: ${d.data_pubblicazione.slice(0, 10)}`
          : "",
        d.ai_importanza ? `Importanza AI: ${d.ai_importanza}` : "",
        d.ai_summary ? `Sommario: ${d.ai_summary}` : "",
        d.descrizione && !d.ai_summary ? `Descrizione: ${d.descrizione}` : "",
        d.ai_bullets && d.ai_bullets.length
          ? `Bullet operativi:\n${d.ai_bullets.map((b) => `- ${b}`).join("\n")}`
          : "",
        d.ai_scadenze && d.ai_scadenze.length
          ? `Scadenze estratte:\n${d.ai_scadenze.map((s) => `- ${s.date}: ${s.label}`).join("\n")}`
          : "",
      ]
        .filter(Boolean)
        .join("\n");
      return {
        contextText: lines,
        fonte_meta: {
          numero: d.numero,
          anno,
          titolo: d.titolo,
          settore: d.settore,
          importanza: d.ai_importanza,
        },
      };
    }
  }

  if (input.context && input.context.trim()) {
    return { contextText: input.context, fonte_meta: {} };
  }

  return { contextText: "", fonte_meta: {} };
}

// ═════════════════════════════════════════════════════════════
// PROMPT BUILDER
// ═════════════════════════════════════════════════════════════

export function buildUserPrompt(input: GenerateInput, contextText: string): string {
  const tipoLabel: Record<SocialPostTipo, string> = {
    delibera:
      "Post su una delibera ARERA/GME/MASE. Spiega cosa cambia, l'impatto operativo per il reseller, scadenze principali. Template immagine: quote_card con numero delibera enorme.",
    market:
      "Post su dati di mercato (PUN, PSV, TTF, AGSI gas storage). Sintesi con variazione % e lettura di senso. Template: data_card con valore e variazione.",
    scadenza:
      "Alert su una scadenza regolatoria. Cosa fare, entro quando, a chi si applica. Template: scadenza_card con data enorme e countdown.",
    digest:
      "Digest settimanale: 3-5 cose che un reseller deve sapere questa settimana. Template: quote_card con claim forte.",
    educational:
      "Post educativo su un concetto del mercato energia. Template: quote_card.",
    podcast:
      "Teaser di un episodio del podcast 'Il Reseller'. Template: quote_card con numero episodio.",
    libero: "Post libero sul brief dell'utente. Template: quote_card.",
  };

  return [
    `TIPOLOGIA POST: ${input.tipo}`,
    `ISTRUZIONI TIPOLOGIA: ${tipoLabel[input.tipo]}`,
    input.brief ? `\nBRIEF UTENTE:\n${input.brief}` : "",
    contextText ? `\nFONTE/CONTESTO:\n${contextText}` : "",
    "\nGenera ora il post in JSON come da schema. TUTTI i campi image_strategy.template_data obbligatori del template scelto devono essere compilati.",
  ]
    .filter(Boolean)
    .join("\n");
}

// ═════════════════════════════════════════════════════════════
// CORE GENERATOR
// ═════════════════════════════════════════════════════════════

export type AIOutput = {
  hook: string;
  copy_linkedin: string;
  copy_x: string;
  hashtags: string[];
  image_strategy: {
    type: "template" | "ai";
    template?: "quote_card" | "data_card" | "scadenza_card" | null;
    template_data?: Record<string, unknown>;
    ai_prompt?: string | null;
  };
};

export async function runClaudeGeneration(
  input: GenerateInput,
  contextText: string,
): Promise<AIOutput> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const anthropic = new Anthropic({ apiKey });
  const userPrompt = buildUserPrompt(input, contextText);

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3500,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = resp.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text")
    throw new Error("AI: empty response");

  const raw = textBlock.text.trim();
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1)
    throw new Error("AI: no JSON in response");

  return JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as AIOutput;
}

export async function generateAndInsert(
  supabase: Supa,
  input: GenerateInput,
  options: { generatedBy: GeneratedBy; notes?: string | null } = {
    generatedBy: "manual",
  },
) {
  const { contextText, fonte_meta } = await loadFonteContext(supabase, input);
  const parsed = await runClaudeGeneration(input, contextText);

  const insertRow = {
    tipo: input.tipo,
    fonte_kind: input.fonte_kind ?? null,
    fonte_id: input.fonte_id ?? null,
    fonte_meta: fonte_meta as never,
    hook: parsed.hook,
    copy_linkedin: parsed.copy_linkedin,
    copy_x: parsed.copy_x,
    hashtags: parsed.hashtags ?? [],
    image_strategy: (parsed.image_strategy ?? {}) as never,
    image_template: parsed.image_strategy?.template ?? "quote_card",
    image_data: (parsed.image_strategy?.template_data ?? {}) as never,
    image_ai_prompt: parsed.image_strategy?.ai_prompt ?? null,
    status: "bozza" as const,
    ai_model: MODEL,
    ai_prompt_version: PROMPT_VERSION,
    notes: options.notes ?? null,
    generated_by: options.generatedBy,
  };

  const { data: inserted, error } = await supabase
    .from("social_posts")
    .insert(insertRow as never)
    .select()
    .single();

  if (error) throw error;
  return inserted;
}
