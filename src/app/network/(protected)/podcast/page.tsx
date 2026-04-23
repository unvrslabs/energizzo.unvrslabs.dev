import { Clock, Headphones, Mic, Play, User } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Podcast · Terminal",
};

type Episode = {
  id: string;
  number: number;
  title: string;
  guest: string;
  duration: string;
  date: string;
  tag: "eel" | "gas" | "mercato" | "regolazione";
  featured?: boolean;
};

const EPISODES: Episode[] = [
  {
    id: "ep12",
    number: 12,
    title: "PUN Index, Market Coupling e formule di indicizzazione: cosa cambia davvero per i reseller",
    guest: "Marco Conti, ex-GME",
    duration: "47 min",
    date: "2026-04-18",
    tag: "mercato",
    featured: true,
  },
  {
    id: "ep11",
    number: 11,
    title: "TIMOE 2024: morosità, switching e le nuove soglie di costituzione",
    guest: "Avv. Carla Brambilla, studio energy law",
    duration: "39 min",
    date: "2026-04-10",
    tag: "regolazione",
  },
  {
    id: "ep10",
    number: 10,
    title: "Uscita graduale dal STG: strategia di recupero clienti domestici",
    guest: "Simone Rizzo, CEO EnergiaItalia Srl",
    duration: "42 min",
    date: "2026-03-28",
    tag: "eel",
  },
  {
    id: "ep09",
    number: 9,
    title: "REMIT e reporting OTC gas: checklist operativa per non prendersi sanzioni",
    guest: "Ing. Luca Ferrari, compliance energy trader",
    duration: "51 min",
    date: "2026-03-15",
    tag: "gas",
  },
  {
    id: "ep08",
    number: 8,
    title: "Bolletta 2.0: come cambiano le comunicazioni al cliente domestico",
    guest: "Elena Martino, customer care lead EnerNova",
    duration: "34 min",
    date: "2026-03-02",
    tag: "regolazione",
  },
  {
    id: "ep07",
    number: 7,
    title: "PUN vs PSV: scenari di rischio per portafogli ibridi",
    guest: "Andrea Colombo, risk manager",
    duration: "44 min",
    date: "2026-02-20",
    tag: "mercato",
  },
];

const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtDate(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

const TAG_COLOR: Record<Episode["tag"], string> = {
  eel: "hsl(38 92% 65%)",
  gas: "hsl(200 70% 65%)",
  mercato: "hsl(158 64% 62%)",
  regolazione: "hsl(270 40% 70%)",
};
const TAG_LABEL: Record<Episode["tag"], string> = {
  eel: "Energia",
  gas: "Gas",
  mercato: "Mercato",
  regolazione: "Regolazione",
};

export default function PodcastV2Page() {
  const featured = EPISODES.find((e) => e.featured) ?? EPISODES[0];
  const rest = EPISODES.filter((e) => e.id !== featured.id);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Media · Podcast
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            Il Dispaccio Podcast
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Conversazioni con operatori, regolatori ed avvocati · 1 episodio ogni 10 giorni
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="v2-status-pill">
            <Headphones className="w-3.5 h-3.5" />
            <strong>12</strong> episodi
          </span>
        </div>
      </header>

      {/* Featured */}
      <section className="v2-card p-6 md:p-8 flex flex-col md:flex-row gap-6">
        <div
          className="shrink-0 w-full md:w-60 h-60 rounded-xl grid place-items-center relative overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, hsl(158 60% 42%), transparent 60%), radial-gradient(circle at 70% 70%, hsl(200 55% 38%), transparent 60%), hsl(215 25% 14%)",
            border: "1px solid hsl(var(--v2-border-strong))",
          }}
        >
          <Mic className="w-20 h-20 relative z-10" style={{ color: "hsl(0 0% 95% / 0.85)" }} />
          <span className="absolute bottom-3 left-3 v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(0 0% 100% / 0.9)" }}>
            Ep.{featured.number.toString().padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-col gap-3 flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="v2-chip"
              style={{
                color: TAG_COLOR[featured.tag],
                borderColor: `${TAG_COLOR[featured.tag]}55`,
                background: `${TAG_COLOR[featured.tag]}15`,
              }}
            >
              {TAG_LABEL[featured.tag]}
            </span>
            <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              {fmtDate(featured.date)} · {featured.duration}
            </span>
          </div>
          <h2 className="text-[22px] md:text-2xl font-semibold leading-tight tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
            {featured.title}
          </h2>
          <div className="flex items-center gap-2 text-[13px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
            <User className="w-3.5 h-3.5" />
            {featured.guest}
          </div>
          <div className="flex items-center gap-2 mt-auto pt-2">
            <button type="button" className="v2-btn v2-btn--primary">
              <Play className="w-3.5 h-3.5" fill="currentColor" />
              Ascolta episodio
            </button>
            <button type="button" className="v2-btn">Trascrizione</button>
            <button type="button" className="v2-btn">Apri su Spotify</button>
          </div>
        </div>
      </section>

      {/* Archive */}
      <section>
        <div className="flex items-center gap-2 mb-3 pl-1">
          <span className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Archivio
          </span>
          <span className="flex-1 h-px" style={{ background: "hsl(var(--v2-border))" }} />
        </div>
        <div className="v2-card overflow-hidden">
          <ul>
            {rest.map((ep) => (
              <li
                key={ep.id}
                className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 items-center px-4 md:px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
              >
                <span
                  className="v2-mono text-[11px] font-bold"
                  style={{ color: "hsl(var(--v2-text-mute))", width: "42px" }}
                >
                  EP.{ep.number.toString().padStart(2, "0")}
                </span>
                <span
                  className="v2-chip hidden md:inline-flex"
                  style={{
                    color: TAG_COLOR[ep.tag],
                    borderColor: `${TAG_COLOR[ep.tag]}55`,
                    background: `${TAG_COLOR[ep.tag]}15`,
                  }}
                >
                  {TAG_LABEL[ep.tag]}
                </span>
                <div className="min-w-0">
                  <div className="text-[13.5px] font-medium line-clamp-1" style={{ color: "hsl(var(--v2-text))" }}>
                    {ep.title}
                  </div>
                  <div className="text-[11.5px] mt-0.5 truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {ep.guest}
                  </div>
                </div>
                <span
                  className="v2-mono text-[11px] hidden md:inline-flex items-center gap-1"
                  style={{ color: "hsl(var(--v2-text-mute))" }}
                >
                  <Clock className="w-3 h-3" />
                  {ep.duration}
                </span>
                <button
                  type="button"
                  className="v2-btn v2-btn--ghost"
                  style={{ padding: "6px 8px" }}
                  aria-label="Ascolta"
                >
                  <Play className="w-3.5 h-3.5" fill="currentColor" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
