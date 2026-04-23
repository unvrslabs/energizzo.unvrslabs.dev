import { Headphones, PlayCircle, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PodcastEpisode, PodcastGuest } from "@/lib/podcast/mock";
import { TOPIC_COLOR, TOPIC_LABEL } from "@/lib/podcast/mock";
import { formatDateIt } from "@/lib/date-utils";

export function PodcastHero({
  episode,
  guest,
}: {
  episode: PodcastEpisode;
  guest: PodcastGuest | null;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[2rem] border border-white/10 p-6 md:p-8 bg-gradient-to-br",
        episode.gradient,
      )}
    >
      <div
        aria-hidden
        className="absolute -top-32 -right-24 h-80 w-80 rounded-full bg-white/10 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -bottom-40 -left-24 h-72 w-72 rounded-full bg-black/25 blur-3xl"
      />

      <div className="relative grid gap-6 md:grid-cols-[auto,1fr] items-center">
        <div className="h-32 w-32 md:h-40 md:w-40 rounded-3xl bg-black/25 backdrop-blur-sm border border-white/15 flex items-center justify-center shadow-2xl">
          <Headphones className="h-14 w-14 md:h-16 md:w-16 text-white/90" strokeWidth={1.5} />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 rounded-full border border-white/25 bg-white/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/95">
              Ultimo episodio
            </span>
            <span className="text-[11px] font-bold text-white/80 tracking-wide">
              S{episode.season} · EP {String(episode.number).padStart(2, "0")}
            </span>
            <span className="text-[11px] text-white/70">
              · {formatDateIt(episode.date)} · {episode.duration_min} min
            </span>
          </div>

          <h1 className="text-2xl md:text-[32px] leading-tight font-bold tracking-tight text-white mb-2">
            {episode.title}
          </h1>

          <p className="text-sm md:text-[15px] text-white/85 leading-relaxed max-w-2xl mb-4">
            {episode.excerpt}
          </p>

          {guest && (
            <div className="flex items-center gap-2 mb-5">
              <div
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[11px] font-bold text-white border border-white/30",
                  guest.gradient,
                )}
              >
                {guest.initials}
              </div>
              <div className="text-[12px]">
                <p className="font-semibold text-white">con {guest.name}</p>
                <p className="text-white/70">
                  {guest.role} — {guest.company}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 flex-wrap">
            {episode.spotify_url && (
              <a
                href={episode.spotify_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-4 py-2 text-xs font-bold text-black hover:bg-emerald-400 transition-colors shadow-md"
              >
                <PlayCircle className="h-4 w-4" />
                Ascolta su Spotify
              </a>
            )}
            {episode.youtube_url && (
              <a
                href={episode.youtube_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 text-xs font-bold text-white hover:bg-white/20 transition-colors"
              >
                <Youtube className="h-4 w-4" />
                Guarda su YouTube
              </a>
            )}
            <div className="flex items-center gap-1.5 flex-wrap">
              {episode.topics.map((t) => (
                <span
                  key={t}
                  className={cn(
                    "inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                    TOPIC_COLOR[t],
                  )}
                >
                  {TOPIC_LABEL[t]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
