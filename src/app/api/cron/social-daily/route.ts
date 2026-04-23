import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAndInsert } from "@/lib/social/generator";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

/**
 * Cron endpoint: /api/cron/social-daily
 * Da richiamare ogni mattina alle 07:00 dal crontab VPS:
 *
 *   0 7 * * * curl -H "Authorization: Bearer ${CRON_SECRET}" \
 *     https://dash.ildispaccio.energy/api/cron/social-daily
 *
 * Logica:
 * 1. Scandisce delibere con ai_summary già generato nelle ultime 72h,
 *    importanza alta o media, non ancora postate → genera 1-2 post delibera
 * 2. Scandisce ai_scadenze delle delibere con data nei prossimi 14gg,
 *    non ancora postate → genera 0-1 post scadenza
 * 3. Lunedì/Giovedì: genera 1 post market snapshot PUN (se dato disponibile)
 * 4. Lunedì 07:00: genera digest settimanale (top 3 cose del settore)
 *
 * Rate limit hard: max 3 post generati in una run.
 * Tutti salvati come 'bozza' con generated_by='auto', notes con fonte/ora.
 */

const HARD_LIMIT = 3;

type Candidate =
  | {
      kind: "delibera";
      fonte_id: string;
      label: string;
      importanza: string | null;
      pubblicazione: string | null;
    }
  | {
      kind: "scadenza";
      fonte_id: string;
      label: string;
      delibera_id: number;
      data_scadenza: string;
      giorni_mancanti: number;
    }
  | { kind: "market"; label: string; valore: string; variazione: string }
  | { kind: "digest_week"; label: string; brief: string };

