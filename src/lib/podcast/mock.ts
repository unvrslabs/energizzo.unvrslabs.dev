export type PodcastTopic =
  | "mercato-libero"
  | "stg"
  | "regolatorio"
  | "pricing"
  | "reseller-ops"
  | "gas"
  | "rinnovabili";

export type PodcastHost = {
  slug: string;
  name: string;
  role: string;
  initials: string;
};

export type PodcastGuest = {
  slug: string;
  name: string;
  role: string;
  company: string;
  initials: string;
  gradient: string;
};

export type PodcastEpisode = {
  slug: string;
  number: number;
  title: string;
  excerpt: string;
  date: string;
  duration_min: number;
  topics: PodcastTopic[];
  guest_slug: string | null;
  spotify_url: string | null;
  youtube_url: string | null;
  apple_url: string | null;
  has_transcript: boolean;
  gradient: string;
  season: number;
};

export type PodcastCommunityQuestion = {
  id: string;
  question: string;
  author: string;
  company: string;
  answered_in_episode_slug: string | null;
  submitted_at: string;
};

export const TOPIC_LABEL: Record<PodcastTopic, string> = {
  "mercato-libero": "Mercato libero",
  stg: "Servizio a Tutele Graduali",
  regolatorio: "Regolatorio",
  pricing: "Pricing",
  "reseller-ops": "Reseller ops",
  gas: "Gas",
  rinnovabili: "Rinnovabili",
};

export const TOPIC_COLOR: Record<PodcastTopic, string> = {
  "mercato-libero": "bg-amber-500/15 text-amber-200 border-amber-500/30",
  stg: "bg-rose-500/15 text-rose-200 border-rose-500/30",
  regolatorio: "bg-indigo-500/15 text-indigo-200 border-indigo-500/30",
  pricing: "bg-emerald-500/15 text-emerald-200 border-emerald-500/30",
  "reseller-ops": "bg-purple-500/15 text-purple-200 border-purple-500/30",
  gas: "bg-sky-500/15 text-sky-200 border-sky-500/30",
  rinnovabili: "bg-lime-500/15 text-lime-200 border-lime-500/30",
};

export const PODCAST_HOSTS: PodcastHost[] = [
  {
    slug: "emanuele-maccari",
    name: "Emanuele Maccari",
    role: "CEO, UNVRS Labs · Il Dispaccio",
    initials: "EM",
  },
];

export const PODCAST_GUESTS: PodcastGuest[] = [
  {
    slug: "marco-bianchi",
    name: "Marco Bianchi",
    role: "Ex Dirigente ARERA",
    company: "Consulente indipendente",
    initials: "MB",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    slug: "chiara-ferri",
    name: "Chiara Ferri",
    role: "Trader Energy",
    company: "Trade Desk Srl",
    initials: "CF",
    gradient: "from-rose-500 to-pink-600",
  },
  {
    slug: "luca-romano",
    name: "Luca Romano",
    role: "Avvocato Energy",
    company: "Studio Romano & Partners",
    initials: "LR",
    gradient: "from-amber-500 to-orange-600",
  },
  {
    slug: "sara-delucchi",
    name: "Sara De Lucchi",
    role: "Responsabile B2B",
    company: "Gruppo Energit",
    initials: "SD",
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    slug: "pietro-galvano",
    name: "Pietro Galvano",
    role: "Head of Pricing",
    company: "Global Power",
    initials: "PG",
    gradient: "from-sky-500 to-cyan-600",
  },
];

