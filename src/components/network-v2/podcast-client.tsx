"use client";

import { useState } from "react";
import { Clock, Mic, Play, User, X } from "lucide-react";

type Episode = {
  id: string;
  number: number;
  title: string;
  guest: string;
  duration: string;
  date: string;
  tag: "eel" | "gas" | "mercato" | "regolazione";
  youtubeId?: string | null;
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
    youtubeId: null,
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
    youtubeId: null,
  },
  {
    id: "ep10",
    number: 10,
    title: "Uscita graduale dal STG: strategia di recupero clienti domestici",
    guest: "Simone Rizzo, CEO EnergiaItalia Srl",
    duration: "42 min",
    date: "2026-03-28",
    tag: "eel",
    youtubeId: null,
  },
  {
    id: "ep09",
    number: 9,
    title: "REMIT e reporting OTC gas: checklist operativa per non prendersi sanzioni",
    guest: "Ing. Luca Ferrari, compliance energy trader",
    duration: "51 min",
    date: "2026-03-15",
    tag: "gas",
    youtubeId: null,
  },
  {
    id: "ep08",
    number: 8,
    title: "Bolletta 2.0: come cambiano le comunicazioni al cliente domestico",
    guest: "Elena Martino, customer care lead EnerNova",
    duration: "34 min",
    date: "2026-03-02",
    tag: "regolazione",
    youtubeId: null,
  },
  {
    id: "ep07",
    number: 7,
    title: "PUN vs PSV: scenari di rischio per portafogli ibridi",
    guest: "Andrea Colombo, risk manager",
    duration: "44 min",
    date: "2026-02-20",
    tag: "mercato",
    youtubeId: null,
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

// Placeholder pubblico: Google CDN sample MP4 (~2MB), sostituire con youtubeId reali
const DEMO_VIDEO_SRC =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";

export function PodcastClient() {
  const featured = EPISODES.find((e) => e.featured) ?? EPISODES[0];
  const [selectedId, setSelectedId] = useState(featured.id);
  const [playing, setPlaying] = useState(false);

  const selected = EPISODES.find((e) => e.id === selectedId) ?? featured;

  function selectAndPlay(id: string) {
    setSelectedId(id);
    setPlaying(true);
  }

  const rest = EPISODES.filter((e) => e.id !== selected.id);

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Media · Video podcast
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            Il Dispaccio Podcast
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Interviste video con operatori, regolatori ed avvocati · 1 episodio ogni 10 giorni
          </p>
        </div>
      </header>

      {/* Player */}
      <section className="v2-card overflow-hidden">
        <VideoPlayer
          key={selected.id}
          episode={selected}
          playing={playing}
          onPlay={() => setPlaying(true)}
          onClose={() => setPlaying(false)}
        />
        <div className="p-5 md:p-6 flex flex-col gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="v2-chip"
              style={{
                color: TAG_COLOR[selected.tag],
                borderColor: `${TAG_COLOR[selected.tag]}55`,
                background: `${TAG_COLOR[selected.tag]}15`,
              }}
            >
              {TAG_LABEL[selected.tag]}
            </span>
            <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Ep.{selected.number.toString().padStart(2, "0")} · {fmtDate(selected.date)} · {selected.duration}
            </span>
          </div>
          <h2 className="text-[20px] md:text-[22px] font-semibold leading-tight tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
            {selected.title}
          </h2>
          <div className="flex items-center gap-2 text-[13px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
            <User className="w-3.5 h-3.5" />
            {selected.guest}
          </div>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {!playing && (
              <button type="button" className="v2-btn v2-btn--primary" onClick={() => setPlaying(true)}>
                <Play className="w-3.5 h-3.5" fill="currentColor" />
                Guarda episodio
              </button>
            )}
            <button type="button" className="v2-btn">Trascrizione</button>
            <button type="button" className="v2-btn">Apri su YouTube</button>
          </div>
        </div>
      </section>

      {/* Archive */}
      <section>
        <div className="flex items-center gap-2 mb-3 pl-1">
          <span className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Archivio
          </span>
        </div>
        <div className="v2-card overflow-hidden">
          <ul>
            {rest.map((ep) => (
              <li
                key={ep.id}
                onClick={() => selectAndPlay(ep.id)}
                className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 items-center px-4 md:px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
              >
                <span className="v2-mono text-[11px] font-bold" style={{ color: "hsl(var(--v2-text-mute))", width: "42px" }}>
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
                <span className="v2-mono text-[11px] hidden md:inline-flex items-center gap-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  <Clock className="w-3 h-3" />
                  {ep.duration}
                </span>
                <button
                  type="button"
                  className="v2-btn v2-btn--ghost"
                  style={{ padding: "6px 8px" }}
                  aria-label="Guarda episodio"
                  onClick={(e) => {
                    e.stopPropagation();
                    selectAndPlay(ep.id);
                  }}
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

function VideoPlayer({
  episode,
  playing,
  onPlay,
  onClose,
}: {
  episode: Episode;
  playing: boolean;
  onPlay: () => void;
  onClose: () => void;
}) {
  return (
    <div
      className="relative w-full"
      style={{
        aspectRatio: "16 / 9",
        background:
          "radial-gradient(circle at 30% 30%, hsl(158 60% 22%), transparent 60%), radial-gradient(circle at 70% 70%, hsl(200 55% 20%), transparent 60%), hsl(215 25% 10%)",
      }}
    >
      {!playing && (
        <Thumbnail episode={episode} onPlay={onPlay} />
      )}
      {playing && episode.youtubeId && (
        <iframe
          className="absolute inset-0 w-full h-full"
          src={`https://www.youtube-nocookie.com/embed/${episode.youtubeId}?autoplay=1&rel=0&modestbranding=1`}
          title={episode.title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      )}
      {playing && !episode.youtubeId && (
        <>
          <video
            className="absolute inset-0 w-full h-full"
            src={DEMO_VIDEO_SRC}
            autoPlay
            controls
            playsInline
          />
          <DemoBadge onClose={onClose} />
        </>
      )}
    </div>
  );
}

function Thumbnail({ episode, onPlay }: { episode: Episode; onPlay: () => void }) {
  return (
    <button
      type="button"
      onClick={onPlay}
      className="absolute inset-0 w-full h-full group"
      aria-label={`Guarda episodio ${episode.number}`}
    >
      {/* Pattern decorativo */}
      <div className="absolute inset-0 flex items-center justify-center">
        <Mic className="w-24 h-24 md:w-32 md:h-32 opacity-40" style={{ color: "hsl(0 0% 100% / 0.7)" }} />
      </div>

      {/* Ep number bottom-left */}
      <span
        className="absolute bottom-3 left-3 md:bottom-5 md:left-5 v2-mono text-[11px] md:text-[12px] font-bold uppercase tracking-[0.18em] px-2 py-1 rounded"
        style={{ color: "hsl(0 0% 100% / 0.9)", background: "hsl(0 0% 0% / 0.4)", backdropFilter: "blur(6px)" }}
      >
        Ep.{episode.number.toString().padStart(2, "0")}
      </span>

      {/* Duration bottom-right */}
      <span
        className="absolute bottom-3 right-3 md:bottom-5 md:right-5 v2-mono text-[11px] md:text-[12px] font-bold px-2 py-1 rounded"
        style={{ color: "hsl(0 0% 100% / 0.9)", background: "hsl(0 0% 0% / 0.4)", backdropFilter: "blur(6px)" }}
      >
        {episode.duration}
      </span>

      {/* Play button center */}
      <span
        className="absolute inset-0 flex items-center justify-center"
        aria-hidden
      >
        <span
          className="w-16 h-16 md:w-20 md:h-20 rounded-full grid place-items-center transition-transform duration-200 group-hover:scale-110"
          style={{
            background: "hsl(var(--v2-accent))",
            boxShadow: "0 8px 32px hsl(0 0% 0% / 0.5), 0 0 0 6px hsl(0 0% 100% / 0.08)",
          }}
        >
          <Play className="w-7 h-7 md:w-9 md:h-9" fill="hsl(215 30% 8%)" stroke="hsl(215 30% 8%)" />
        </span>
      </span>
    </button>
  );
}

function DemoBadge({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="absolute top-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-full z-10"
      style={{
        background: "hsl(0 0% 0% / 0.55)",
        backdropFilter: "blur(10px)",
        border: "1px solid hsl(0 0% 100% / 0.15)",
      }}
    >
      <span
        className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
        style={{ color: "hsl(var(--v2-warn))" }}
      >
        Demo · video placeholder
      </span>
      <button
        type="button"
        onClick={onClose}
        aria-label="Chiudi"
        className="opacity-70 hover:opacity-100"
        style={{ color: "hsl(0 0% 100%)" }}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
