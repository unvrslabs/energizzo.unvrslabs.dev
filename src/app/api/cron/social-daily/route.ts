import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateAndInsert } from "@/lib/social/generator";
import { getLatestGasStorage, listGasStorageHistory } from "@/lib/market/storage-db";
import { getLatestPun, listPunHistory } from "@/lib/market/power-pun-db";

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
  | {
      kind: "market_gas";
      gas_day: string;
      full_pct: number;
      trend_pct: number | null;
      delta_week_pp: number | null;
      gas_in_storage_twh: number | null;
      working_gas_volume_twh: number | null;
      net_withdrawal_gwh: number | null;
      phase: "iniezione" | "erogazione" | "equilibrio";
    }
  | {
      kind: "market_power";
      price_day: string;
      pun_eur_mwh: number;
      delta_week_pct: number | null;
      zones: Record<string, number>;
    }
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
  const dow = new Date().getDay(); // 0 dom, 1 lun, 2 mar, 3 mer, 4 gio, 5 ven, 6 sab
  // Lun+Gio: gas storage AGSI / Mar+Ven: PUN elettrico
  const pickGas = dow === 1 || dow === 4;
  const pickPower = dow === 2 || dow === 5;
  if (!pickGas && !pickPower) return [];

  const since = addDays(new Date(), -2).toISOString();
  const { data: recentMarket } = await supabase
    .from("social_posts")
    .select("id")
    .eq("tipo", "market")
    .gte("created_at", since)
    .limit(1);
  if (recentMarket && recentMarket.length > 0) return [];

  if (pickGas) {
    const latest = await getLatestGasStorage();
    if (!latest || latest.full_pct == null) return [];

    const history = await listGasStorageHistory(10);
    const weekAgo = history.find((row) => {
      const d = new Date(row.gas_day);
      const diff = (new Date(latest.gas_day).getTime() - d.getTime()) / 86400000;
      return diff >= 6.5 && diff <= 8;
    });
    const delta_week_pp =
      weekAgo?.full_pct != null && latest.full_pct != null
        ? Number(latest.full_pct) - Number(weekAgo.full_pct)
        : null;

    const netWithdrawal = Number(latest.net_withdrawal_gwh ?? 0);
    const phase: "iniezione" | "erogazione" | "equilibrio" =
      netWithdrawal < -100
        ? "iniezione"
        : netWithdrawal > 100
          ? "erogazione"
          : "equilibrio";

    return [
      {
        kind: "market_gas" as const,
        gas_day: latest.gas_day,
        full_pct: Number(latest.full_pct),
        trend_pct: latest.trend_pct != null ? Number(latest.trend_pct) : null,
        delta_week_pp,
        gas_in_storage_twh:
          latest.gas_in_storage_twh != null
            ? Number(latest.gas_in_storage_twh)
            : null,
        working_gas_volume_twh:
          latest.working_gas_volume_twh != null
            ? Number(latest.working_gas_volume_twh)
            : null,
        net_withdrawal_gwh:
          latest.net_withdrawal_gwh != null
            ? Number(latest.net_withdrawal_gwh)
            : null,
        phase,
      },
    ];
  }

  // pickPower = PUN
  const latestPun = await getLatestPun();
  if (!latestPun) return [];
  const history = await listPunHistory(14);
  const weekAgo = history.find((row) => {
    const d = new Date(row.price_day);
    const diff =
      (new Date(latestPun.price_day).getTime() - d.getTime()) / 86400000;
    return diff >= 6.5 && diff <= 8;
  });
  const delta_week_pct =
    weekAgo && Number(weekAgo.price_eur_mwh) > 0
      ? ((Number(latestPun.price_eur_mwh) - Number(weekAgo.price_eur_mwh)) /
          Number(weekAgo.price_eur_mwh)) *
        100
      : null;

  return [
    {
      kind: "market_power" as const,
      price_day: latestPun.price_day,
      pun_eur_mwh: Number(latestPun.price_eur_mwh),
      delta_week_pct,
      zones: (latestPun.zones as Record<string, number>) ?? {},
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

    // Priority queue: scadenze urgenti > delibere alta > digest lunedì > market AGSI > delibere media
    const queue: Candidate[] = [];
    queue.push(...scadenze);
    queue.push(
      ...delibere.filter(
        (d) => d.kind === "delibera" && d.importanza === "alta",
      ),
    );
    queue.push(...digest);
    queue.push(...market);
    queue.push(
      ...delibere.filter(
        (d) => d.kind === "delibera" && d.importanza !== "alta",
      ),
    );

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
        } else if (c.kind === "market_power") {
          const pun = c.pun_eur_mwh.toFixed(1).replace(".", ",");
          const deltaWeek =
            c.delta_week_pct != null
              ? `${c.delta_week_pct > 0 ? "+" : ""}${c.delta_week_pct.toFixed(1).replace(".", ",")}%`
              : "";
          const zonesMinMax = Object.entries(c.zones).sort(
            (a, b) => a[1] - b[1],
          );
          const minZone = zonesMinMax[0];
          const maxZone = zonesMinMax[zonesMinMax.length - 1];
          const spread =
            minZone && maxZone ? (maxZone[1] - minZone[1]).toFixed(1).replace(".", ",") : "";

          const brief = `Market snapshot PUN REALE (stima media pesata zone italiane da dati ENTSO-E).

DATO UFFICIALE:
- Data rilevamento: ${c.price_day}
- PUN stimato: ${pun} €/MWh
- Variazione vs settimana scorsa: ${deltaWeek || "non calcolabile"}
- Zona più bassa: ${minZone ? `${minZone[0]} a ${minZone[1].toFixed(1)} €/MWh` : ""}
- Zona più alta: ${maxZone ? `${maxZone[0]} a ${maxZone[1].toFixed(1)} €/MWh` : ""}
- Spread Nord-Sud: ${spread} €/MWh
- Fonte: ENTSO-E via energy-charts.info (PUN stimato come media pesata su 7 zone)

CONTESTO per reseller:
Il PUN è il riferimento per i contratti indicizzati. Uno spread Nord-Sud >15 €/MWh
segnala tensioni di rete (congestioni interzonali). Variazioni settimanali >10%
meritano un commento operativo (cosa sta cambiando: meteo? nucleare francese?
domanda industriale?).

ISTRUZIONI output:
- copy_linkedin deve citare il numero ${pun} €/MWh e la variazione ${deltaWeek}
- hook forte: parla del numero
- Usa "PUN stimato" (non "PUN" secco) per correttezza — è una media pesata zone ENTSO-E, non il PUN ufficiale GME
- image_strategy.template = "data_card"
- image_data.kicker = "MERCATO ELETTRICO · ITALIA"
- image_data.label = "PUN"
- image_data.valore_grande = "${pun}"
- image_data.unita = "€/MWh"
- image_data.variazione = "${deltaWeek}"
- image_data.sottotitolo = "Media pesata 7 zone · ${c.price_day}"`;

          await generateAndInsert(
            supabase,
            { tipo: "market", brief },
            {
              generatedBy: "auto",
              notes: `🤖 Auto-generato · PUN ${c.price_day} · ${pun} €/MWh · ${new Date().toISOString()}`,
            },
          );
          stats.market_generated++;
        } else if (c.kind === "market_gas") {
          const fullPct = c.full_pct.toFixed(1).replace(".", ",");
          const deltaWeek =
            c.delta_week_pp != null
              ? `${c.delta_week_pp > 0 ? "+" : ""}${c.delta_week_pp.toFixed(1).replace(".", ",")} pp`
              : "";
          const storage = c.gas_in_storage_twh?.toFixed(1).replace(".", ",") ?? "";
          const capacity =
            c.working_gas_volume_twh?.toFixed(1).replace(".", ",") ?? "";
          const netFlow = c.net_withdrawal_gwh?.toFixed(0) ?? "";

          const brief = `Market snapshot settimanale DATI REALI AGSI (gas storage Italia aggregato).

DATO UFFICIALE:
- Data rilevamento: ${c.gas_day}
- Riempimento stoccaggi: ${fullPct}%
- Gas in storage: ${storage} TWh su ${capacity} TWh di working gas volume
- Variazione settimanale: ${deltaWeek || "non calcolabile"}
- Fase: ${c.phase} (net flow giornaliero ${netFlow} GWh)
- Fonte: AGSI+ (Gas Infrastructure Europe)

CONTESTO per reseller:
${c.phase === "iniezione" ? "Siamo in fase di riempimento estivo — momento per valutare coperture strutturali." : c.phase === "erogazione" ? "Siamo in fase di erogazione invernale — occhio alle tensioni di prezzo PSV." : "Il sistema è in equilibrio tra iniezione/erogazione."}
${c.delta_week_pp != null && Math.abs(c.delta_week_pp) > 2 ? `Variazione settimanale significativa (${deltaWeek}): segnalalo come fatto operativo.` : ""}

ISTRUZIONI output:
- copy_linkedin e copy_x devono citare esplicitamente il numero ${fullPct}% e il dato a confronto
- hook forte con il numero o la fase
- image_strategy.template = "data_card"
- image_data.kicker = "STOCCAGGI GAS · ITALIA"
- image_data.label = "RIEMPIMENTO"
- image_data.valore_grande = "${fullPct}"
- image_data.unita = "%"
- image_data.variazione = "${deltaWeek}"
- image_data.sottotitolo = "${storage} TWh in stoccaggio · fase ${c.phase}"`;

          await generateAndInsert(
            supabase,
            { tipo: "market", brief },
            {
              generatedBy: "auto",
              notes: `🤖 Auto-generato · AGSI ${c.gas_day} · ${fullPct}% · ${new Date().toISOString()}`,
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
