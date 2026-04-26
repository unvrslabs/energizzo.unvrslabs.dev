"use client";

import { useMemo, useState } from "react";
import { Clock, Mic, Play, Search, User, X } from "lucide-react";

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

// Estrae minuti da "47 min" → 47
function parseMinutes(s: string): number {
  const m = s.match(/(\d+)/);
  return m ? Number(m[1]) : 0;
}

// Formatta minuti totali → "8h 12m"
function formatTotalDuration(mins: number): string {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

// Avatar iniziali da "Marco Conti, ex-GME" → "MC"
function guestInitials(guest: string): string {
  const name = guest.split(",")[0]?.trim() ?? "";
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TAG_FILTERS: Array<{ key: "all" | Episode["tag"]; label: string }> = [
  { key: "all", label: "Tutti" },
  { key: "mercato", label: "Mercato" },
  { key: "regolazione", label: "Regolazione" },
  { key: "eel", label: "Energia" },
  { key: "gas", label: "Gas" },
];

export function PodcastClient() {
  const featured = EPISODES.find((e) => e.featured) ?? EPISODES[0];
  const [selectedId, setSelectedId] = useState(featured.id);
  const [playing, setPlaying] = useState(false);
  const [tagFilter, setTagFilter] = useState<"all" | Episode["tag"]>("all");
  const [query, setQuery] = useState("");

  const selected = EPISODES.find((e) => e.id === selectedId) ?? featured;

  function selectAndPlay(id: string) {
    setSelectedId(id);
    setPlaying(true);
  }

  const totalMinutes = EPISODES.reduce((s, e) => s + parseMinutes(e.duration), 0);
  const totalEpisodes = EPISODES.length;

  const filteredArchive = useMemo(() => {
    const q = query.trim().toLowerCase();
    return EPISODES.filter((e) => e.id !== selected.id)
      .filter((e) => tagFilter === "all" || e.tag === tagFilter)
      .filter((e) => {
        if (!q) return true;
        return (
          e.title.toLowerCase().includes(q) ||
          e.guest.toLowerCase().includes(q)
        );
      });
  }, [selected.id, tagFilter, query]);

  const tagCounts = useMemo(() => {
    const c: Record<"all" | Episode["tag"], number> = {
      all: EPISODES.length - 1, // escludi featured
      mercato: 0,
      regolazione: 0,
      eel: 0,
      gas: 0,
    };
    EPISODES.filter((e) => e.id !== selected.id).forEach((e) => {
      c[e.tag]++;
    });
    return c;
  }, [selected.id]);

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

      {/* Stats strip */}
      <div className="v2-ticker-row" style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}>
        <div className="v2-ticker-cell">
          <div className="v2-ticker-head">
            <span className="v2-ticker-code">EPISODI</span>
            <Mic className="w-3 h-3" style={{ color: "hsl(var(--v2-accent))" }} />
          </div>
          <div>
            <span className="v2-ticker-value">{totalEpisodes}</span>
          </div>
          <span className="v2-ticker-label">disponibili in archivio</span>
        </div>
        <div className="v2-ticker-cell">
          <div className="v2-ticker-head">
            <span className="v2-ticker-code">DURATA</span>
            <Clock className="w-3 h-3" style={{ color: "hsl(var(--v2-info))" }} />
          </div>
          <div>
            <span className="v2-ticker-value">{formatTotalDuration(totalMinutes)}</span>
          </div>
          <span className="v2-ticker-label">contenuto totale</span>
        </div>
        <div className="v2-ticker-cell">
          <div className="v2-ticker-head">
            <span className="v2-ticker-code">CADENZA</span>
            <span className="v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-accent))" }}>
              live
            </span>
          </div>
          <div>
            <span className="v2-ticker-value" style={{ fontSize: 22 }}>1 / 10gg</span>
          </div>
          <span className="v2-ticker-label">nuovo episodio bisettimanale</span>
        </div>
      </div>

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
      <section className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2 pl-1 flex-wrap">
          <span className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Archivio · {filteredArchive.length} episodi
          </span>
        </div>

        {/* Search + filtri tag */}
        <div className="v2-card" style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ position: "relative" }}>
            <Search
              className="w-3.5 h-3.5"
              style={{
                position: "absolute",
                left: 12,
                top: "50%",
                transform: "translateY(-50%)",
                color: "hsl(var(--v2-text-mute))",
              }}
            />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per titolo o ospite…"
              className="v2-input"
              style={{ width: "100%", paddingLeft: 34, paddingRight: query ? 32 : 12 }}
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{
                  position: "absolute",
                  right: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "hsl(var(--v2-text-mute))",
                }}
                aria-label="Pulisci"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TAG_FILTERS.map((tf) => {
              const active = tagFilter === tf.key;
              const count = tagCounts[tf.key];
              return (
                <button
                  key={tf.key}
                  type="button"
                  onClick={() => setTagFilter(tf.key)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors"
                  style={{
                    background: active
                      ? "hsl(var(--v2-accent) / 0.14)"
                      : "hsl(var(--v2-bg-elev))",
                    color: active
                      ? "hsl(var(--v2-accent))"
                      : "hsl(var(--v2-text-dim))",
                    border: `1px solid ${
                      active
                        ? "hsl(var(--v2-accent) / 0.35)"
                        : "hsl(var(--v2-border))"
                    }`,
                  }}
                >
                  {tf.label}
                  <span className="v2-mono text-[10px] opacity-75 font-semibold">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="v2-card overflow-hidden">
          {filteredArchive.length === 0 ? (
            <div className="p-8 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessun episodio trovato.
            </div>
          ) : (
            <ul>
              {filteredArchive.map((ep, idx) => (
                <li
                  key={ep.id}
                  onClick={() => selectAndPlay(ep.id)}
                  className="grid items-center gap-3 px-4 md:px-5 py-3 cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{
                    gridTemplateColumns: "auto auto minmax(0, 1fr) auto auto",
                    borderBottom:
                      idx < filteredArchive.length - 1
                        ? "1px solid hsl(var(--v2-border))"
                        : undefined,
                  }}
                >
                  {/* Avatar guest */}
                  <span
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      background: `${TAG_COLOR[ep.tag]}15`,
                      border: `1px solid ${TAG_COLOR[ep.tag]}40`,
                      color: TAG_COLOR[ep.tag],
                      flexShrink: 0,
                      fontFamily: "var(--font-mono), monospace",
                      fontSize: 11,
                      fontWeight: 800,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {guestInitials(ep.guest)}
                  </span>

                  {/* Ep number + tag chip */}
                  <div className="flex flex-col gap-1 items-start" style={{ minWidth: 60 }}>
                    <span
                      className="v2-mono text-[10.5px] font-bold"
                      style={{ color: "hsl(var(--v2-text-mute))", letterSpacing: "0.08em" }}
                    >
                      EP.{ep.number.toString().padStart(2, "0")}
                    </span>
                    <span
                      className="v2-chip"
                      style={{
                        color: TAG_COLOR[ep.tag],
                        borderColor: `${TAG_COLOR[ep.tag]}55`,
                        background: `${TAG_COLOR[ep.tag]}15`,
                      }}
                    >
                      {TAG_LABEL[ep.tag]}
                    </span>
                  </div>

                  {/* Title + guest */}
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
          )}
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
