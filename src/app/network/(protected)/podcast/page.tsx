import { PODCAST_EPISODES, PODCAST_GUESTS } from "@/lib/podcast/mock";
import { PodcastHero } from "@/components/network-podcast/podcast-hero";
import { PodcastEpisodesList } from "@/components/network-podcast/podcast-episodes-list";
import { PodcastQuestions } from "@/components/network-podcast/podcast-questions";
import { PodcastGuestsStrip } from "@/components/network-podcast/podcast-guests-strip";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Podcast — Il Dispaccio",
  robots: { index: false, follow: false },
};

export default function PodcastPage() {
  const sorted = [...PODCAST_EPISODES].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
  const latest = sorted[0];
  const latestGuest = latest.guest_slug
    ? PODCAST_GUESTS.find((g) => g.slug === latest.guest_slug) ?? null
    : null;

  const totalMinutes = PODCAST_EPISODES.reduce(
    (sum, e) => sum + e.duration_min,
    0,
  );
  const hours = Math.round((totalMinutes / 60) * 10) / 10;

  return (
    <div className="max-w-5xl mx-auto space-y-8 md:space-y-10">
      <header className="space-y-2">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-primary/80">
          Il Dispaccio · Podcast
        </p>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Il podcast dei reseller energia italiani
        </h1>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Episodi settimanali con ospiti, analisi regolatorie e operativa
          quotidiana del mercato retail italiano. Disponibile su Spotify,
          YouTube e Apple Podcasts.
        </p>
        <div className="flex items-center gap-3 pt-2 flex-wrap">
          <Stat label="Episodi" value={String(PODCAST_EPISODES.length)} />
          <Stat label="Ospiti" value={String(PODCAST_GUESTS.length)} />
          <Stat label="Ore di audio" value={`${hours}h`} />
          <Stat label="Stagione" value="1" />
        </div>
      </header>

      <PodcastHero episode={latest} guest={latestGuest} />

      <PodcastEpisodesList skipEpisodeSlug={latest.slug} />

      <PodcastQuestions />

      <PodcastGuestsStrip />

      <footer className="pt-4 pb-10 text-center">
        <p className="text-[11px] text-muted-foreground/60">
          Dati mockup — in attesa di pubblicazione ufficiale
        </p>
      </footer>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1">
      <span className="text-sm font-bold text-foreground">{value}</span>
      <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}