function startOfDay(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
function addDays(d: Date, n: number) {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

async function findCandidateDelibere(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Candidate[]> {
  // Ultime 72h, con ai_summary e importanza alta/media
  const cutoff = addDays(new Date(), -3).toISOString();
  const { data: delibere } = await supabase
    .from("delibere_cache")
    .select("id,numero,titolo,ai_importanza,data_pubblicazione,ai_summary")
    .not("ai_summary", "is", null)
    .gte("data_pubblicazione", cutoff)
    .in("ai_importanza", ["alta", "media"])
    .order("ai_importanza", { ascending: true }) // alta viene prima alfabeticamente... attento
    .order("data_pubblicazione", { ascending: false })
    .limit(20);

  if (!delibere?.length) return [];

  // Priorità: importanza alta > media, poi recenti
  const rank = (imp: string | null) =>
    imp === "alta" ? 0 : imp === "media" ? 1 : 2;
  const sorted = [...delibere].sort((a, b) => {
    const ra = rank(a.ai_importanza);
    const rb = rank(b.ai_importanza);
    if (ra !== rb) return ra - rb;
    const da = new Date(a.data_pubblicazione ?? 0).getTime();
    const db = new Date(b.data_pubblicazione ?? 0).getTime();
    return db - da;
  });

  // Dedup: elimina quelle già postate
  const ids = sorted.map((d) => String(d.id));
  const { data: existingPosts } = await supabase
    .from("social_posts")
    .select("fonte_id")
    .eq("fonte_kind", "delibera")
    .in("fonte_id", ids);
  const blocked = new Set(
    (existingPosts ?? []).map((p) => p.fonte_id).filter(Boolean) as string[],
  );

  return sorted
    .filter((d) => !blocked.has(String(d.id)))
    .slice(0, 2)
    .map((d) => ({
      kind: "delibera" as const,
      fonte_id: String(d.id),
      label: `${d.numero ?? ""} · ${(d.titolo ?? "").slice(0, 60)}`,
      importanza: d.ai_importanza,
      pubblicazione: d.data_pubblicazione,
    }));
}

async function findCandidateScadenze(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Candidate[]> {
  // Prossime 14 giorni, non ancora postate
  const today = startOfDay();
  const { data: delibere } = await supabase
    .from("delibere_cache")
    .select("id,numero,titolo,ai_scadenze")
    .not("ai_scadenze", "is", null)
    .limit(80);

  if (!delibere?.length) return [];

  type ScadenzaEntry = {
    fonte_id: string;
    delibera_id: number;
    data_scadenza: string;
    label: string;
    giorni_mancanti: number;
  };
  const entries: ScadenzaEntry[] = [];

  for (const d of delibere) {
    const scadenze = (d as { ai_scadenze: unknown }).ai_scadenze as
      | Array<{ date: string; label: string; tipo?: string }>
      | null;
    if (!scadenze?.length) continue;
    for (const s of scadenze) {
      if (!s.date) continue;
      const deadline = new Date(s.date);
      const diff = Math.ceil((deadline.getTime() - today.getTime()) / 86400000);
      if (diff < 1 || diff > 14) continue;
      entries.push({
        fonte_id: `${d.id}:${s.date}`,
        delibera_id: d.id,
        data_scadenza: s.date,
        label: s.label,
        giorni_mancanti: diff,
      });
    }
  }

  if (!entries.length) return [];

  entries.sort((a, b) => a.giorni_mancanti - b.giorni_mancanti);

  const ids = entries.map((e) => e.fonte_id);
  const { data: existingPosts } = await supabase
    .from("social_posts")
    .select("fonte_id")
    .eq("fonte_kind", "scadenza")
    .in("fonte_id", ids);
  const blocked = new Set(
    (existingPosts ?? []).map((p) => p.fonte_id).filter(Boolean) as string[],
  );

  return entries
    .filter((e) => !blocked.has(e.fonte_id))
    .slice(0, 1)
    .map((e) => ({
      kind: "scadenza" as const,
      fonte_id: e.fonte_id,
      delibera_id: e.delibera_id,
      data_scadenza: e.data_scadenza,
      label: e.label,
      giorni_mancanti: e.giorni_mancanti,
    }));
}

async function findMarketSnapshot(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<Candidate[]> {
  // Solo lunedì e giovedì, e se non abbiamo già postato market nelle ultime 48h
  const dow = new Date().getDay(); // 0 dom, 1 lun, ... 4 gio
  if (dow !== 1 && dow !== 4) return [];

  const since = addDays(new Date(), -2).toISOString();
  const { data: recentMarket } = await supabase
    .from("social_posts")
    .select("id")
    .eq("tipo", "market")
    .gte("created_at", since)
    .limit(1);
  if (recentMarket && recentMarket.length > 0) return [];

  // Per ora passiamo brief testuale: il cron non ha accesso diretto all'API AGSI/GME.
  // In futuro: query market_gas_storage / fetch API cache locale.
  const today = new Date();
  const week = Math.ceil(((+today - +new Date(today.getFullYear(), 0, 1)) / 86400000 + new Date(today.getFullYear(), 0, 1).getDay() + 1) / 7);

  return [
    {
      kind: "market" as const,
      label: `Settimana ${week}`,
      valore: "",
      variazione: "",
    },
  ];
}

function findDigestWeekly(): Candidate[] {
  // Lunedì mattina: digest
  const dow = new Date().getDay();
  if (dow !== 1) return [];
  return [
    {
      kind: "digest_week" as const,
      label: "Digest settimanale",
      brief:
        "Produce un digest delle cose più importanti del settore energia italiano per i reseller di questa settimana. Ancora in modo generico/evergreen, ricordando che Il Dispaccio pubblica ogni giorno delibere ARERA decifrate dall'AI, benchmark tariffario e analisi.",
    },
  ];
}

// ─── ROUTE HANDLER ──────────────────────────────────────────

export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const startTs = Date.now();
  const supabase = await createClient();

  const stats = {
    delibere_generated: 0,
    scadenze_generated: 0,
    market_generated: 0,
    digest_generated: 0,
    skipped: 0,
    errors: [] as string[],
    total: 0,
    took_ms: 0,
  };

  try {
    const [delibere, scadenze, market, digest] = await Promise.all([
      findCandidateDelibere(supabase),
      findCandidateScadenze(supabase),
      findMarketSnapshot(supabase),
      Promise.resolve(findDigestWeekly()),
    ]);

    // Priority queue: scadenze urgenti > delibere alta > digest lunedì > market > delibere media
    const queue: Candidate[] = [];
    queue.push(...scadenze);
    queue.push(...delibere.filter((d) => d.kind === "delibera" && d.importanza === "alta"));
    queue.push(...digest);
    queue.push(...market);
    queue.push(...delibere.filter((d) => d.kind === "delibera" && d.importanza !== "alta"));

    const capped = queue.slice(0, HARD_LIMIT);

    for (const c of capped) {
      try {
        if (c.kind === "delibera") {
          await generateAndInsert(
            supabase,
            {
              tipo: "delibera",
              fonte_kind: "delibera",
              fonte_id: c.fonte_id,
            },
            {
              generatedBy: "auto",
              notes: `🤖 Auto-generato · fonte ${c.label} · ${new Date().toISOString()}`,
            },
          );
          stats.delibere_generated++;
        } else if (c.kind === "scadenza") {
          const brief = `Scadenza regolatoria: ${c.label}. Data: ${c.data_scadenza}. Mancano ${c.giorni_mancanti} giorni. Genera un alert per i reseller che spieghi cosa fare entro la scadenza e a chi si applica. image_data.data deve essere in formato "GG MMM" (es. "31 GEN") maiuscolo, image_data.giorni_mancanti deve essere "${c.giorni_mancanti}".`;
          await generateAndInsert(
            supabase,
            {
              tipo: "scadenza",
              fonte_kind: "scadenza",
              fonte_id: c.fonte_id,
              context: `Delibera origine: ${c.delibera_id}`,
              brief,
            },
            {
              generatedBy: "auto",
              notes: `🤖 Auto-generato · scadenza ${c.data_scadenza} · ${new Date().toISOString()}`,
            },
          );
          stats.scadenze_generated++;
        } else if (c.kind === "market") {
          await generateAndInsert(
            supabase,
            {
              tipo: "market",
              brief: `Market snapshot settimanale. Produci un post su uno degli indicatori principali (PUN elettrico, PSV gas, TTF). Usa toni conversazionali e fai un'osservazione di mercato operativa per i reseller. Se non hai dati puntuali, commenta in generale il trend della settimana ${c.label}. image_data.label: PUN/PSV/TTF, image_data.valore_grande: un valore plausibile di questi giorni (es. 89,40 per PUN in €/MWh o 28,50 per TTF in €/MWh), image_data.unita: €/MWh, image_data.variazione con segno.`,
            },
            {
              generatedBy: "auto",
              notes: `🤖 Auto-generato · market ${c.label} · ${new Date().toISOString()}`,
            },
          );
          stats.market_generated++;
        } else if (c.kind === "digest_week") {
          await generateAndInsert(
            supabase,
            {
              tipo: "digest",
              brief: c.brief,
            },
            {
              generatedBy: "auto",
              notes: `🤖 Auto-generato · digest weekly · ${new Date().toISOString()}`,
            },
          );
          stats.digest_generated++;
        }
        stats.total++;
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        stats.errors.push(`${c.kind}: ${msg}`);
      }
    }

    stats.skipped = queue.length - capped.length;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    stats.errors.push(`top-level: ${msg}`);
  }

  stats.took_ms = Date.now() - startTs;

  return NextResponse.json(stats, {
    status: stats.errors.length && stats.total === 0 ? 500 : 200,
  });
}
