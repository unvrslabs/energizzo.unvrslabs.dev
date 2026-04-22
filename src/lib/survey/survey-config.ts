// Survey config: Stato del Reseller Energia in Italia 2026
// Mirror of the CRM labels map — single source of truth for the survey site.

export type AnswerValue = string | string[] | null;
export type Answers = Record<string, AnswerValue>;

export type BaseScreen = {
  id: string;
  section?: { label: string; index: number };
  skipIf?: (a: Answers) => boolean;
};

export type WelcomeScreen = BaseScreen & {
  type: "welcome";
  title: string;
  description: string;
  buttonText: string;
};

export type StatementScreen = BaseScreen & {
  type: "statement";
  title: string;
  description: string;
  buttonText?: string;
};

export type ShortTextScreen = BaseScreen & {
  type: "short_text";
  title: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  pattern?: RegExp;
  patternMessage?: string;
  prefillFrom?: "ragione_sociale" | "piva";
};

export type LongTextScreen = BaseScreen & {
  type: "long_text";
  title: string;
  description?: string;
  required?: boolean;
  placeholder?: string;
  maxLength?: number;
};

export type SingleChoiceScreen = BaseScreen & {
  type: "single_choice";
  title: string;
  description?: string;
  required?: boolean;
  options: string[];
};

export type MultiChoiceScreen = BaseScreen & {
  type: "multi_choice";
  title: string;
  description?: string;
  required?: boolean;
  options: string[];
  maxSelections?: number;
};

export type RankingScreen = BaseScreen & {
  type: "ranking";
  title: string;
  description?: string;
  required?: boolean;
  options: string[];
};

export type ThanksScreen = BaseScreen & {
  type: "thanks";
  title: string;
  description: string;
  buttonText: string;
  buttonHref: string;
};

export type Screen =
  | WelcomeScreen
  | StatementScreen
  | ShortTextScreen
  | LongTextScreen
  | SingleChoiceScreen
  | MultiChoiceScreen
  | RankingScreen
  | ThanksScreen;

const SEC = {
  s1: { label: "Identificazione", index: 1 },
  s2: { label: "Profilo aziendale", index: 2 },
  s3: { label: "Economics", index: 3 },
  s4: { label: "Operations", index: 4 },
  s5: { label: "Stack tecnologico", index: 5 },
  s6: { label: "Outlook 2026 – 2027", index: 6 },
  s7: { label: "Benchmark privato", index: 7 },
} as const;

