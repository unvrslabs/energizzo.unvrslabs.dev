import { NextResponse, type NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getNetworkMemberFromRequest } from "@/lib/network/session";
import { generateDeliberaSummary } from "@/actions/delibere-summary";

export const dynamic = "force-dynamic";
export const maxDuration = 120;

const MODEL = "claude-sonnet-4-5-20250929";

/**
 * Agente conversazionale per membri del network Il Dispaccio.
 *
 * GROUNDING STRICT: l'agente risponde SOLO con dati ottenuti dai tool
 * (delibere_cache, testi_integrati_cache, market_*, ecc).
 * Se i tool non ritornano dati pertinenti, l'agente DEVE rispondere
 * "Non ho questa informazione nelle mie fonti" — mai inventare.
 *
 * Differenze vs /api/agent-chat (admin):
 * - NO execute_sql arbitrario
 * - NO generate_social_post
 * - Solo query strutturate read-only
 * - System prompt pro-grounding severo
 */

const SYSTEM_PROMPT = `Ti chiami **Max Power**. Sei l'assistente AI de "Il Dispaccio", il network italiano dei reseller energia. Stai parlando con un MEMBRO del network (reseller, trader, energy manager). Quando ti presenti o ti chiedono chi sei, dici che sei Max Power, l'agente editoriale del network.

## REGOLA FONDAMENTALE — GROUNDING STRICT
Le tue risposte DEVONO basarsi ESCLUSIVAMENTE sui dati ritornati dai tool a tua disposizione. NON devi:
- Usare conoscenza pre-training generica
- Inventare dettagli o numeri non presenti nei tool_result
- Dare opinioni o previsioni personali
- Parafrasare "a senso" — cita sempre fedelmente i dati ricevuti

Se l'utente chiede di una delibera/TI/dato che non trovi nei tool → rispondi esplicitamente:
"Non ho questa informazione nelle mie fonti. Fonti disponibili: delibere ARERA/GME/MASE nel database Il Dispaccio (con summary AI), testi integrati ARERA, market data PUN/gas/ENTSO-E, podcast 'Il Reseller'."

## Fonti a tua disposizione
- **delibere_cache** — tutte le delibere ARERA/GME/MASE con summary AI, bullet operativi, scadenze estratte, importanza
- **testi_integrati_cache** — Testi Integrati ARERA con summary AI, data entrata vigore, settore
- **market_power_pun** — PUN stimato giornaliero da ENTSO-E (media pesata 7 zone)
- **market_gas_storage** — AGSI stoccaggi gas Italia (riempimento %, trend)
- **market_entsoe** — mix generazione, load forecast, renewable forecast, cross-border flows
- **podcast_guests / podcast_questions** — info su ospiti e domande del podcast

## Stile risposta (CRITICO — leggibilità prima di tutto)

Devi scrivere risposte SCHEMATIZZATE, LEGGIBILI, non caotiche.

REGOLE FORMATTAZIONE:
- Usa heading con "## " per titoli di sezione (max 3-5 parole)
- Bullet list con "- " per elencare punti (mai più di 5-6 bullet consecutivi)
- **grassetto** SOLO per termini chiave isolati (numeri, sigle, date). MAI abusarne su intere frasi
- Riga vuota tra sezioni diverse per respiro
- Niente asterischi inline a raffica tipo "**X** **Y** **Z**". Se un paragrafo ha più di 2-3 **bold** → rimuovili
- Niente markdown header H1 (# titolo), usa ## massimo

STRUTTURA RACCOMANDATA per una delibera:

## Delibera {numero}
Una riga di sintesi.

## Cosa cambia
- Punto operativo 1
- Punto operativo 2
- Punto operativo 3

## Scadenze
- {data}: {cosa accade}
- {data}: {cosa accade}

## Fonte
Delibera {numero}/{anno}/R/{settore} — ARERA.

ALTRI STILI:
- Italiano asciutto, pragmatico. Zero fluff tipo "È importante notare che...".
- Dati numerici sempre con unità di misura (€/MWh, %, TWh, GWh, €/PDR/anno).
- Se hai bullet AI dal summary, usali direttamente (non riformulare).
- Lunghezza ideale: 10-25 righe. Evita muri di testo.

## Quando usare quale tool
- Domanda su delibera specifica (numero/argomento) → search_delibere → poi get_delibera(id) per dettaglio
  * get_delibera GENERA L'ANALISI AI se manca (trigger automatico + salvataggio in DB)
  * Se l'utente menziona @delibera con id=X nel messaggio, vai DIRETTO a get_delibera(X), salta search
- Testi integrati → search_testi_integrati
- Prezzo PUN/gas/stoccaggi → get_market_snapshot
- Scadenze → list_scadenze_prossime
- Quando non sai se il dato esiste nelle fonti → usa i tool per verificare PRIMA di rispondere.

## Formato mention utente
L'utente può usare @mention per riferirsi a una delibera specifica. Il messaggio conterrà una stringa tipo:
"@delibera:123 (40/2014/R/gas) — spiegami nel dettaglio"
Il numero dopo "@delibera:" è l'ID interno (bigint). Usa quell'ID con get_delibera(id=123). Non chiedere conferma.`;

