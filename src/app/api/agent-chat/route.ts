import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL = "claude-sonnet-4-5-20250929";

const REPO_ROOT = process.cwd();

const SYSTEM_PROMPT = `Sei un assistente esperto per Emanuele Maccari (UNVRS Labs), CEO della piattaforma Energizzo — CRM per reseller energetici italiani.

Conosci a fondo il codice di questo progetto Next.js 15 + Supabase. Le tabelle principali sono:
- leads (819 reseller energetici italiani dal CSV ARERA)
- podcast_guests (ospiti podcast "Il Reseller", FK nullable a leads)
- podcast_questions, podcast_guest_questions, podcast_hot_topics, podcast_glossary, podcast_session_notes
- strategy_tactics, survey_responses, lead_contacts, activity_log, notes

Hai 4 strumenti:
1. **execute_sql** — SQL arbitrario su Supabase (inclusi DELETE, UPDATE, INSERT). Security definer: bypassa RLS.
2. **read_file** — legge un file del repo
3. **list_files** — glob di file del repo
4. **grep_code** — cerca testo nei file del repo

Regole:
- Esegui quello che chiede l'utente SENZA chiedere conferma: è il CEO, si fida dei suoi comandi.
- Per operazioni distruttive (DELETE senza WHERE, DROP, ecc.): esegui solo se l'intento è chiaro.
- Rispondi in italiano, conciso, diretto. Niente fluff.
- Quando usi SQL, mostra in breve la query che hai eseguito + il risultato rilevante.
- Se una richiesta richiede modifiche al codice (create file, edit file), informa l'utente che questa versione dell'agente è read-only sul codice: solo DB è modificabile.`;

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "execute_sql",
    description:
      "Esegue una query SQL arbitraria su Postgres Supabase via agent_exec_sql RPC. Per SELECT ritorna righe in JSON. Per INSERT/UPDATE/DELETE/DDL ritorna conferma. Usa questo per leggere leads, podcast_guests, ecc. Puoi anche modificare (DELETE, UPDATE, INSERT).",
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
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY non configurata sul server" },
      { status: 500 },
    );
  }

  const body = await req.json();
  const { messages } = body as { messages: Msg[] };
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