export const SURVEY_SCREENS: Screen[] = [
  {
    id: "welcome",
    type: "welcome",
    title: "Stato del Reseller Energia in Italia 2026",
    description:
      "Questa survey alimenta il primo report indipendente sui benchmark operativi del reseller energia italiano.\n\nCompilarla richiede 3 – 5 minuti. In cambio riceverai, entro 60 giorni, un benchmark privato della tua azienda confrontata in anonimato con i peer della tua fascia dimensionale.\n\nTutte le risposte sono aggregate. Nessun dato individuale sarà mai pubblicato o associato al nome della tua azienda.",
    buttonText: "Iniziamo",
  },
  {
    id: "sec1_intro",
    type: "statement",
    section: SEC.s1,
    title: "🏢 Iniziamo",
    description:
      "Tre domande base per identificare l'azienda. Questi dati servono solo per inviarti il benchmark privato e per il campionamento — non compariranno nel report pubblico.",
  },
  {
    id: "Q1",
    type: "short_text",
    section: SEC.s1,
    title: "Nome dell'azienda",
    required: true,
    placeholder: "Es. Energizzo S.r.l.",
    prefillFrom: "ragione_sociale",
  },
  {
    id: "Q2",
    type: "short_text",
    section: SEC.s1,
    title: "Partita IVA",
    description: "11 cifre, senza spazi né punti.",
    required: true,
    placeholder: "01234567890",
    pattern: /^\d{11}$/,
    patternMessage: "Inserisci 11 cifre senza spazi.",
    prefillFrom: "piva",
  },
  {
    id: "Q3",
    type: "single_choice",
    section: SEC.s1,
    title: "Il tuo ruolo in azienda",
    required: true,
    options: [
      "CEO / Amministratore Delegato / Titolare",
      "COO / Direttore Operations",
      "CFO / Direttore Finance",
      "Direttore Commerciale",
      "Altro ruolo direzionale",
      "Altro",
    ],
  },
  {
    id: "sec2_intro",
    type: "statement",
    section: SEC.s2,
    title: "📐 Profilo aziendale",
    description:
      "Cinque domande veloci per inquadrare dimensione e perimetro della vostra attività. Circa 2 minuti.",
  },
  {
    id: "Q4",
    type: "single_choice",
    section: SEC.s2,
    title: "Anno di avvio dell'attività di vendita energia",
    description: "Anno della prima fornitura al cliente finale.",
    required: true,
    options: ["Prima del 2010", "2010 – 2015", "2016 – 2020", "2021 – 2023", "2024 – 2026"],
  },
  {
    id: "Q5",
    type: "single_choice",
    section: SEC.s2,
    title: "Tipologia di servizio offerto",
    required: true,
    options: [
      "Solo elettrico",
      "Solo gas",
      "Dual, con netta prevalenza elettrico (>70% fatturato)",
      "Dual, bilanciato (30–70% elettrico)",
      "Dual, con netta prevalenza gas (>70% fatturato)",
    ],
  },
  {
    id: "Q6",
    type: "single_choice",
    section: SEC.s2,
    title: "Numero totale di POD + PDR serviti oggi",
    required: true,
    options: [
      "Meno di 5.000",
      "5.000 – 20.000",
      "20.000 – 50.000",
      "50.000 – 150.000",
      "150.000 – 500.000",
      "Oltre 500.000",
    ],
  },
  {
    id: "Q7a",
    type: "single_choice",
    section: SEC.s2,
    title: "Quota fatturato da clienti RESIDENZIALI / DOMESTICI",
    required: true,
    options: ["Meno del 20%", "20 – 50%", "50 – 80%", "Oltre l'80%"],
  },
  {
    id: "Q7b",
    type: "single_choice",
    section: SEC.s2,
    title: "Quota fatturato da MICRO-IMPRESE e professionisti",
    description: "BT, consumi < 100k kWh.",
    required: true,
    options: ["Meno del 20%", "20 – 50%", "50 – 80%", "Oltre l'80%"],
  },
  {
    id: "Q7c",
    type: "single_choice",
    section: SEC.s2,
    title: "Quota fatturato da PMI",
    description: "BT alto / MT.",
    required: true,
    options: ["Meno del 20%", "20 – 50%", "50 – 80%", "Oltre l'80%"],
  },
  {
    id: "Q7d",
    type: "single_choice",
    section: SEC.s2,
    title: "Quota fatturato da INDUSTRIALI / grandi utenti (AT)",
    required: true,
    options: ["Nessun cliente in questo segmento", "Meno del 20%", "20 – 50%", "Oltre il 50%"],
  },
  {
    id: "Q8",
    type: "single_choice",
    section: SEC.s2,
    title: "Numero di dipendenti (totale società)",
    description:
      "Considera l'organico totale, anche se una parte non è dedicata alla vendita energia.",
    required: true,
    options: ["1 – 5", "6 – 15", "16 – 40", "41 – 100", "101 – 300", "Oltre 300"],
  },
  {
    id: "sec3_intro",
    type: "statement",
    section: SEC.s3,
    title: "💰 Economics e unit economics",
    description:
      "Sei domande sui KPI economici chiave. Sappiamo che alcuni sono sensibili — tutte le risposte sono aggregate per fascia dimensionale e area geografica, e non vengono mai pubblicate singolarmente. Se un KPI non lo misurate in modo strutturato, c'è sempre l'opzione per dirlo.",
  },
  {
    id: "Q9",
    type: "single_choice",
    section: SEC.s3,
    title: "Cost-to-serve medio per cliente residenziale (2025)",
    description:
      "Include: customer care, billing, credit management, back-office amministrativo, IT, compliance. NON include: costo energia, oneri di rete, oneri di sistema.",
    required: true,
    options: [
      "Meno di €20 / cliente / anno",
      "€20 – €40",
      "€40 – €60",
      "€60 – €80",
      "€80 – €120",
      "Oltre €120",
      "Non misuriamo questo KPI in modo strutturato",
    ],
  },
  {
    id: "Q10",
    type: "single_choice",
    section: SEC.s3,
    title: "CAC medio per cliente residenziale acquisito (2025)",
    description:
      "Include: commissioni rete vendita, marketing digitale, telemarketing, sponsorizzazioni, comparatori, costi struttura commerciale allocati. NON include: welcome bonus / sconti sul primo anno.",
    required: true,
    options: [
      "Meno di €30",
      "€30 – €60",
      "€60 – €100",
      "€100 – €150",
      "€150 – €250",
      "Oltre €250",
      "Non misuriamo questo KPI in modo strutturato",
    ],
  },
  {
    id: "Q11",
    type: "single_choice",
    section: SEC.s3,
    title: "DSO medio (giorni medi di incasso dalla fattura)",
    required: true,
    options: [
      "Meno di 30 giorni",
      "30 – 45 giorni",
      "45 – 60 giorni",
      "60 – 90 giorni",
      "90 – 120 giorni",
      "Oltre 120 giorni",
    ],
  },
  {
    id: "Q12",
    type: "single_choice",
    section: SEC.s3,
    title: "Churn rate annuale clientela residenziale (2025)",
    description:
      "% clienti persi nell'anno sul totale a inizio anno, esclusi i nuovi acquisiti.",
    required: true,
    options: [
      "Meno del 5%",
      "5% – 10%",
      "10% – 15%",
      "15% – 25%",
      "25% – 40%",
      "Oltre il 40%",
    ],
  },
  {
    id: "Q13",
    type: "single_choice",
    section: SEC.s3,
    title: "Quota del fatturato dedicata al back-office",
    description:
      "Operations, IT, compliance, amministrazione. Esclude acquisto energia, commissioni commerciali, oneri regolatori.",
    required: true,
    options: [
      "Meno del 3%",
      "3% – 6%",
      "6% – 10%",
      "10% – 15%",
      "Oltre il 15%",
      "Non misuriamo questo KPI in modo strutturato",
    ],
  },
  {
    id: "Q14",
    type: "single_choice",
    section: SEC.s3,
    title: "Tasso di morosità 2024 (% fatturato non incassato entro 12 mesi)",
    required: true,
    options: [
      "Meno dell'1%",
      "1% – 3%",
      "3% – 5%",
      "5% – 8%",
      "8% – 12%",
      "Oltre il 12%",
    ],
  },
  {
    id: "sec4_intro",
    type: "statement",
    section: SEC.s4,
    title: "⚙️ Operations e tempi di processo",
    description:
      "Quattro domande sui tempi e sul dimensionamento operativo del back-office. Siamo a metà del questionario.",
  },
  {
    id: "Q15",
    type: "single_choice",
    section: SEC.s4,
    title: "Tempo medio di attivazione di un nuovo cliente residenziale",
    description: "Dalla firma del contratto alla prima fattura emessa.",
    required: true,
    options: [
      "Meno di 15 giorni",
      "15 – 30 giorni",
      "30 – 60 giorni",
      "60 – 90 giorni",
      "Oltre 90 giorni",
    ],
  },
  {
    id: "Q16",
    type: "single_choice",
    section: SEC.s4,
    title: "FTE dedicati a back-office per 10.000 POD/PDR gestiti",
    description:
      "Customer care, billing, credit management, operations, IT (escluso area commerciale e direzione).",
    required: true,
    options: [
      "Meno di 2 FTE",
      "2 – 4 FTE",
      "4 – 7 FTE",
      "7 – 12 FTE",
      "Oltre 12 FTE",
      "Non riusciamo a calcolare questo rapporto",
    ],
    skipIf: (a) => a.Q6 === "Meno di 5.000",
  },
  {
    id: "Q17",
    type: "single_choice",
    section: SEC.s4,
    title: "Volume contatti inbound al customer care (per mille clienti / mese)",
    description:
      "Include chiamate, email, webform, chat, WhatsApp, social. Solo inbound.",
    required: true,
    options: [
      "Meno di 30",
      "30 – 60",
      "60 – 100",
      "100 – 150",
      "Oltre 150",
      "Non misuriamo questo KPI in modo strutturato",
    ],
  },
  {
    id: "Q18",
    type: "single_choice",
    section: SEC.s4,
    title: "Reclami formali al mese per 10.000 clienti (media 2024)",
    required: true,
    options: ["Meno di 5", "5 – 15", "15 – 30", "30 – 50", "Oltre 50"],
  },
  {
    id: "sec5_intro",
    type: "statement",
    section: SEC.s5,
    title: "💻 Stack tecnologico",
    description: "Tre domande veloci sull'infrastruttura che usate. Siamo quasi alla fine.",
  },
  {
    id: "Q19",
    type: "multi_choice",
    section: SEC.s5,
    title: "Gestionale usato per billing e customer management",
    description: "Puoi selezionare fino a 2 voci.",
    required: true,
    maxSelections: 2,
    options: [
      "Gestionale verticale energia (CPL Concordia, Acinque, Cerved Utility, Retenergie, …)",
      "ERP generico configurato (SAP, Oracle, Microsoft Dynamics)",
      "Gestionale proprietario sviluppato internamente",
      "Mix di sistemi diversi",
      "Non lo so / non gestiamo direttamente",
    ],
  },
  {
    id: "Q20",
    type: "multi_choice",
    section: SEC.s5,
    title: "Quali processi avete automatizzato in modo significativo oggi?",
    required: true,
    options: [
      "Billing / fatturazione massiva",
      "Dispute management fatture",
      "Customer care di primo livello (chatbot / IVR avanzato)",
      "Onboarding clienti digitale end-to-end",
      "Recupero crediti soft (pre-legale)",
      "Switching e pratiche SII",
      "Reporting regolatorio automatico",
      "Nessuna di queste è automatizzata in modo significativo",
    ],
  },
  {
    id: "Q21",
    type: "single_choice",
    section: SEC.s5,
    title: "A che punto siete con l'AI generativa nel back-office?",
    required: true,
    options: [
      "Non abbiamo ancora valutato",
      "Stiamo valutando use case ma senza progetti avviati",
      "Abbiamo uno o più proof of concept attivi",
      "Abbiamo almeno un uso in produzione",
      "Abbiamo trasformato strutturalmente uno o più processi con AI",
    ],
  },
  {
    id: "sec6_intro",
    type: "statement",
    section: SEC.s6,
    title: "🔮 Outlook 2026 – 2027",
    description: "Due domande finali sulle vostre priorità strategiche.",
  },
  {
    id: "Q22",
    type: "ranking",
    section: SEC.s6,
    title: "Classifica le pressioni sul vostro modello di business nei prossimi 18 mesi",
    description: "Riordina da 1 (più urgente) a 4 (meno urgente).",
    required: true,
    options: [
      "Regolatoria (compliance, bolletta 2.0, TISIM, nuove delibere)",
      "Finanziaria (margini, costo capitale, garanzie, morosità)",
      "Commerciale (CAC, churn, concorrenza)",
      "Tecnologica (gap vs AI-enabled, debito tecnico)",
    ],
  },
  {
    id: "Q23",
    type: "long_text",
    section: SEC.s6,
    title: "Qual è la vostra priorità strategica principale per il 2026 – 2027?",
    description: "Massimo 2 righe. Facoltativo.",
    required: false,
    maxLength: 280,
    placeholder: "Scrivi qui…",
  },
  {
    id: "Q24",
    type: "single_choice",
    section: SEC.s7,
    title: "Come vuoi ricevere il tuo benchmark privato?",
    description: "Il benchmark arriva entro 60 giorni dalla chiusura della survey.",
    required: true,
    options: [
      "Via email (userò l'indirizzo del compilatore)",
      "Via email a un altro indirizzo (lo indicherai nello spazio sotto)",
      "Preferirei una call di 30 minuti con un analista Energizzo",
      "Non mi interessa il benchmark privato",
    ],
  },
  {
    id: "Q24b",
    type: "short_text",
    section: SEC.s7,
    title: "Se hai scelto 'altro indirizzo', inseriscilo qui",
    description: "Altrimenti lascia vuoto.",
    required: false,
    placeholder: "email@dominio.it",
  },
  {
    id: "Q25_whatsapp",
    type: "short_text",
    section: SEC.s7,
    title: "Ultimo passaggio: il tuo WhatsApp",
    description:
      "Usiamo WhatsApp per inviarti il codice di accesso alla piattaforma. Nessun altro utilizzo: niente marketing, niente spam. Includi il prefisso internazionale (es. +39).",
    required: true,
    placeholder: "+39 333 1234567",
    pattern: /^[+\d\s().\-]{6,30}$/,
    patternMessage: "Inserisci un numero WhatsApp valido con prefisso.",
  },
  {
    id: "thanks",
    type: "thanks",
    title: "Accesso attivato.",
    description:
      "Il tuo account nel network Il Dispaccio è pronto.\n\nTi abbiamo riconosciuto dal numero WhatsApp appena indicato. Entra ora nell'area riservata: ti inviamo un codice OTP su WhatsApp per il primo login.",
    buttonText: "Entra nel network",
    buttonHref: "/network/login",
  },
];

export function getVisibleScreens(answers: Answers): Screen[] {
  return SURVEY_SCREENS.filter((s) => !s.skipIf?.(answers));
}

export function getProgressScreens(answers: Answers): Screen[] {
  return getVisibleScreens(answers).filter(
    (s) => s.type !== "welcome" && s.type !== "thanks",
  );
}
