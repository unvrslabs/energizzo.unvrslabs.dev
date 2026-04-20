export const STATUS_CONFIG = {
  da_contattare: { label: "Da contattare", color: "#94a3b8", dark: false, order: 0 },
  primo_contatto: { label: "Primo contatto", color: "#60a5fa", dark: false, order: 1 },
  qualificato: { label: "Qualificato", color: "#38bdf8", dark: false, order: 2 },
  call_fissata: { label: "Call fissata", color: "#818cf8", dark: false, order: 3 },
  call_effettuata: { label: "Call effettuata", color: "#a78bfa", dark: false, order: 4 },
  demo_fissata: { label: "Demo fissata", color: "#c084fc", dark: false, order: 5 },
  demo_effettuata: { label: "Demo effettuata", color: "#e879f9", dark: false, order: 6 },
  proposta_inviata: { label: "Proposta inviata", color: "#f472b6", dark: false, order: 7 },
  negoziazione: { label: "Negoziazione", color: "#fb923c", dark: false, order: 8 },
  chiuso_vinto: { label: "Chiuso vinto", color: "#22c55e", dark: false, order: 9 },
  chiuso_perso: { label: "Chiuso perso", color: "#ef4444", dark: false, order: 10 },
  non_interessato: { label: "Non interessato", color: "#6b7280", dark: false, order: 11 },
} as const;

export type Status = keyof typeof STATUS_CONFIG;

export const STATUSES_IN_ORDER = (
  Object.entries(STATUS_CONFIG) as [Status, (typeof STATUS_CONFIG)[Status]][]
)
  .sort(([, a], [, b]) => a.order - b.order)
  .map(([k]) => k);

export const ACTIVE_PIPELINE_STATUSES: Status[] = [
  "primo_contatto",
  "qualificato",
  "call_fissata",
  "call_effettuata",
  "demo_fissata",
  "demo_effettuata",
  "proposta_inviata",
  "negoziazione",
];

export const TIPO_SERVIZIO_VALUES = ["Dual (Ele+Gas)", "Solo Elettrico", "Solo Gas"] as const;
export type TipoServizio = (typeof TIPO_SERVIZIO_VALUES)[number];