const TOOLS: Anthropic.Messages.Tool[] = [
  {
    name: "search_delibere",
    description:
      "Cerca delibere ARERA/GME/MASE per testo libero (numero, titolo, argomento). Ritorna lista di max 15 match con id, numero, titolo, data, summary breve. Usa per trovare il id di una delibera menzionata dall'utente.",
    input_schema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Testo di ricerca (es: 'dispacciamento', '40/2014', 'stoccaggi', 'compliance reseller')",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "get_delibera",
    description:
      "Ritorna il dettaglio completo di una delibera: numero, titolo, data pubblicazione, settore, ai_summary, ai_bullets operativi, ai_scadenze estratte, ai_importanza. Se l'analisi AI non esiste ancora, la GENERA automaticamente e salva in DB (stesso trigger usato dal bottone 'analizza' nell'UI). Usa sempre questo tool quando l'utente chiede di una delibera specifica.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string", description: "ID bigint della delibera" },
      },
      required: ["id"],
    },
  },
  {
    name: "search_testi_integrati",
    description:
      "Cerca Testi Integrati ARERA (TIT, TIQE, TIUF, ecc) per testo libero. Ritorna lista con id, codice, titolo, settore.",
    input_schema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_testo_integrato",
    description: "Dettaglio completo di un Testo Integrato ARERA.",
    input_schema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
    },
  },
  {
    name: "list_scadenze_prossime",
    description:
      "Ritorna le scadenze regolatorie estratte dalle delibere entro N giorni (default 30). Output: lista con data, label, delibera origine.",
    input_schema: {
      type: "object",
      properties: {
        days: {
          type: "number",
          description: "Giorni avanti per il cutoff (default 30)",
        },
      },
    },
  },
  {
    name: "get_market_snapshot",
    description:
      "Ritorna lo stato attuale del mercato: ultimo PUN stimato (€/MWh + delta settimana), stoccaggi gas AGSI (%), mix generazione, load forecast prossimo giorno, cross-border flows. Tutto in un'unica chiamata.",
    input_schema: { type: "object", properties: {} },
  },
  {
    name: "list_podcast_episodes",
    description:
      "Lista degli ospiti podcast 'Il Reseller' con titolo episodio, ruolo, azienda, stato pubblicazione.",
    input_schema: { type: "object", properties: {} },
  },
];

type Msg = Anthropic.Messages.MessageParam;

