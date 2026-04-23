/**
 * Sync delibere from Energizzo public API into Supabase delibere_cache.
 *
 * Usage (from repo root):
 *   npx tsx scripts/sync-delibere.ts            # full sync, no AI
 *   npx tsx scripts/sync-delibere.ts --ai 30    # sync + generate first 30 AI summaries
 */

import { createClient } from "@supabase/supabase-js";
import Anthropic from "@anthropic-ai/sdk";
import { loadEnvLocal } from "./_env-loader";

loadEnvLocal();

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const API_BASE = "https://api8055.energizzo.it/api/public/delibere";
const MODEL = "claude-sonnet-4-5-20250929";
const UA = "Mozilla/5.0 (compatible; IlDispaccioBot/1.0; +https://ildispaccio.energy)";

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
    { "date": "YYYY-MM-DD", "label": "Breve ≤ 90 char", "tipo": "entrata_vigore" }
  ],
  "importanza": "critica" | "alta" | "normale" | "bassa",
  "categoria_impatto": "Breve label ≤ 40 char"
}

Regole summary/bullets:
- 4 bullet esatti, ciascuno ≤ 140 caratteri.
- Ogni bullet deve contenere UN dato concreto (numero, data, %, soglia) se presente nel testo.
- Prima parola → azione o dato. Niente fluff.
- "sectors": eel/gas/entrambi. Vuoto [] se non pertinente a reseller energia.

Regole scadenze:
- Estrai TUTTE le date future rilevanti menzionate nel testo (dal 2026-04-01 in avanti).
- Tipi: "entrata_vigore", "adempimento", "consultazione", "asta", "scadenza", "reporting".
- SOLO date presenti nel testo, formato YYYY-MM-DD. Max 6 scadenze.
- Label ≤ 90 char, concreta. Vuoto [] se non ci sono scadenze future.

