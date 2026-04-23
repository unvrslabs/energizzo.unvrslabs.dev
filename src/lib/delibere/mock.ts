export type DeliberaSector = "eel" | "gas";

export type DeliberaAttachment = {
  label: string;
  kind: "pdf" | "xlsx" | "docx" | "zip";
  size?: string;
};

export type Delibera = {
  code: string;
  title: string;
  date: string;
  sectors: DeliberaSector[];
  summary: string;
  bullets: string[];
  attachments: DeliberaAttachment[];
  url: string;
};

export const SECTOR_LABEL: Record<DeliberaSector, string> = {
  eel: "Energia elettrica",
  gas: "Gas",
};

export const SECTOR_SHORT: Record<DeliberaSector, string> = {
  eel: "EEL",
  gas: "GAS",
};

export type DeadlineSeverity = "live" | "imminent" | "upcoming" | "far";

export type DeliberaDeadline = {
  date: string;
  label: string;
  deliberaCode: string;
  sector: DeliberaSector;
  severity: DeadlineSeverity;
};

export const DELIBERE_DEADLINES: DeliberaDeadline[] = [
  {
    date: "2026-04-01",
    label: "Avvio obbligatorio CDISP",
    deliberaCode: "386/2025/R/EEL",
    sector: "eel",
    severity: "live",
  },
  {
    date: "2026-05-15",
    label: "Chiusura consultazione TIMOE 2026",
    deliberaCode: "590/2024/R/EEL",
    sector: "eel",
    severity: "imminent",
  },
  {
    date: "2026-06-30",
    label: "Decorrenza nuove tariffe distribuzione gas",
    deliberaCode: "475/2024/R/GAS",
    sector: "gas",
    severity: "upcoming",
  },
  {
    date: "2026-07-20",
    label: "Asta STG gas domestici — tornata 2026",
    deliberaCode: "614/2024/R/EEL",
    sector: "eel",
    severity: "upcoming",
  },
  {
    date: "2026-09-30",
    label: "Aggiornamento quadri d'ambito ATEM",
    deliberaCode: "475/2024/R/GAS",
    sector: "gas",
    severity: "far",
  },
];

export type SavedDelibera = {
  code: string;
  savedAt: string;
};

export const SAVED_DELIBERE_MOCK: SavedDelibera[] = [
  { code: "614/2024/R/EEL", savedAt: "2026-04-15" },
  { code: "590/2024/R/COM", savedAt: "2026-04-10" },
  { code: "475/2024/R/GAS", savedAt: "2026-04-02" },
];

export type MarketSnapshot = {
  code: string;
  label: string;
  value: string;
  unit: string;
  delta: string;
  trend: "up" | "down" | "flat";
};

export const MARKET_SNAPSHOT: MarketSnapshot[] = [
  {
    code: "PUN",
    label: "Prezzo unico nazionale",
    value: "143,40",
    unit: "€/MWh",
    delta: "+25,3%",
    trend: "up",
  },
  {
    code: "PSV",
    label: "Punto scambio virtuale",
    value: "0,5577",
    unit: "€/Smc",
    delta: "+48,0%",
    trend: "up",
  },
  {
    code: "TTF",
    label: "Dutch TTF dayahead",
    value: "14,74",
    unit: "€/GJ",
    delta: "+4,1%",
    trend: "up",
  },
];

