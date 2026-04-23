import { createClient } from "@/lib/supabase/server";

export type ScadenzaTipo =
  | "entrata_vigore"
  | "adempimento"
  | "consultazione"
  | "asta"
  | "scadenza"
  | "reporting";

export type ScadenzaView = {
  date: string; // ISO YYYY-MM-DD
  label: string;
  tipo: ScadenzaTipo;
  deliberaId: number;
  deliberaNumero: string;
  deliberaTitolo: string;
};

export const SCADENZA_LABEL: Record<ScadenzaTipo, string> = {
  entrata_vigore: "Entrata in vigore",
  adempimento: "Adempimento",
  consultazione: "Consultazione",
  asta: "Asta",
  scadenza: "Scadenza",
  reporting: "Reporting",
};

const VALID_TIPI = new Set<ScadenzaTipo>([
  "entrata_vigore",
  "adempimento",
  "consultazione",
  "asta",
  "scadenza",
  "reporting",
]);

/**
 * Ritorna tutte le scadenze future estratte dalle delibere (via Claude AI).
 * Usa la RPC Postgres `list_scadenze_future` che fa unnest + filtro server-side.
 * Evita di trasferire tutte le delibere al Node + parsing in memoria.
 */
export async function listScadenzeFuture(): Promise<ScadenzaView[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("list_scadenze_future");
  if (error) throw new Error(`listScadenzeFuture: ${error.message}`);

  const out: ScadenzaView[] = [];
  for (const row of data ?? []) {
    const tipo = (row.tipo ?? "") as ScadenzaTipo;
    if (!VALID_TIPI.has(tipo)) continue;
    out.push({
      date: row.date,
      label: row.label,
      tipo,
      deliberaId: row.delibera_id,
      deliberaNumero: row.delibera_numero,
      deliberaTitolo: row.delibera_titolo,
    });
  }
  return out;
}

export async function countScadenzeFuture(): Promise<number> {
  const all = await listScadenzeFuture();
  return all.length;
}
