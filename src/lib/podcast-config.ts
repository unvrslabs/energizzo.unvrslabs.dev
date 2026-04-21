export const GUEST_STATUSES = [
  "target",
  "invited",
  "confirmed",
  "recorded",
  "published",
  "rejected",
] as const;
export type GuestStatus = (typeof GUEST_STATUSES)[number];

export const GUEST_STATUS_CONFIG: Record<GuestStatus, { label: string; color: string }> = {
  target: { label: "Target", color: "#64748b" },
  invited: { label: "Invitato", color: "#60a5fa" },
  confirmed: { label: "Confermato", color: "#a78bfa" },
  recorded: { label: "Registrato", color: "#f472b6" },
  published: { label: "Pubblicato", color: "#22c55e" },
  rejected: { label: "Rifiutato", color: "#ef4444" },
};

export const QUESTION_THEMES = [
  "margini",
  "switching",
  "arera",
  "ai",
  "m_a",
  "people",
  "trasversale",
] as const;
export type QuestionTheme = (typeof QUESTION_THEMES)[number];

export const QUESTION_THEME_LABEL: Record<QuestionTheme, string> = {
  margini: "Margini & modello economico",
  switching: "Switching & retention",
  arera: "Regole ARERA",
  ai: "AI & digitalizzazione",
  m_a: "M&A & futuro settore",
  people: "People & organizzazione",
  trasversale: "Trasversali",
};

export const QUESTION_PHASES = [
  "apertura",
  "approfondimento",
  "chiusura",
  "trappola",
] as const;
export type QuestionPhase = (typeof QUESTION_PHASES)[number];

export const HOT_TOPIC_INTENSITIES = ["bollente", "medio", "freddo"] as const;
export type HotTopicIntensity = (typeof HOT_TOPIC_INTENSITIES)[number];

export const HOT_TOPIC_INTENSITY_CONFIG: Record<HotTopicIntensity, { label: string; emoji: string }> = {
  bollente: { label: "Bollente", emoji: "🔥" },
  medio: { label: "Media intensità", emoji: "🌡️" },
  freddo: { label: "Freddo", emoji: "❄️" },
};

export const GLOSSARY_CATEGORIES = [
  "regolatore",
  "testi_integrati",
  "servizi",
  "prezzo",
  "processi",
  "segmenti",
  "evoluzioni",
] as const;
export type GlossaryCategory = (typeof GLOSSARY_CATEGORIES)[number];

export const GLOSSARY_CATEGORY_LABEL: Record<GlossaryCategory, string> = {
  regolatore: "Regolatore e istituzioni",
  testi_integrati: "Testi integrati",
  servizi: "Tipi di servizio",
  prezzo: "Componenti di prezzo",
  processi: "Processi operativi",
  segmenti: "Segmenti clientela",
  evoluzioni: "Evoluzioni in corso",
};

export const GUEST_TIERS = [1, 2, 3] as const;
export type GuestTier = (typeof GUEST_TIERS)[number];

export const GUEST_CATEGORIES = ["A", "B", "C", "D", "E", "F"] as const;
export type GuestCategory = (typeof GUEST_CATEGORIES)[number];

export const GUEST_CATEGORY_LABEL: Record<GuestCategory, string> = {
  A: "Multiutility locale / ex-municipalizzata",
  B: "Reseller puro indipendente",
  C: "Trader trasformato",
  D: "Brand digitale / nativo online",
  E: "Specializzato di nicchia",
  F: "Recente acquisizione PE",
};