Regole importanza:
- "critica" = aggiornamento tariffario diretto (QVD, CMEM, CCR, QE, TRAS/DIS/MIS, ASOS/ARIM/UC, fasce/scaglioni, aggiornamenti trimestrali/annuali tariffe regolate).
- "alta" = cambio operativo forte (STG/aste, SII, switching, recupero crediti, obblighi ARERA/CSEA/AU, bonus sociale/vulnerabili, CDISP, market coupling).
- "normale" = singoli operatori, sanzioni individuali, integrazioni anni passati, approvazioni.
- "bassa" = modifiche amministrative, registri, proroghe tecniche, atti procedurali.
"categoria_impatto" = label breve tipo "Componente QVD gas", "Tariffe distribuzione", "Asta STG", "Bonus sociale".
- Se la delibera cita STG, TRAS, DIS, MIS, PUN, asta, tariffa, oneri, switching, recupero crediti → PRIORITIZZA quella info nei bullet.
- Se il PDF è lungo o complesso, concentrati sul dispositivo (la parte decisionale, non le premesse).`;

type ApiDelibera = {
  id: number;
  numero: string;
  titolo: string;
  descrizione: string | null;
  tipo: string | null;
  settore: string | null;
  data_delibera: string | null;
  data_scadenza: string | null;
  data_pubblicazione: string | null;
  fonte: string | null;
  url_riferimento: string | null;
  stato: string | null;
  note: string | null;
  documento_url: string | null;
  documenti_urls: string[] | null;
  autore: { id: number; name: string } | null;
  created_at: string | null;
  updated_at: string | null;
};

type ApiResponse = {
  success: boolean;
  data: ApiDelibera[];
  total: number;
};

async function fetchAllDelibere(): Promise<ApiDelibera[]> {
  const res = await fetch(`${API_BASE}?per_page=500`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const json = (await res.json()) as ApiResponse;
  if (!json.success) throw new Error("API success=false");
  return json.data;
}

function mapSettoreToSector(settore: string | null): string[] {
  if (!settore) return [];
  const s = settore.toLowerCase();
  const result: string[] = [];
  if (s.includes("luce") || s.includes("elett") || s.includes("eel") || s.includes("energia")) result.push("eel");
  if (s.includes("gas")) result.push("gas");
  return result;
}

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE!, {
    auth: { persistSession: false },
  });

  console.log("⏳ Fetching delibere from Energizzo API…");
  const items = await fetchAllDelibere();
  console.log(`   ${items.length} records`);

  console.log("⏳ Upsert into delibere_cache…");
  const rows = items.map((d) => ({
    id: d.id,
    numero: d.numero,
    titolo: d.titolo,
    descrizione: d.descrizione,
    tipo: d.tipo,
    settore: d.settore,
    data_delibera: d.data_delibera,
    data_scadenza: d.data_scadenza,
    data_pubblicazione: d.data_pubblicazione,
    fonte: d.fonte,
    url_riferimento: d.url_riferimento,
    documento_url: d.documento_url,
    documenti_urls: d.documenti_urls ?? [],
    stato: d.stato,
    note: d.note,
    autore: d.autore,
    api_created_at: d.created_at,
    api_updated_at: d.updated_at,
    synced_at: new Date().toISOString(),
  }));

  // Upsert in chunks of 100
  for (let i = 0; i < rows.length; i += 100) {
    const chunk = rows.slice(i, i + 100);
    const { error } = await supabase
      .from("delibere_cache")
      .upsert(chunk, { onConflict: "id" });
    if (error) {
      console.error(`   chunk ${i}: ${error.message}`);
      process.exit(1);
    }
  }
  console.log(`   ${rows.length} rows upserted`);

  // AI summaries
  const aiArgIdx = process.argv.indexOf("--ai");
  if (aiArgIdx >= 0) {
    const n = Number(process.argv[aiArgIdx + 1] ?? "10");
    if (!ANTHROPIC_KEY) {
      console.error("Missing ANTHROPIC_API_KEY — skip AI");
      return;
    }
    await generateAiBatch(supabase, n);
  }

  console.log("✅ Done");
}

async function generateAiBatch(supabase: any, n: number) {
  console.log(`⏳ Generating AI summaries for top ${n}…`);
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("id, numero, titolo, descrizione, tipo, settore, documento_url, url_riferimento")
    .is("ai_generated_at", null)
    .is("ai_error", null)
    .order("data_delibera", { ascending: false, nullsFirst: false })
    .limit(n);
  if (error) {
    console.error(`   list failed: ${error.message}`);
    return;
  }
  if (!data || data.length === 0) {
    console.log("   nothing to generate");
    return;
  }

  const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY! });

  let ok = 0;
  let fail = 0;
  for (const row of data) {
    process.stdout.write(`   [${ok + fail + 1}/${data.length}] ${row.numero}… `);
    try {
      const result = await summarizeOne(anthropic, row);
      await supabase
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
        .eq("id", row.id);
      console.log(`ok (${result.source}, ${result.importanza}, ${result.scadenze.length} scad.)`);
      ok++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`FAIL — ${msg}`);
      await supabase
        .from("delibere_cache")
        .update({ ai_error: msg.slice(0, 500) })
        .eq("id", row.id);
      fail++;
    }
  }
  console.log(`   → ${ok} ok, ${fail} fail`);
}

async function summarizeOne(
  anthropic: Anthropic,
  row: {
    id: number;
    numero: string;
    titolo: string;
    descrizione: string | null;
    tipo: string | null;
    settore: string | null;
    documento_url: string | null;
    url_riferimento: string | null;
  },
): Promise<{ summary: string; bullets: string[]; sectors: string[]; source: "pdf" | "url" }> {
  const header =
    `Delibera ${row.tipo ?? ""} ${row.numero}\n` +
    `Titolo: ${row.titolo}\n` +
    (row.descrizione ? `Descrizione: ${row.descrizione}\n` : "") +
    (row.settore ? `Settore API: ${row.settore}\n` : "");

  let source: "pdf" | "url" = "url";
  const content: any[] = [];

  const pdfUrl = await resolvePdfUrl(row);
  if (pdfUrl) {
    try {
      const res = await fetch(pdfUrl, { headers: { "User-Agent": UA } });
      if (!res.ok) throw new Error(`PDF ${res.status}`);
      const buf = await res.arrayBuffer();
      if (buf.byteLength > 30 * 1024 * 1024) {
        throw new Error(`PDF too large ${buf.byteLength}`);
      }
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
      console.log(`\n     (pdf fetch failed: ${err instanceof Error ? err.message : err})`);
    }
  }

  content.push({
    type: "text",
    text:
      `${header}\n` +
      (source === "pdf"
        ? "Analizza il PDF della delibera sopra allegato.\nProduci il JSON secondo lo schema richiesto."
        : `Non ho il PDF. URL di riferimento: ${row.url_riferimento ?? "n/a"}.\n` +
          "Genera il JSON usando titolo/descrizione/numero come base."),
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
  if (!textBlock || textBlock.type !== "text") throw new Error("no text from Claude");

  const txt = textBlock.text.trim();
  const jsonStart = txt.indexOf("{");
  const jsonEnd = txt.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) throw new Error("no JSON in response");
  const parsed = JSON.parse(txt.slice(jsonStart, jsonEnd + 1));

  const summary = String(parsed.summary ?? "").trim();
  const bullets = Array.isArray(parsed.bullets)
    ? parsed.bullets.map((b: unknown) => String(b).trim()).filter(Boolean).slice(0, 5)
    : [];
  let sectors = Array.isArray(parsed.sectors)
    ? parsed.sectors.map((s: unknown) => String(s).toLowerCase()).filter((s: string) => ["eel", "gas"].includes(s))
    : [];
  if (sectors.length === 0) sectors = mapSettoreToSector(row.settore);

  const validTipi = new Set(["entrata_vigore","adempimento","consultazione","asta","scadenza","reporting"]);
  const scadenze = Array.isArray(parsed.scadenze)
    ? parsed.scadenze
        .map((s: unknown) => {
          if (!s || typeof s !== "object") return null;
          const o = s as Record<string, unknown>;
          const date = String(o.date ?? "").trim();
          const label = String(o.label ?? "").trim();
          const tipo = String(o.tipo ?? "").toLowerCase().trim();
          if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
          if (!label) return null;
          if (!validTipi.has(tipo)) return null;
          return { date, label: label.slice(0, 120), tipo };
        })
        .filter((x: unknown): x is { date: string; label: string; tipo: string } => x !== null)
        .slice(0, 6)
    : [];

  const validImp = new Set(["critica","alta","normale","bassa"]);
  const importanza = validImp.has(String(parsed.importanza ?? "").toLowerCase())
    ? String(parsed.importanza).toLowerCase()
    : "normale";
  const categoria_impatto = typeof parsed.categoria_impatto === "string" && parsed.categoria_impatto.trim()
    ? String(parsed.categoria_impatto).trim().slice(0, 60)
    : null;

  if (!summary || bullets.length === 0) throw new Error("empty summary or bullets");

  return { summary, bullets, sectors, scadenze, importanza, categoria_impatto, source };
}

async function resolvePdfUrl(row: {
  numero: string;
  url_riferimento: string | null;
  documento_url: string | null;
}): Promise<string | null> {
  const { numero, url_riferimento, documento_url } = row;

  if (url_riferimento && /arera\.it/i.test(url_riferimento)) {
    const parts = numero.split("/");
    if (parts.length >= 4) {
      const [n, yyyy, t, s] = parts;
      const yy = yyyy.slice(2);
      const guess = `https://www.arera.it/fileadmin/allegati/docs/${yy}/${n}-${yyyy}-${t}-${s}.pdf`;
      if (await headOk(guess)) return guess;
    }
    const scraped = await scrapeFirstPdf(url_riferimento);
    if (scraped && (await headOk(scraped))) return scraped;
  }

  if (documento_url && (await headOk(documento_url))) return documento_url;
  return null;
}

async function headOk(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA } });
    if (!res.ok) return false;
    const ct = res.headers.get("content-type") ?? "";
    return ct.includes("pdf");
  } catch {
    return false;
  }
}

async function scrapeFirstPdf(pageUrl: string): Promise<string | null> {
  try {
    const res = await fetch(pageUrl, { headers: { "User-Agent": UA } });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/href="([^"]+\.pdf)"/i);
    if (!m) return null;
    const href = m[1];
    if (href.startsWith("http")) return href;
    if (href.startsWith("//")) return `https:${href}`;
    const base = new URL(pageUrl);
    return new URL(href, `${base.protocol}//${base.host}`).toString();
  } catch {
    return null;
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
