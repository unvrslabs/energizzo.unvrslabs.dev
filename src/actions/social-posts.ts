"use server";

import Anthropic from "@anthropic-ai/sdk";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminMember } from "@/lib/admin/session";

const MODEL = "claude-sonnet-4-5-20250929";
const PROMPT_VERSION = "v1-conversazionale-informato";

// ───────── TYPES ─────────

export type SocialPostTipo =
  | "delibera"
  | "market"
  | "scadenza"
  | "digest"
  | "educational"
  | "podcast"
  | "libero";

export type SocialPostStatus =
  | "bozza"
  | "approvato"
  | "schedulato"
  | "pubblicato"
  | "skip";

export type SocialPost = {
  id: string;
  tipo: SocialPostTipo;
  fonte_kind: string | null;
  fonte_id: string | null;
  fonte_meta: Record<string, unknown>;
  hook: string | null;
  copy_linkedin: string;
  copy_x: string;
  hashtags: string[];
  image_strategy: Record<string, unknown>;
  image_template: string | null;
  image_data: Record<string, unknown>;
  image_ai_prompt: string | null;
  image_url: string | null;
  scheduled_at: string | null;
  scheduled_lane: "linkedin" | "x" | "both";
  status: SocialPostStatus;
  published_linkedin_at: string | null;
  published_x_at: string | null;
  ai_model: string | null;
  ai_prompt_version: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// ───────── SYSTEM PROMPT ─────────

const SYSTEM_PROMPT = `Sei il copywriter social di "Il Dispaccio", il primo network italiano dei reseller energia.

PUBBLICO: CEO, direttori commerciali e responsabili regolatori di società di vendita energia/gas in Italia (reseller, trader, grossisti). Persone informate, pragmatiche, allergiche al marketing gonfio.

TONO: conversazionale informato. Come un analyst di settore che parla ai colleghi — competente ma approachable. Niente hype, niente buzzword. Specifiche numeriche dove possibili. Taglia ogni frase che un reseller pensa "ovvio". Zero emoji a inizio post (massimo 1-2 interne dove aiutano la scansione).

HOOK: prima riga deve essere un gancio concreto — una notizia, un numero che sorprende, o una domanda operativa che risuona col pubblico. MAI iniziare con "In un mondo in cui..." "Oggi parliamo di..." o altre aperture vuote.

FORMATO OUTPUT: JSON stretto senza backtick né markdown.

{
  "hook": "Prima riga pensata per fermare lo scroll (max 110 char).",
  "copy_linkedin": "Post LinkedIn completo 800-1400 caratteri, include il hook come prima riga. Usa a capo doppi per respiro. Bullet con — (em dash) dove serve. Chiude con call-to-action soft: domanda o rimando a 'Il Dispaccio' senza risultare pubblicità. NON inserire hashtag nel body: vanno in campo separato.",
  "copy_x": "Post X singolo (max 270 char) o thread numerato [1/3][2/3][3/3] separato da '\\n\\n---\\n\\n'. Stesso tono, più stringato, più punchy.",
  "hashtags": ["energia", "ARERA", "PUN", ...],
  "image_strategy": {
    "type": "template" oppure "ai",
    "template": "quote_card" | "data_card" | "scadenza_card" | null,
    "template_data": { titolo?, sottotitolo?, valore_grande?, data?, bullet1?, bullet2? },
    "ai_prompt": "Solo se type=ai: prompt inglese per Nano Banana Pro, stile fotografico editoriale, no testo sull'immagine, palette verde-scuro."
  }
}

REGOLE LinkedIn:
- Hook come prima riga (autonoma, forte).
- Riga vuota. Corpo con paragrafi brevi, molto respiro.
- Bullet solo se servono (3-5 max, con —).
- Dati sempre con unità di misura (€/MWh, €/Smc, %).
- Chiusura con domanda o richiamo a Il Dispaccio ("Lo approfondiamo nell'area riservata" / "Nell'archivio delibere Il Dispaccio").
- MAI: "follow for more", "like se sei d'accordo", "tag qualcuno".

REGOLE X:
- Singolo tweet: hook + dato chiave + riferimento. 270 car max.
- Thread: 3-5 tweet, ogni uno autonomo. Numera [1/n].
- Usa sempre le cifre (non "molti", non "alcuni").

REGOLE HASHTAG:
- Max 5. Niente spam. Rilevanti al settore: #energia #ARERA #PUN #PSV #TTF #gas #mercatoelettrico #reseller #regolazione #tariffe.
- In inglese solo se pertinente globale.

REGOLE IMMAGINE:
- Se tipo=delibera o scadenza o market → preferisci template (dati deterministici leggibili).
- Se tipo=educational o libero → spesso AI hero.
- template_data deve contenere tutti i campi necessari al template scelto.

Produci SEMPRE JSON parseable. Nessun preambolo, nessuna spiegazione.`;

// ───────── BUILD USER PROMPT ─────────

type GenerateInput = {
  tipo: SocialPostTipo;
  fonte_kind?: string | null;
  fonte_id?: string | null;
  brief?: string;
  context?: string;
};

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

async function loadFonteContext(
  supabase: Awaited<ReturnType<typeof createClient>>,
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
      const d = data as Delibera;
      const anno = d.data_pubblicazione?.slice(0, 4);
      const lines = [
        `DELIBERA: ${d.numero ?? ""}/${anno ?? ""} — ${d.titolo ?? ""}`,
        d.settore ? `Settore: ${d.settore}` : "",
        d.data_pubblicazione ? `Pubblicata: ${d.data_pubblicazione.slice(0, 10)}` : "",
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

function buildUserPrompt(input: GenerateInput, contextText: string): string {
  const tipoLabel: Record<SocialPostTipo, string> = {
    delibera: "Post su una delibera ARERA/GME/MASE. Spiega cosa cambia, l'impatto operativo per il reseller, scadenze principali.",
    market: "Post su dati di mercato (PUN, PSV, TTF, AGSI gas storage). Sintesi della settimana/giornata con variazioni percentuali e lettura di senso.",
    scadenza: "Alert su una scadenza regolatoria imminente. Cosa fare, entro quando, a chi si applica.",
    digest: "Digest settimanale: le 3-5 cose che un reseller energia deve sapere questa settimana.",
    educational: "Post educativo: spiega in modo chiaro un concetto del mercato energia (es: come leggere una delibera, differenza PCV vs PCV, meccanismi del GME).",
    podcast: "Teaser di un episodio del podcast 'Il Reseller' — gancio + 3 punti chiave + invito all'ascolto.",
    libero: "Post libero sul brief dell'utente.",
  };

  return [
    `TIPOLOGIA POST: ${input.tipo}`,
    `ISTRUZIONI TIPOLOGIA: ${tipoLabel[input.tipo]}`,
    input.brief ? `\nBRIEF UTENTE:\n${input.brief}` : "",
    contextText ? `\nFONTE/CONTESTO:\n${contextText}` : "",
    "\nGenera ora il post in JSON come da schema.",
  ]
    .filter(Boolean)
    .join("\n");
}

// ───────── ACTIONS ─────────

export async function generateSocialPost(input: GenerateInput) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Missing ANTHROPIC_API_KEY");

  const supabase = await createClient();
  const { contextText, fonte_meta } = await loadFonteContext(supabase, input);

  const anthropic = new Anthropic({ apiKey });
  const userPrompt = buildUserPrompt(input, contextText);

  const resp = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userPrompt }],
  });

  const textBlock = resp.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") throw new Error("AI: empty response");

  const raw = textBlock.text.trim();
  const jsonStart = raw.indexOf("{");
  const jsonEnd = raw.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("AI: no JSON in response");

  type AIOutput = {
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

  const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as AIOutput;

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
    image_template: parsed.image_strategy?.template ?? null,
    image_data: (parsed.image_strategy?.template_data ?? {}) as never,
    image_ai_prompt: parsed.image_strategy?.ai_prompt ?? null,
    status: "bozza" as const,
    ai_model: MODEL,
    ai_prompt_version: PROMPT_VERSION,
  };

  const { data: inserted, error } = await supabase
    .from("social_posts")
    .insert(insertRow)
    .select()
    .single();

  if (error) throw error;

  revalidatePath("/dashboard/social");
  return inserted as SocialPost;
}