export const PODCAST_EPISODES: PodcastEpisode[] = [
  {
    slug: "06-cdisp-corrispettivo-dispacciamento",
    number: 6,
    season: 1,
    title: "CDISP: il nuovo corrispettivo dispacciamento spiegato bene",
    excerpt:
      "Dal 1° aprile 2026 tutti i venditori devono applicare il CDISP. Cosa cambia per i reseller, quali contratti vanno aggiornati, e perché il vecchio modello TIDE+Capacità resta opzionale solo per alcuni domestici.",
    date: "2026-04-18",
    duration_min: 31,
    topics: ["regolatorio", "reseller-ops"],
    guest_slug: "marco-bianchi",
    spotify_url: "https://open.spotify.com/episode/mock-06",
    youtube_url: "https://youtube.com/watch?v=mock-06",
    apple_url: null,
    has_transcript: true,
    gradient: "from-violet-600 via-indigo-600 to-blue-700",
  },
  {
    slug: "05-pricing-spread-margini",
    number: 5,
    season: 1,
    title: "Pricing energia: come calcolare spread e margini senza sbagliare",
    excerpt:
      "Dal PUN al prezzo finale: gli spread tipici del mercato 2026, come si incastra il corrispettivo capacità e dove i reseller perdono marginalità senza accorgersene.",
    date: "2026-04-04",
    duration_min: 52,
    topics: ["pricing", "mercato-libero"],
    guest_slug: "pietro-galvano",
    spotify_url: "https://open.spotify.com/episode/mock-05",
    youtube_url: "https://youtube.com/watch?v=mock-05",
    apple_url: "https://podcasts.apple.com/mock-05",
    has_transcript: true,
    gradient: "from-emerald-600 via-teal-600 to-cyan-700",
  },
  {
    slug: "04-fine-tutela-gas-2026",
    number: 4,
    season: 1,
    title: "Fine della tutela gas: il nuovo scenario per i reseller",
    excerpt:
      "La transizione al mercato libero per i vulnerabili gas, le aste STG e cosa aspettarsi in termini di switching e morosità nei prossimi 12 mesi.",
    date: "2026-03-21",
    duration_min: 42,
    topics: ["gas", "stg", "regolatorio"],
    guest_slug: "marco-bianchi",
    spotify_url: "https://open.spotify.com/episode/mock-04",
    youtube_url: "https://youtube.com/watch?v=mock-04",
    apple_url: "https://podcasts.apple.com/mock-04",
    has_transcript: true,
    gradient: "from-sky-600 via-blue-600 to-indigo-700",
  },
  {
    slug: "03-mandato-energia-come-scegliere",
    number: 3,
    season: 1,
    title: "Mandato energia: come scegliere quello giusto per il tuo network",
    excerpt:
      "Esclusiva, plurimandato, mandato senza rappresentanza: le clausole che fanno la differenza, provvigioni-tipo e gli errori più comuni nel contratto di agenzia in ambito energetico.",
    date: "2026-03-07",
    duration_min: 47,
    topics: ["reseller-ops", "regolatorio"],
    guest_slug: "luca-romano",
    spotify_url: "https://open.spotify.com/episode/mock-03",
    youtube_url: "https://youtube.com/watch?v=mock-03",
    apple_url: "https://podcasts.apple.com/mock-03",
    has_transcript: true,
    gradient: "from-amber-600 via-orange-600 to-rose-700",
  },
  {
    slug: "02-agenti-vs-consulenti-inquadramento",
    number: 2,
    season: 1,
    title: "Agenti vs Consulenti: qual è l'inquadramento giusto?",
    excerpt:
      "Enasarco, partita IVA, provvigioni, ritenute: capire quale forma giuridica conviene davvero per chi vende energia in Italia oggi.",
    date: "2026-02-21",
    duration_min: 35,
    topics: ["reseller-ops"],
    guest_slug: "luca-romano",
    spotify_url: "https://open.spotify.com/episode/mock-02",
    youtube_url: "https://youtube.com/watch?v=mock-02",
    apple_url: "https://podcasts.apple.com/mock-02",
    has_transcript: true,
    gradient: "from-fuchsia-600 via-purple-600 to-violet-700",
  },
  {
    slug: "01-dove-va-mercato-libero-2026",
    number: 1,
    season: 1,
    title: "Dove sta andando il mercato libero italiano nel 2026",
    excerpt:
      "Apertura della stagione 1 de Il Dispaccio. Lo stato dell'arte del mercato retail italiano: quota libero vs tutela, concentrazione tra venditori, switching e morosità. Panoramica completa sul panorama reseller.",
    date: "2026-02-07",
    duration_min: 38,
    topics: ["mercato-libero", "stg"],
    guest_slug: "sara-delucchi",
    spotify_url: "https://open.spotify.com/episode/mock-01",
    youtube_url: "https://youtube.com/watch?v=mock-01",
    apple_url: "https://podcasts.apple.com/mock-01",
    has_transcript: true,
    gradient: "from-rose-600 via-red-600 to-orange-700",
  },
];

export const PODCAST_COMMUNITY_QUESTIONS: PodcastCommunityQuestion[] = [
  {
    id: "q1",
    question:
      "Come si gestiscono i clienti STG quando scade la tutela graduale nel 2027?",
    author: "Davide C.",
    company: "Energy Broker Nord-Est",
    answered_in_episode_slug: null,
    submitted_at: "2026-04-20",
  },
  {
    id: "q2",
    question:
      "Il CDISP si applica anche ai clienti MT che hanno contatori orari?",
    author: "Claudia V.",
    company: "VClaudia Srl",
    answered_in_episode_slug: "06-cdisp-corrispettivo-dispacciamento",
    submitted_at: "2026-04-15",
  },
  {
    id: "q3",
    question:
      "Che spread medio mercato usare per preventivi PMI in BT con 50.000 kWh/anno?",
    author: "Giuseppe R.",
    company: "Energit Sud",
    answered_in_episode_slug: "05-pricing-spread-margini",
    submitted_at: "2026-04-08",
  },
  {
    id: "q4",
    question:
      "Le aste STG gas 2026 partiranno tutte insieme o a scaglioni regionali?",
    author: "Francesca M.",
    company: "MF Consulting",
    answered_in_episode_slug: null,
    submitted_at: "2026-04-02",
  },
];