export const DELIBERE: Delibera[] = [
  {
    code: "614/2024/R/EEL",
    title:
      "Disposizioni in materia di uscita graduale dal Servizio a Tutele Graduali per clienti domestici non vulnerabili",
    date: "2024-12-18",
    sectors: ["eel"],
    summary:
      "Aggiornamento del meccanismo di uscita graduale dal STG per i clienti domestici non vulnerabili aggiudicati alle aste del 2024. Definisce tempistiche di comunicazione al cliente, obblighi informativi dell'esercente e finestre di switching agevolato.",
    bullets: [
      "Finestra di switching senza penali estesa a 24 mesi dalla data di ingresso in STG",
      "Obbligo di notifica al cliente con 6 mesi e 3 mesi di anticipo rispetto al passaggio",
      "Nuovo format della comunicazione informativa (allegato A), uniforme per tutti gli operatori",
      "Decorrenza 1° marzo 2025 per le nuove assegnazioni, regime transitorio per chi è già in STG",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "420 KB" },
      { label: "Allegato A — Format comunicazione", kind: "pdf", size: "180 KB" },
      { label: "Tabella oneri di sistema aggiornata", kind: "xlsx", size: "64 KB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/614-2024-r-eel",
  },
  {
    code: "546/2024/R/EEL",
    title:
      "Aggiornamento per il 2025 delle tariffe di trasmissione, distribuzione e misura dell'energia elettrica",
    date: "2024-11-29",
    sectors: ["eel"],
    summary:
      "Definisce i valori delle componenti tariffarie TRAS, DIS e MIS applicabili nel 2025 ai clienti di ogni tipologia, con aggiornamento del perequato di settore e revisione dei coefficienti di ripartizione tra fasce.",
    bullets: [
      "Componente TRAS 2025: aumento del 4,1% rispetto al 2024 per clienti domestici",
      "DIS non residenziale: riduzione media 1,8% per clienti BT altri usi",
      "Revisione dei corrispettivi per energia reattiva oltre soglia",
      "Pubblicazione allegato tecnico con tutti i valori tabellari per tipologia contrattuale",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "380 KB" },
      { label: "Tabelle tariffarie 2025", kind: "xlsx", size: "220 KB" },
      { label: "Allegato tecnico componenti", kind: "pdf", size: "1.2 MB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/546-2024-r-eel",
  },
  {
    code: "475/2024/R/GAS",
    title:
      "Aggiornamento delle tariffe obbligatorie di distribuzione gas per il 2025 — determinazione delle opzioni tariffarie",
    date: "2024-10-22",
    sectors: ["gas"],
    summary:
      "Aggiorna le opzioni tariffarie applicabili ai clienti finali di gas naturale serviti dagli impianti di distribuzione, con ricalibrazione dei quadri d'ambito e delle componenti di vettoriamento su rete.",
    bullets: [
      "Nuovi quadri d'ambito per tutti i 177 ATEM a valle della riforma 2024",
      "Componente τ1 (vettoriamento) aggiornata a partire da gennaio 2025",
      "Rimodulazione della quota variabile per piccoli consumatori domestici",
      "Periodo di regolazione transitorio 2025-2026 prima del nuovo ciclo quadriennale",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "310 KB" },
      { label: "Quadri d'ambito per ATEM", kind: "xlsx", size: "480 KB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/475-2024-r-gas",
  },
  {
    code: "590/2024/R/COM",
    title:
      "Testo integrato delle disposizioni in materia di morosità (TIMOE) — revisione 2024",
    date: "2024-12-05",
    sectors: ["eel", "gas"],
    summary:
      "Revisione del TIMOE con aggiornamento delle soglie di morosità, delle tempistiche del procedimento di costituzione in mora e delle regole di switching per clienti morosi (SWA e successivi).",
    bullets: [
      "Soglia di attivazione della procedura di costituzione in mora aggiornata a 50€ per clienti domestici",
      "Tempistiche del SWA ridotte a 25 giorni (prima 30)",
      "Nuovi obblighi di trasparenza nella comunicazione al cliente moroso",
      "Applicazione sia al settore elettrico che gas — decorrenza 1° aprile 2025",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "560 KB" },
      { label: "TIMOE consolidato 2025", kind: "pdf", size: "2.1 MB" },
      { label: "Format comunicazioni al cliente", kind: "docx", size: "95 KB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/590-2024-r-com",
  },
  {
    code: "523/2024/R/GAS",
    title:
      "REMIT — obblighi di segnalazione delle transazioni all'ingrosso di gas naturale",
    date: "2024-11-12",
    sectors: ["gas"],
    summary:
      "Definisce gli obblighi di reporting REMIT per gli operatori che partecipano al mercato all'ingrosso di gas naturale, con particolare riferimento ai contratti bilaterali e alle transazioni OTC.",
    bullets: [
      "Chiarimento sull'ambito di applicazione: sono inclusi i contratti bilaterali > 24 mesi",
      "Nuove tempistiche di segnalazione: T+1 per contratti standardizzati",
      "Obblighi aggiuntivi di conservazione dei record per 5 anni",
      "Sanzioni aggiornate in caso di omessa o tardiva segnalazione",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "290 KB" },
      { label: "Guida tecnica reporting", kind: "pdf", size: "740 KB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/523-2024-r-gas",
  },
  {
    code: "404/2024/R/COM",
    title:
      "Bolletta 2.0 — estensione e aggiornamento del layout informativo unico per clienti domestici ed assimilati",
    date: "2024-09-25",
    sectors: ["eel", "gas"],
    summary:
      "Aggiorna il layout obbligatorio della bolletta 2.0 per clienti domestici e microimprese, aggiungendo nuove sezioni informative su oneri di sistema, componenti fisse e variabili, e indicatori di confronto con il mercato di maggior tutela.",
    bullets: [
      "Nuovo box obbligatorio 'Cosa pago' con dettaglio oneri di sistema separati dal costo energia",
      "Indicatore di confronto col servizio di maggior tutela obbligatorio per tutti i contratti",
      "Formato QR code con link alle condizioni contrattuali complete",
      "Decorrenza 1° luglio 2025 per tutti i nuovi contratti, 1° gennaio 2026 per lo stock",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "410 KB" },
      { label: "Template bolletta 2.0 EEL", kind: "pdf", size: "1.4 MB" },
      { label: "Template bolletta 2.0 GAS", kind: "pdf", size: "1.3 MB" },
      { label: "Mock editabili", kind: "zip", size: "8.2 MB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/404-2024-r-com",
  },
  {
    code: "267/2024/R/EEL",
    title:
      "Aggiornamento dei meccanismi di calcolo del PUN Index e integrazione con il Market Coupling CACM",
    date: "2024-06-18",
    sectors: ["eel"],
    summary:
      "Definisce il passaggio dal PUN storico al PUN Index in linea con il Market Coupling europeo (CACM Guidelines), con impatto sulle formule di indicizzazione dei contratti di fornitura.",
    bullets: [
      "PUN Index calcolato sulla base della sessione Single Day-Ahead Coupling",
      "Periodo parallelo di pubblicazione PUN storico fino al 31/12/2025",
      "Obblighi informativi verso la clientela per contratti indicizzati al PUN",
      "FAQ operative e chiarimenti sulle modalità di transizione",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "350 KB" },
      { label: "FAQ operative", kind: "pdf", size: "280 KB" },
      { label: "Tabella conversione storico/index", kind: "xlsx", size: "120 KB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/267-2024-r-eel",
  },
  {
    code: "345/2024/R/EEL",
    title:
      "Regolazione dei sistemi di accumulo e dell'autoconsumo diffuso — aggiornamento del TISDC",
    date: "2024-08-02",
    sectors: ["eel"],
    summary:
      "Aggiorna le regole del Testo Integrato Sistemi Distribuiti per le Configurazioni di autoconsumo (CER, Gruppi di autoconsumatori) e per gli impianti di accumulo connessi in media e bassa tensione.",
    bullets: [
      "Incentivo per configurazioni di autoconsumo diffuso esteso fino al 2028",
      "Nuovi requisiti tecnici per sistemi di accumulo BT sopra 50 kWh",
      "Semplificazione del modello unico per impianti fotovoltaici residenziali",
      "Chiarimenti sul perimetro delle CER e sugli oneri di rete applicabili",
    ],
    attachments: [
      { label: "Testo della delibera", kind: "pdf", size: "480 KB" },
      { label: "TISDC consolidato", kind: "pdf", size: "2.6 MB" },
    ],
    url: "https://www.arera.it/atti-e-provvedimenti/345-2024-r-eel",
  },
];
