export type TacticStatus = "da_fare" | "in_corso" | "fatto" | "archiviato";

export const TACTIC_STATUS_CONFIG: Record<TacticStatus, { label: string; color: string }> = {
  da_fare: { label: "Da fare", color: "#64748b" },
  in_corso: { label: "In corso", color: "#f59e0b" },
  fatto: { label: "Fatto", color: "#22c55e" },
  archiviato: { label: "Archiviato", color: "#475569" },
};

export type TacticSection = { heading: string; body: string; bullets?: string[] };

export type Tactic = {
  id: string;
  number: number;
  emoji: string;
  title: string;
  subtitle: string;
  priority: "P0" | "P1" | "P2";
  cost: string;
  time: string;
  tags: string[];
  sections: TacticSection[];
};

export const TACTICS: Tactic[] = [
  {
    id: "podcast-trojan",
    number: 1,
    emoji: "🎙️",
    title: "Podcast-Trojan",
    subtitle: "Tattica da fare subito",
    priority: "P0",
    cost: "€0 + ~4h/settimana",
    time: "Lancio in 2 settimane",
    tags: ["Content", "Warm Outreach", "Authority"],
    sections: [
      {
        heading: "Cosa fai",
        body: 'Lanci un podcast/newsletter settimanale ("Il Reseller" / "Watt Matters"). Formato: 20 minuti, un\'intervista a un AD/COO di un reseller diverso ogni settimana. Temi: margini, switching rate clienti, nuove regole ARERA, AI nel settore (← dove inserisci naturalmente Energizzo).',
      },
      {
        heading: "Perché funziona",
        body: "",
        bullets: [
          "Accept rate 30-50% invece dell'1% di cold email — l'ego umano funziona",
          "Ogni intervista = 1 decisore full-focus su di te per 30-45 min, impara Energizzo",
          "Episodio pubblicato → intervistato lo ricondivide su LinkedIn → presentazione gratis ai peer",
          "Dopo 20 episodi sei 'quello del podcast sul settore' → autorità",
        ],
      },
      {
        heading: "Primo target",
        body: "I 30-40 reseller medi (10-50 dipendenti) dove il CEO è ancora raggiungibile e amerebbe visibilità.",
      },
      {
        heading: "Tool",
        body: "Riverside.fm (~$29/mese) oppure Zoom + Descript",
      },
    ],
  },
  {
    id: "report-magnete",
    number: 2,
    emoji: "💎",
    title: "Report-Magnete",
    subtitle: "Fallo in 2 settimane",
    priority: "P0",
    cost: "€0-200 (freelance designer Fiverr)",
    time: "2 settimane",
    tags: ["Content", "Authority", "PR"],
    sections: [
      {
        heading: "Cosa fai",
        body: 'Produci un report definitivo "Stato del Reseller Energia in Italia 2026" — 30-40 pagine.',
        bullets: [
          "Analisi dei 788 venditori (dati ARERA già disponibili)",
          "Dimensione media, distribuzione geografica, concentrazione di mercato",
          "Interviste/survey a 20-30 operatori",
          "Benchmark operativi: cost-to-serve, CAC, tempi di attivazione",
          "Sezione finale: 'Come l'AI sta trasformando il back-office dei reseller' (Energizzo entra qui)",
        ],
      },
      {
        heading: "Perché funziona",
        body: "",
        bullets: [
          "Scusa naturale per contattare chiunque: 'Abbiamo incluso la tua azienda nell'analisi'",
          "Biglietto da visita per 12 mesi",
          "Media italiani (Staffetta Quotidiana, QualEnergia, e-gazette) ne parlano se ben scritto",
          "ARERA stessa potrebbe ritwittarlo",
        ],
      },
      {
        heading: "Tool",
        body: "Claude/ChatGPT per draft, Figma o Canva per design, Fiverr freelance designer (~€200) per finishing.",
      },
      {
        heading: "Distribuzione",
        body: "Hook in ogni canale: podcast, LinkedIn, email, eventi.",
      },
    ],
  },
  {
    id: "linkedin-sniper",
    number: 3,
    emoji: "🎯",
    title: 'LinkedIn "Warm Sniper"',
    subtitle: "Parallelo a tutto",
    priority: "P1",
    cost: "Dripify/Waalaxy ~€50/mese",
    time: "Continuo, 2-3h/sett",
    tags: ["LinkedIn", "Outreach", "Automazione"],
    sections: [
      {
        heading: "Sequence (invece di connection request a freddo)",
        body: "",
        bullets: [
          "Segui i decisori (CEO, CCO, COO, Head of Sales) delle 788 aziende",
          "Commenta con intelligenza sui loro post per 2-3 settimane (non like, valore reale)",
          "Poi connection request: 'Ciao, seguo i tuoi post da un po'. Scrivo perché…'",
          "Dopo accept, MAI pitch subito. Prima un contenuto utile (es. il report)",
          "Solo al 3° messaggio parli di Energizzo",
        ],
      },
      {
        heading: "Perché funziona",
        body: "LinkedIn italiano B2B energia è sotto-utilizzato vs UK/US. I decisori qui non sono desensibilizzati come in altri mercati.",
      },
      {
        heading: "Tool di supporto",
        body: "Dripify o Waalaxy per automatizzare i 3-4 step (max 50 contatti/settimana per evitare ban).",
      },
      {
        heading: "Metrica attesa",
        body: "25-35% accept rate, 8-12% reply rate → ~60-80 conversazioni qualificate dai 788 lead.",
      },
    ],
  },
  {
    id: "cena-milano",
    number: 4,
    emoji: "🍕",
    title: "Cena privata",
    subtitle: "Unfair advantage",
    priority: "P1",
    cost: "€800-1500 per cena (10 coperti)",
    time: "1 al mese in città diverse",
    tags: ["Event", "VIP", "Trust"],
    sections: [
      {
        heading: "Cosa fai",
        body: "Cena in ristorante buono a Milano/Roma, max 10 posti, solo per AD/founder di reseller. Tema: 'Il futuro del back-office dei reseller energia: cosa cambia con l'AI'. Format: ognuno si presenta, cena informale, demo soft di Energizzo alla fine (30 min), poi dopo-cena.",
      },
      {
        heading: "Perché funziona",
        body: "",
        bullets: [
          "AD di reseller non risponde a email ma a cena con pari si sente lusingato",
          "8 AD in sala per 3 ore = 24 persona-ore esposizione Energizzo + trust building",
          "Uno solo che firma → ROI 50x del costo cena",
          "I peer si convincono a vicenda meglio dei venditori",
        ],
      },
      {
        heading: "Città da pianificare",
        body: "Milano → Roma → Napoli → Bologna (una al mese).",
      },
      {
        heading: "Invito",
        body: "LinkedIn DM + telefonata follow-up ('sto invitando 8 persone chiave, ti va?'). Accept rate: 30-40%.",
      },
    ],
  },
  {
    id: "mini-tool-demo",
    number: 5,
    emoji: "🤖",
    title: "Mini-tool pubblico",
    subtitle: "Il prodotto come demo",
    priority: "P1",
    cost: "€50/mese infrastruttura",
    time: "1-2 settimane dev",
    tags: ["Product-Led", "Lead Gen", "AI"],
    sections: [
      {
        heading: "Cosa fai",
        body: "Crei una mini-app pubblica — un pezzetto di Energizzo online a uso libero. Esempi:",
        bullets: [
          "'Genera la tua offerta PLACET in 30 secondi con AI'",
          "'Analisi automatica delle tue bollette fornitori: quanto stai overpagando?'",
          "'Checker compliance ARERA 2026: la tua documentazione è a posto?'",
        ],
      },
      {
        heading: "Perché funziona",
        body: "",
        bullets: [
          "Un AD non scarica ebook ma prova un tool che risolve un problema in 2 minuti",
          "Chi lo usa ti lascia email verificata e reale (non il info@ guess)",
          "Mostra che Energizzo è vero, funziona, è italiano",
        ],
      },
      {
        heading: "Tool",
        body: "Claude Code + Supabase + OpenAI API.",
      },
      {
        heading: "Distribuzione",
        body: "Promuovi su LinkedIn, nel podcast, nel report. Macchina di lead qualificati.",
      },
    ],
  },
  {
    id: "pacco-fisico",
    number: 6,
    emoji: "📬",
    title: "Pacco fisico",
    subtitle: "Per i top 50 target",
    priority: "P2",
    cost: "€40-80 × 50 = €2-4k",
    time: "Post report ready",
    tags: ["Direct Mail", "VIP", "High-Touch"],
    sections: [
      {
        heading: "Cosa fai",
        body: "Per i top 50 lead (i dual più grandi), pacco fisico all'ufficio dell'AD:",
        bullets: [
          "Il report stampato, rilegato bene (non PDF)",
          "Lettera personale scritta a mano (una facciata)",
          "Gadget utile, non plasticoso (moleskine, libro di settore, coltellino svizzero)",
          "QR code → landing personalizzata con nome azienda",
        ],
      },
      {
        heading: "Perché funziona",
        body: "",
        bullets: [
          "Nessuno riceve pacchi nel 2026 se non Amazon — il segretario lo porta subito al CEO",
          "Open rate: ~100% (è un pacco fisico)",
          "Reply rate B2B USA: 15-30% direct mail vs 1% cold email",
          "In Italia ancora più raro → effetto sorpresa massimo",
        ],
      },
      {
        heading: "Costi",
        body: "€40-80 per pacco × 50 = €2-4k per ~10-15 demo con top buyer italiani. Probabilmente il miglior CAC che avrai mai.",
      },
      {
        heading: "Servizi",
        body: "Sendoso, Reachdesk (automatizzati) oppure Pixartprinting (italiano fai-da-te).",
      },
    ],
  },
  {
    id: "speaking-eventi",
    number: 7,
    emoji: "🎤",
    title: "Speaking a conferenze",
    subtitle: "Non sponsorizzare, candida talk",
    priority: "P2",
    cost: "€0 speaker slot + viaggi",
    time: "Quando il report è pronto",
    tags: ["Event", "Authority", "PR"],
    sections: [
      {
        heading: "Eventi da puntare",
        body: "",
        bullets: [
          "Key Energy (Rimini, novembre) — la fiera energia più grande in Italia",
          "Italian Energy Summit (Milano)",
          "AssoEGE e AIGET — eventi per associati reseller",
          "Webinar Staffetta Quotidiana e QualEnergia",
        ],
      },
      {
        heading: "Cosa fai",
        body: "Non sponsorizzi (costoso e inefficace). Candidi una talk tipo 'Come l'AI sta riducendo del 40% i costi operativi dei reseller di energia'. Se hai il report, la talk è praticamente già scritta.",
      },
      {
        heading: "Cost",
        body: "Zero per lo speaker slot se la talk è valida. Costi ancillari: viaggio + accommodation.",
      },
    ],
  },
];
