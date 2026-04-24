import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createClient } from "@/lib/supabase/server";
import { getAdminMember } from "@/lib/admin/session";
import { generateAndInsert } from "@/lib/social/generator";
import type { SocialPostTipo } from "@/lib/social/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

const MODEL = "claude-sonnet-4-5-20250929";

const REPO_ROOT = process.cwd();

const SYSTEM_PROMPT = `Sei l'agente AI di "Il Dispaccio" — network editoriale dei reseller energia italiani. Lavori per Emanuele Maccari (UNVRS Labs, CEO).

Il tuo job è eseguire QUALUNQUE richiesta di Emanuele dentro la dashboard admin: creare/modificare/eliminare post social, leggere dati DB, generare contenuti AI, schedulare pubblicazioni, rispondere a domande operative.

## Stack conoscenza
- Next.js 15 + Supabase (service_role bypass RLS).
- Tabelle principali:
  • **social_posts** — NOME TABELLA: social_posts (plurale). Campi principali:
    - id uuid
    - tipo enum {delibera,market,scadenza,digest,educational,podcast,libero}
    - status enum {bozza,approvato,schedulato,pubblicato,skip}
    - IMPORTANTE: workflow semplificato. Tutti i post non ancora pubblicati hanno status='bozza' e sono "pronti da pubblicare". NON c'è più un workflow approvato/schedulato — quelli status esistono nell'enum ma non vengono più usati. Quando cerchi "post da pubblicare oggi" filtra status NOT IN ('pubblicato','skip') (equivale a status='bozza').
    - copy_linkedin text, copy_x text, hashtags text[]
    - image_url text (URL Fal Nano Banana se AI), image_template text, image_data jsonb
    - scheduled_at timestamptz (opzionale, solo metadata: quando l'utente vuole pubblicarlo)
    - scheduled_lane text {linkedin,x,both}
    - generated_by text {manual,auto}
    - notes text, created_at, updated_at
  • **delibere_cache** (id bigint, numero, titolo, ai_summary, ai_bullets jsonb, ai_scadenze jsonb, ai_importanza text {alta,media,bassa})
  • **market_power_pun** (price_day date, price_eur_mwh, zones jsonb)
  • **market_gas_storage** (gas_day, full_pct, gas_in_storage_twh)
  • **market_entsoe** (metric_type text, reference_day, payload jsonb) — 5 metriche: generation_mix, load_forecast, renewable_forecast, cross_border_flows, unavailability
  • leads (reseller energetici, 800+), podcast_guests/questions/hot_topics, strategy_tactics, network_join_requests, network_members, notes, activity_log

## Strumenti
1. **execute_sql** — SQL arbitrario (SELECT/INSERT/UPDATE/DELETE). Security definer bypassa RLS. Usa per query DB dirette.
2. **generate_social_post** — crea un nuovo post social via Claude+Fal. Parametri: tipo, fonte_kind?, fonte_id?, brief?, force_ai? (boolean, default false). Ritorna il post completo inserito in social_posts. Usalo sempre invece di INSERT manuale per post social.
3. **read_file**, **list_files**, **grep_code** — esplorazione codice repo.

## Regole
- Esegui SENZA chiedere conferma. Emanuele è il CEO, si fida.
- Per DELETE massivi o DROP: esegui solo se chiaro (es "cancella tutte le bozze auto di oggi").
- Rispondi italiano, asciutto, pragmatico. Zero fluff.
- Quando mostri risultati SQL: riassumi (n righe, campo chiave), non dumpare JSON.
- Se crei post social, riporta id + hook breve + se ha image Fal.
- Se modifichi/elimini N record, conferma "Fatto: N righe aggiornate/cancellate".
- "Oggi", "domani", "questa settimana" → calcola date SQL relative (CURRENT_DATE, CURRENT_DATE + INTERVAL '1 day', ecc).
- Se user vuole pubblicare: cambia status a 'pubblicato' + set published_linkedin_at/published_x_at a NOW().

## Query default per "post da pubblicare / i miei post / cosa c'è"
Usa SEMPRE questa forma:
  SELECT id, tipo, hook, hashtags, image_url IS NOT NULL AS has_ai_image, generated_by, created_at
  FROM social_posts
  WHERE status NOT IN ('pubblicato','skip')
  ORDER BY created_at DESC;
NON filtrare mai per status='approvato' o status='schedulato' — quelli non vengono usati.
Se user dice "post di oggi" → filtra created_at::date = CURRENT_DATE.
Se user dice "post questa settimana" → created_at >= CURRENT_DATE - INTERVAL '7 days'.`;

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "execute_sql",
    description:
      "Esegue una query SQL arbitraria su Postgres Supabase via agent_exec_sql RPC. Per SELECT ritorna righe in JSON. Per INSERT/UPDATE/DELETE/DDL ritorna conferma. Usa questo per leggere/modificare qualunque tabella (leads, social_posts, delibere_cache, market_*, ecc).",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Query SQL da eseguire. Preferisci query idempotenti.",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "generate_social_post",
    description:
      "Genera un nuovo post social via Claude Sonnet + Fal Nano Banana (per immagini AI). Inserisce automaticamente in social_posts come 'bozza'. Ritorna id + hook + image_url. Usa SEMPRE questo invece di INSERT manuale per creare post.",
    input_schema: {
      type: "object",
      properties: {
        tipo: {
          type: "string",
          enum: ["delibera", "market", "scadenza", "digest", "educational", "podcast", "libero"],
          description: "Tipologia del post",
        },
        fonte_kind: {
          type: "string",
          enum: ["delibera", "scadenza"],
          description: "Opzionale: tipo di fonte per context automatico",
        },
        fonte_id: {
          type: "string",
          description: "Opzionale: id della fonte (delibera.id come stringa, o scadenza fonte_id)",
        },
        brief: {
          type: "string",
          description: "Brief testuale per guidare Claude (angolo editoriale, CTA, dati specifici)",
        },
        force_ai: {
          type: "boolean",
          description: "Se true, forza image_strategy='ai' con Nano Banana (più lento ma più d'impatto). Default false = Claude sceglie.",
        },
      },
      required: ["tipo"],
    },
  },
  {
    name: "read_file",
    description: "Legge il contenuto di un file nel repo dell'app. Path relativo alla root del progetto (es. 'src/actions/podcast-guest.ts').",
    input_schema: {
      type: "object",
      properties: {
        path: { type: "string", description: "Path relativo del file" },
      },
      required: ["path"],
    },
  },
  {
    name: "list_files",
    description: "Elenca file del repo che matchano un glob (es. 'src/**/*.ts', 'content/podcast/*.md'). Max 200 risultati.",
    input_schema: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Glob pattern" },
      },
      required: ["pattern"],
    },
  },
  {
    name: "grep_code",
    description: "Cerca testo (regex) nei file del repo. Ritorna file e righe matching. Utile per trovare dove una funzione è usata.",
    input_schema: {
      type: "object",
      properties: {
        pattern: { type: "string", description: "Regex da cercare" },
        glob: {
          type: "string",
          description: "Glob opzionale per filtrare file (es. 'src/**/*.ts')",
        },
      },
      required: ["pattern"],
    },
  },
];

