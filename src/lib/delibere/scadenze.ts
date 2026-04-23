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

/**
 * Ritorna tutte le scadenze future estratte dalle delibere (via Claude AI).
 * Ordinate per data crescente. Scadenze nel passato filtrate.
 */
export async function listScadenzeFuture(): Promise<ScadenzaView[]> {
  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data, error } = await supabase
    .from("delibere_cache")
    .select("id, numero, titolo, ai_scadenze")
    .not("ai_scadenze", "is", null);
  if (error) throw new Error(`listScadenzeFuture: ${error.message}`);

  const out: ScadenzaView[] = [];
  for (const row of data ?? []) {
    const raw = row.ai_scadenze as unknown;
    if (!Array.isArray(raw)) continue;
    for (const s of raw) {
      if (!s || typeof s !== "object") continue;
      const obj = s as Record<string, unknown>;
      const date = String(obj.date ?? "").trim();
      const label = String(obj.label ?? "").trim();
      const tipo = String(obj.tipo ?? "").trim() as ScadenzaTipo;
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      if (date < today) continue;
      if (!label) continue;
      out.push({
        date,
        label,
        tipo,
        deliberaId: row.id,
        deliberaNumero: row.numero,
        deliberaTitolo: row.titolo,
      });
    }
  }

  out.sort((a, b) => a.date.localeCompare(b.date));
  return out;
}

export async function countScadenzeFuture(): Promise<number> {
  const all = await listScadenzeFuture();
  return all.length;
}
