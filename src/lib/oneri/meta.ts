/**
 * Metadati UI per oneri luce/gas ARERA.
 * Labels umane per tipologie (OT) + raggruppamento componenti.
 */

export type Commodity = "luce" | "gas";

/** Tipologie ARERA luce (campo `ot`). */
export const LUCE_TIPOLOGIE: Record<string, { label: string; group: string }> = {
  td: { label: "Domestico residente", group: "Domestico" },
  tdnr: { label: "Domestico non residente", group: "Domestico" },
  bta1: { label: "BT altri usi · fascia 1", group: "BT altri usi" },
  bta2: { label: "BT altri usi · fascia 2", group: "BT altri usi" },
  bta3: { label: "BT altri usi · fascia 3", group: "BT altri usi" },
  bta4: { label: "BT altri usi · fascia 4", group: "BT altri usi" },
  bta5: { label: "BT altri usi · fascia 5", group: "BT altri usi" },
  bta6: { label: "BT altri usi · fascia 6", group: "BT altri usi" },
  btip: { label: "BT illuminazione pubblica", group: "BT illuminazione" },
  mta1: { label: "MT altri usi · fascia 1", group: "MT altri usi" },
  mta2: { label: "MT altri usi · fascia 2", group: "MT altri usi" },
  mta3: { label: "MT altri usi · fascia 3", group: "MT altri usi" },
  mtip: { label: "MT illuminazione pubblica", group: "MT illuminazione" },
};

export const LUCE_GROUPS_ORDER = [
  "Domestico",
  "BT altri usi",
  "BT illuminazione",
  "MT altri usi",
  "MT illuminazione",
];

/** Componenti luce raggruppate per famiglia, con unità di misura. */
export const LUCE_COMPONENTI_GROUPS: {
  title: string;
  items: { key: string; label: string; unit: string }[];
}[] = [
  {
    title: "Oneri generali di sistema",
    items: [
      { key: "asos_fissa", label: "ASOS fissa", unit: "€/POD/mese" },
      { key: "asos_potenza", label: "ASOS potenza", unit: "€/kW/mese" },
      { key: "asos_variabile", label: "ASOS variabile", unit: "€/kWh" },
      { key: "arim_fissa", label: "ARIM fissa", unit: "€/POD/mese" },
      { key: "arim_potenza", label: "ARIM potenza", unit: "€/kW/mese" },
      { key: "arim_variabile", label: "ARIM variabile", unit: "€/kWh" },
    ],
  },
  {
    title: "Trasmissione e misura",
    items: [
      { key: "misura", label: "Misura", unit: "€/POD/mese" },
      { key: "trasmissione_variabile", label: "Trasmissione", unit: "€/kWh" },
    ],
  },
  {
    title: "Tariffe TAU (distribuzione)",
    items: [
      { key: "tau1_fissa", label: "TAU1 fissa", unit: "€/POD/mese" },
      { key: "tau2_potenza", label: "TAU2 potenza", unit: "€/kW/mese" },
      { key: "tau3_variabile", label: "TAU3 variabile", unit: "€/kWh" },
    ],
  },
  {
    title: "Distributore · altre quote",
    items: [
      { key: "quota_fissa_trasporto", label: "Quota fissa trasporto", unit: "€/POD/mese" },
      { key: "quota_potenza", label: "Quota potenza", unit: "€/kW/mese" },
      { key: "quota_variabile_distributore", label: "Quota variabile distributore", unit: "€/kWh" },
    ],
  },
  {
    title: "Componenti UC",
    items: [
      { key: "uc3_variabile", label: "UC3 variabile", unit: "€/kWh" },
      { key: "uc6_fissa", label: "UC6 fissa", unit: "€/POD/mese" },
      { key: "uc6_potenza", label: "UC6 potenza", unit: "€/kW/mese" },
      { key: "uc6_variabile", label: "UC6 variabile", unit: "€/kWh" },
    ],
  },
];

const MONTHS_IT = [
  "gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno",
  "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre",
];
const MONTHS_IT_SHORT = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

export function formatPeriodoKey(key: string): string {
  // "2026-03" → "marzo 2026"
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return `${MONTHS_IT[m - 1]} ${y}`;
}

export function formatPeriodoKeyShort(key: string): string {
  const [y, m] = key.split("-").map(Number);
  if (!y || !m) return key;
  return `${MONTHS_IT_SHORT[m - 1]} ${String(y).slice(2)}`;
}

export function currentMonthKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Formatta un valore stringa (es "0.028657") in una cifra leggibile.
 * Gli oneri hanno 6 decimali, mostriamo 4-6 in base alla magnitudo.
 */
export function formatOnere(v: unknown): string {
  if (v === null || v === undefined || v === "") return "—";
  const n = typeof v === "number" ? v : parseFloat(String(v));
  if (!Number.isFinite(n)) return "—";
  if (n === 0) return "—";
  const abs = Math.abs(n);
  if (abs >= 1) return n.toFixed(4);
  if (abs >= 0.01) return n.toFixed(4);
  return n.toFixed(6);
}
