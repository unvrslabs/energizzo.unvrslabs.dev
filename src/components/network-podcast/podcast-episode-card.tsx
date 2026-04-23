import { FileText, Headphones, PlayCircle, Youtube } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PodcastEpisode, PodcastGuest } from "@/lib/podcast/mock";
import { TOPIC_COLOR, TOPIC_LABEL } from "@/lib/podcast/mock";
import { formatDateShortIt as formatDateIt } from "@/lib/date-utils";

export function PodcastEpisodeCard({
  episode,
  guest,
}: {
  episode: PodcastEpisode;
  guest: PodcastGuest | null;
}) {
  return (
    <article className="dispaccio-card rounded-[1.75rem] overflow-hidden flex flex-col group hover:border-primary/30 transition-colors">
      <div
        className={cn(
          "relative aspect-[16/9] overflow-hidden bg-gradient-to-br",
          episode.gradient,
        )}
      >
        <div
          aria-hidden
          className="absolute -top-16 -right-12 h-48 w-48 rounded-full bg-white/15 blur-2xl"
        />
        <div
          aria-hidden
          className="absolute -bottom-20 -left-8 h-52 w-52 rounded-full bg-black/25 blur-2xl"
        />

        <div className="relative h-full p-4 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <span className="inline-flex items-center rounded-full border border-white/30 bg-black/30 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white">
              EP {String(episode.number).padStart(2, "0")}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-black/30 backdrop-blur-sm px-2.5 py-1 text-[10px] font-bold text-white">
              <Headphones className="h-3 w-3" />
              {episode.duration_min} min
            </span>
          </div>

          <div className="flex items-end justify-between">
            <p className="text-[11px] font-bold text-white/85 tracking-wide">
              {formatDateIt(episode.date)}
            </p>
            {guest && (
              <div
                className={cn(
                  "inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br text-[10px] font-bold text-white border border-white/30",
                  guest.gradient,
                )}
                title={guest.name}
              >
                {guest.initials}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-5 flex flex-col gap-3">
        <h3 className="text-base md:text-lg font-bold leading-snug tracking-tight line-clamp-2">
          {episode.title}
        </h3>
        <p className="text-[13px] text-muted-foreground leading-relaxed line-clamp-3 flex-1">
          {episode.excerpt}
        </p>

        <div className="flex items-center gap-1.5 flex-wrap pt-1">
          {episode.topics.slice(0, 2).map((t) => (
            <span
              key={t}
              className={cn(
                "inline-flex rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em]",
                TOPIC_COLOR[t],
              )}
            >
              {TOPIC_LABEL[t]}
            </span>
          ))}
          {episode.has_transcript && (
            <span className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-2 py-0.5 text-[9px] font-semibold text-muted-foreground">
              <FileText className="h-2.5 w-2.5" />
              Trascrizione
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 pt-1">
          {episode.spotify_url && (
            <a
              href={episode.spotify_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/90 hover:bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-black transition-colors"
            >
              <PlayCircle className="h-3.5 w-3.5" />
              Spotify
            </a>
          )}
          {episode.youtube_url && (
            <a
              href={episode.youtube_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:border-primary/30 px-3 py-1.5 text-[11px] font-bold text-foreground/85 hover:text-foreground transition-colors"
            >
              <Youtube className="h-3.5 w-3.5" />
              YouTube
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