function sanitizePath(p: string): string | null {
  const abs = join(REPO_ROOT, p);
  const rel = relative(REPO_ROOT, abs);
  if (rel.startsWith("..") || rel.startsWith("/")) return null;
  return abs;
}

function walk(dir: string, acc: string[] = []): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return acc;
  }
  for (const e of entries) {
    if (e === "node_modules" || e === ".git" || e === ".next" || e === "dist") continue;
    const full = join(dir, e);
    let s;
    try {
      s = statSync(full);
    } catch {
      continue;
    }
    if (s.isDirectory()) walk(full, acc);
    else acc.push(full);
  }
  return acc;
}

function globMatch(pattern: string, filePath: string): boolean {
  // naive glob → regex: ** → .*, * → [^/]*
  const rx =
    "^" +
    pattern
      .replace(/[.+^${}()|[\]\\]/g, "\\$&")
      .replace(/\*\*/g, "§§")
      .replace(/\*/g, "[^/]*")
      .replace(/§§/g, ".*") +
    "$";
  return new RegExp(rx).test(filePath);
}

async function runTool(
  name: string,
  input: Record<string, unknown>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: any,
): Promise<string> {
  try {
    if (name === "execute_sql") {
      const query = String(input.query ?? "");
      const { data, error } = await supabase.rpc("agent_exec_sql", { p_query: query });
      if (error) return JSON.stringify({ ok: false, error: error.message });
      // Truncate large results to ~200KB to protect context
      let serialized = JSON.stringify(data);
      if (serialized.length > 200_000) {
        serialized = serialized.slice(0, 200_000) + "...(truncated)";
      }
      return serialized;
    }
    if (name === "generate_social_post") {
      const tipo = String(input.tipo ?? "libero") as SocialPostTipo;
      const fonte_kind = input.fonte_kind ? String(input.fonte_kind) : null;
      const fonte_id = input.fonte_id ? String(input.fonte_id) : null;
      const forceAi = Boolean(input.force_ai);
      const baseBrief = input.brief ? String(input.brief) : "";
      const brief = forceAi
        ? `${baseBrief}\n\nIMAGE_STRATEGY OVERRIDE: devi generare ESCLUSIVAMENTE image_strategy.type="ai" con ai_prompt molto dettagliato (100-160 parole) in inglese per un'immagine editoriale d'impatto. Stile: cinematic, atmospheric, dark emerald accents, high contrast, no text on image, professional energy sector aesthetic.`
        : baseBrief;
      try {
        const post = await generateAndInsert(
          supabase,
          { tipo, fonte_kind, fonte_id, brief: brief || undefined },
          { generatedBy: "manual", notes: "🧑‍💻 Creato via agent chat" },
        );
        const p = post as Record<string, unknown>;
        return JSON.stringify({
          ok: true,
          id: p.id,
          tipo: p.tipo,
          hook: p.hook,
          status: p.status,
          image_template: p.image_template,
          image_url: p.image_url ?? null,
          preview: String(p.copy_linkedin ?? "").slice(0, 200),
        });
      } catch (e) {
        return JSON.stringify({ ok: false, error: (e as Error).message });
      }
    }
    if (name === "read_file") {
      const p = sanitizePath(String(input.path ?? ""));
      if (!p) return JSON.stringify({ error: "Invalid path" });
      try {
        const content = readFileSync(p, "utf-8");
        const truncated =
          content.length > 100_000 ? content.slice(0, 100_000) + "\n...(truncated)" : content;
        return truncated;
      } catch (e) {
        return JSON.stringify({ error: `Cannot read: ${(e as Error).message}` });
      }
    }
    if (name === "list_files") {
      const pattern = String(input.pattern ?? "");
      const all = walk(REPO_ROOT)
        .map((f) => relative(REPO_ROOT, f))
        .filter((f) => globMatch(pattern, f))
        .slice(0, 200);
      return JSON.stringify(all);
    }
    if (name === "grep_code") {
      const pattern = String(input.pattern ?? "");
      const glob = input.glob ? String(input.glob) : "src/**/*";
      const rx = new RegExp(pattern, "i");
      const files = walk(REPO_ROOT)
        .map((f) => relative(REPO_ROOT, f))
        .filter((f) => globMatch(glob, f))
        .slice(0, 2000);
      const hits: string[] = [];
      for (const rel of files) {
        try {
          const content = readFileSync(join(REPO_ROOT, rel), "utf-8");
          const lines = content.split("\n");
          for (let i = 0; i < lines.length; i++) {
            if (rx.test(lines[i])) {
              hits.push(`${rel}:${i + 1}: ${lines[i].slice(0, 200)}`);
              if (hits.length >= 200) break;
            }
          }
        } catch {
          /* skip unreadable */
        }
        if (hits.length >= 200) break;
      }
      return hits.join("\n") || "(no matches)";
    }
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  } catch (e) {
    return JSON.stringify({ error: (e as Error).message });
  }
}

