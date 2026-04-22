"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PODCAST_EPISODES,
  PODCAST_GUESTS,
  TOPIC_LABEL,
  type PodcastTopic,
} from "@/lib/podcast/mock";
import { PodcastEpisodeCard } from "./podcast-episode-card";

type TopicFilter = "all" | PodcastTopic;

const ALL_TOPICS: PodcastTopic[] = [
  "mercato-libero",
  "stg",
  "regolatorio",
  "pricing",
  "reseller-ops",
  "gas",
];

export function PodcastEpisodesList({ skipEpisodeSlug }: { skipEpisodeSlug?: string }) {
  const [topic, setTopic] = useState<TopicFilter>("all");
  const [query, setQuery] = useState("");

  const episodes = useMemo(
    () => PODCAST_EPISODES.filter((e) => e.slug !== skipEpisodeSlug),
    [skipEpisodeSlug],
  );

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: episodes.length };
    for (const t of ALL_TOPICS) {
      c[t] = episodes.filter((e) => e.topics.includes(t)).length;
    }
    return c;
  }, [episodes]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return episodes.filter((e) => {
      if (topic !== "all" && !e.topics.includes(topic)) return false;
      if (!q) return true;
      const hay = (e.title + " " + e.excerpt).toLowerCase();
      return hay.includes(q);
    });
  }, [episodes, topic, query]);

  const hasFilter = topic !== "all" || query !== "";

  return (
    <section className="space-y-5">
      <header className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="text-lg md:text-xl font-bold tracking-tight">
            Tutti gli episodi
            <span className="text-muted-foreground font-semibold ml-2">
              · {visible.length}
            </span>
          </h2>
        </div>

        <div className="liquid-glass-nav rounded-[1.75rem] p-2.5 flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative flex-1 min-w-0">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per titolo, contenuto…"
              className="w-full rounded-full bg-transparent pl-10 pr-9 py-2 text-sm outline-none placeholder:text-muted-foreground/50"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                aria-label="Pulisci"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="hidden md:block w-px h-6 bg-white/10" aria-hidden />

          <div className="flex items-center gap-1.5 flex-wrap">
            <TopicPill
              active={topic === "all"}
              onClick={() => setTopic("all")}
              label="Tutti"
              count={counts.all}
            />
            {ALL_TOPICS.map((t) => (
              <TopicPill
                key={t}
                active={topic === t}
                onClick={() => setTopic(t)}
                label={TOPIC_LABEL[t]}
                count={counts[t]}
              />
            ))}
            {hasFilter && (
              <button
                type="button"
                onClick={() => {
                  setTopic("all");
                  setQuery("");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-white/25 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Pulisci
              </button>
            )}
          </div>
        </div>
      </header>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nessun episodio nel filtro corrente.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2">
          {visible.map((e) => {
            const guest = e.guest_slug
              ? PODCAST_GUESTS.find((g) => g.slug === e.guest_slug) ?? null
              : null;
            return (
              <PodcastEpisodeCard key={e.slug} episode={e} guest={guest} />
            );
          })}
        </div>
      )}
    </section>
  );
}

function TopicPill({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
        active
          ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
          : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:border-white/25",
      )}
    >
      {label}
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full px-1.5 min-w-[1.2rem] h-4 text-[10px] font-bold",
          active ? "bg-primary/25 text-primary" : "bg-white/10",
        )}
      >
        {count}
      </span>
    </button>
  );
}