export async function listSocialPosts(opts?: {
  status?: SocialPostStatus | SocialPostStatus[];
  from?: string;
  to?: string;
  tipo?: SocialPostTipo;
  limit?: number;
}) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  let query = supabase.from("social_posts").select("*");

  if (opts?.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    query = query.in("status", statuses);
  }
  if (opts?.tipo) query = query.eq("tipo", opts.tipo);
  if (opts?.from) query = query.gte("scheduled_at", opts.from);
  if (opts?.to) query = query.lt("scheduled_at", opts.to);

  query = query.order("scheduled_at", { ascending: true, nullsFirst: false });
  query = query.order("created_at", { ascending: false });
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SocialPost[];
}

export async function updateSocialPost(
  id: string,
  patch: Partial<
    Pick<
      SocialPost,
      | "copy_linkedin"
      | "copy_x"
      | "hashtags"
      | "scheduled_at"
      | "scheduled_lane"
      | "status"
      | "notes"
      | "image_template"
      | "image_data"
    >
  >,
) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_posts")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/dashboard/social");
  return data as SocialPost;
}

export async function markPublished(id: string, lane: "linkedin" | "x" | "both") {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("social_posts")
    .select("published_linkedin_at,published_x_at")
    .eq("id", id)
    .single();

  const patch: Record<string, string | SocialPostStatus> = { status: "pubblicato" };
  if (lane === "linkedin" || lane === "both") patch.published_linkedin_at = now;
  if (lane === "x" || lane === "both") patch.published_x_at = now;
  if (lane === "linkedin" && existing?.published_x_at == null) {
    delete patch.status;
  }
  if (lane === "x" && existing?.published_linkedin_at == null) {
    delete patch.status;
  }

  const { error } = await supabase.from("social_posts").update(patch as never).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/social");
}

export async function deleteSocialPost(id: string) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase.from("social_posts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/social");
}

// Helper: pubblicazioni di oggi
export async function listTodayPosts() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
  return listSocialPosts({
    from: start,
    to: end,
    status: ["approvato", "schedulato"],
  });
}

// Helper: lista delibere recenti per picker
export async function listRecentDelibereForPicker(limit = 30) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("id,numero,titolo,settore,data_pubblicazione,ai_importanza,ai_summary")
    .not("ai_summary", "is", null)
    .order("data_pubblicazione", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