type Msg = Anthropic.Messages.MessageParam;

export async function POST(req: NextRequest) {
  const admin = await getAdminMember();
  if (!admin) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY non configurata sul server" },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body non valido" }, { status: 400 });
  }
  const { messages } = (body ?? {}) as { messages?: Msg[] };
  if (!Array.isArray(messages)) {
    return NextResponse.json({ ok: false, error: "messages required" }, { status: 400 });
  }

  const supabase = await createClient();
  const anthropic = new Anthropic({ apiKey });

  const conversation: Msg[] = [...messages];
  let turns = 0;
  const maxTurns = 20;

  while (turns < maxTurns) {
    turns++;
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: conversation,
    });

    conversation.push({ role: "assistant", content: resp.content });

    if (resp.stop_reason !== "tool_use") {
      return NextResponse.json({ ok: true, messages: conversation });
    }

    // Execute tool calls
    const toolUses = resp.content.filter(
      (b): b is Anthropic.Messages.ToolUseBlock => b.type === "tool_use",
    );
    const toolResults: Anthropic.Messages.ToolResultBlockParam[] = [];
    for (const tu of toolUses) {
      const out = await runTool(tu.name, tu.input as Record<string, unknown>, supabase);
      toolResults.push({
        type: "tool_result",
        tool_use_id: tu.id,
        content: out,
      });
    }
    conversation.push({ role: "user", content: toolResults });
  }

  return NextResponse.json({
    ok: false,
    error: `Max turns (${maxTurns}) reached`,
    messages: conversation,
  });
}
