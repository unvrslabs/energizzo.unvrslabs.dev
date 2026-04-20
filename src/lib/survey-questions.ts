// Labels map used by the CRM to render survey responses in the lead drawer.
// Keep in sync with the standalone survey site at report.unvrslabs.dev.

export const SURVEY_QUESTION_LABELS: Record<string, string> = {
  Q1: "Nome dell'azienda",
  Q2: "Partita IVA",
  Q3: "Ruolo del compilatore",
  Q4: "Anno di avvio dell'attività",
  Q5: "Tipologia di servizio",
  Q6: "Numero POD + PDR",
  Q7a: "Quota fatturato Residenziali / Domestici",
  Q7b: "Quota fatturato Micro-imprese",
  Q7c: "Quota fatturato PMI",
  Q7d: "Quota fatturato Industriali (AT)",
  Q8: "Numero dipendenti",
  Q9: "Cost-to-serve medio per cliente residenziale",
  Q10: "CAC medio per cliente residenziale",
  Q11: "DSO medio",
  Q12: "Churn rate annuale residenziale",
  Q13: "Quota fatturato back-office",
  Q14: "Tasso di morosità 2024",
  Q15: "Tempo medio di attivazione",
  Q16: "FTE back-office per 10.000 POD/PDR",
  Q17: "Contatti inbound / mille clienti / mese",
  Q18: "Reclami formali / 10.000 clienti",
  Q19: "Gestionale usato",
  Q20: "Processi automatizzati",
  Q21: "Adozione AI generativa",
  Q22: "Ranking pressioni business (18 mesi)",
  Q23: "Priorità strategica 2026 – 2027",
  Q24: "Modalità consegna benchmark",
  Q24b: "Email alternativa",
};

export const SURVEY_QUESTION_ORDER: string[] = [
  "Q1","Q2","Q3","Q4","Q5","Q6","Q7a","Q7b","Q7c","Q7d","Q8",
  "Q9","Q10","Q11","Q12","Q13","Q14",
  "Q15","Q16","Q17","Q18",
  "Q19","Q20","Q21",
  "Q22","Q23",
  "Q24","Q24b",
];

export type SurveyStatus = "not_sent" | "sent" | "partial" | "completed";

export const SURVEY_STATUS_CONFIG: Record<
  SurveyStatus,
  { label: string; color: string; dot: string }
> = {
  not_sent: { label: "Non inviata", color: "text-muted-foreground border-border/60", dot: "#64748b" },
  sent: { label: "Inviata", color: "text-sky-300 border-sky-500/50 bg-sky-500/10", dot: "#38bdf8" },
  partial: { label: "In corso", color: "text-amber-300 border-amber-500/50 bg-amber-500/10", dot: "#f59e0b" },
  completed: { label: "Compilata", color: "text-emerald-300 border-emerald-500/50 bg-emerald-500/10", dot: "#22c55e" },
};