/* eslint-disable @typescript-eslint/no-explicit-any */
async function runTool(
  name: string,
  input: Record<string, unknown>,
  supabase: any,
): Promise<string> {
  try {
    if (name === "search_delibere") {
      const q = String(input.query ?? "").trim();
      if (!q) return JSON.stringify({ error: "query vuota" });
      const { data, error } = await supabase
        .from("delibere_cache")
        .select("id,numero,titolo,data_pubblicazione,settore,ai_importanza,ai_summary")
        .or(
          `numero.ilike.%${q}%,titolo.ilike.%${q}%,ai_summary.ilike.%${q}%`,
        )
        .order("data_pubblicazione", { ascending: false, nullsFirst: false })
        .limit(15);
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data ?? []);
    }
    if (name === "get_delibera") {
      const id = Number(input.id);
      if (!id) return JSON.stringify({ error: "id invalido" });

      // Ensure analysis exists. generateDeliberaSummary è idempotente:
      // se già analizzata ritorna cached, altrimenti fa lock+generate+save.
      let analysisNote = "cached";
      try {
        const result = await generateDeliberaSummary(id);
        analysisNote = result.cached ? "cached" : "appena generata";
      } catch (e) {
        analysisNote = `skip: ${(e as Error).message.slice(0, 120)}`;
      }

      const { data, error } = await supabase
        .from("delibere_cache")
        .select(
          "id,numero,titolo,descrizione,data_pubblicazione,settore,stato,ai_summary,ai_bullets,ai_scadenze,ai_importanza,ai_categoria_impatto,url_riferimento,documento_url",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) return JSON.stringify({ error: error.message });
      if (!data) return JSON.stringify({ error: "delibera non trovata" });
      return JSON.stringify({ ...data, _analysis: analysisNote });
    }
    if (name === "search_testi_integrati") {
      const q = String(input.query ?? "").trim();
      if (!q) return JSON.stringify({ error: "query vuota" });
      const { data, error } = await supabase
        .from("testi_integrati_cache")
        .select("id,codice,titolo,settore,data_entrata_vigore,ai_summary")
        .or(`codice.ilike.%${q}%,titolo.ilike.%${q}%,ai_summary.ilike.%${q}%`)
        .limit(15);
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data ?? []);
    }
    if (name === "get_testo_integrato") {
      const id = Number(input.id);
      if (!id) return JSON.stringify({ error: "id invalido" });
      const { data, error } = await supabase
        .from("testi_integrati_cache")
        .select(
          "id,codice,titolo,descrizione,data_entrata_vigore,data_scadenza,settore,stato,ai_summary,ai_bullets,delibera_riferimento,url_riferimento,documento_url",
        )
        .eq("id", id)
        .maybeSingle();
      if (error) return JSON.stringify({ error: error.message });
      if (!data) return JSON.stringify({ error: "testo integrato non trovato" });
      return JSON.stringify(data);
    }
    if (name === "list_scadenze_prossime") {
      const days = Number(input.days ?? 30);
      const today = new Date();
      const cutoff = new Date(today);
      cutoff.setDate(cutoff.getDate() + days);
      // Query: delibere con ai_scadenze; filtra in JS
      const { data, error } = await supabase
        .from("delibere_cache")
        .select("id,numero,titolo,ai_scadenze")
        .not("ai_scadenze", "is", null)
        .limit(100);
      if (error) return JSON.stringify({ error: error.message });
      const out: Array<Record<string, unknown>> = [];
      for (const d of data ?? []) {
        const scadenze = d.ai_scadenze as
          | Array<{ date: string; label: string; tipo?: string }>
          | null;
        if (!scadenze) continue;
        for (const s of scadenze) {
          if (!s.date) continue;
          const ds = new Date(s.date);
          if (ds >= today && ds <= cutoff) {
            out.push({
              data: s.date,
              label: s.label,
              tipo: s.tipo,
              delibera_id: d.id,
              delibera_numero: d.numero,
              delibera_titolo: d.titolo,
            });
          }
        }
      }
      out.sort((a: any, b: any) => (a.data as string).localeCompare(b.data as string));
      return JSON.stringify(out.slice(0, 50));
    }
    if (name === "get_market_snapshot") {
      const [pun, gas, mix, load, renew, flows] = await Promise.all([
        supabase
          .from("market_power_pun")
          .select("price_day,price_eur_mwh,zones,source")
          .order("price_day", { ascending: false })
          .limit(8),
        supabase
          .from("market_gas_storage")
          .select("gas_day,full_pct,gas_in_storage_twh,working_gas_volume_twh,trend_pct,net_withdrawal_gwh")
          .eq("country", "IT")
          .eq("company", "aggregate")
          .order("gas_day", { ascending: false })
          .limit(8),
        supabase
          .from("market_entsoe")
          .select("reference_day,payload")
          .eq("metric_type", "generation_mix")
          .order("reference_day", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("market_entsoe")
          .select("reference_day,payload")
          .eq("metric_type", "load_forecast")
          .order("reference_day", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("market_entsoe")
          .select("reference_day,payload")
          .eq("metric_type", "renewable_forecast")
          .order("reference_day", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("market_entsoe")
          .select("reference_day,payload")
          .eq("metric_type", "cross_border_flows")
          .order("reference_day", { ascending: false })
          .limit(1)
          .maybeSingle(),
      ]);
      return JSON.stringify({
        pun_storico_8gg: pun.data ?? [],
        gas_storage_8gg: gas.data ?? [],
        generation_mix: mix.data ?? null,
        load_forecast: load.data ?? null,
        renewable_forecast: renew.data ?? null,
        cross_border_flows: flows.data ?? null,
      });
    }
    if (name === "list_podcast_episodes") {
      const { data, error } = await supabase
        .from("podcast_guests")
        .select("id,nome,azienda,ruolo,status,episode_title,notes")
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) return JSON.stringify({ error: error.message });
      return JSON.stringify(data ?? []);
    }
    return JSON.stringify({ error: `Unknown tool: ${name}` });
  } catch (e) {
    return JSON.stringify({ error: (e as Error).message });
  }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export async function POST(req: NextRequest) {
  const member = await getNetworkMemberFromRequest(req);
  if (!member) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "ANTHROPIC_API_KEY non configurata" },
      { status: 500 },
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "body invalido" }, { status: 400 });
  }
  const { messages } = (body ?? {}) as { messages?: Msg[] };
  if (!Array.isArray(messages)) {
    return NextResponse.json({ ok: false, error: "messages required" }, { status: 400 });
  }

  const supabase = await createClient();
  const anthropic = new Anthropic({ apiKey });

  const conversation: Msg[] = [...messages];
  let turns = 0;
  const maxTurns = 15;

  while (turns < maxTurns) {
    turns++;
    const resp = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 3000,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages: conversation,
    });

    conversation.push({ role: "assistant", content: resp.content });

    if (resp.stop_reason !== "tool_use") {
      return NextResponse.json({ ok: true, messages: conversation });
    }

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
