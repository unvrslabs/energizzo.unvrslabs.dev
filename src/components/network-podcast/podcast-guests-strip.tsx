import { Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { PODCAST_EPISODES, PODCAST_GUESTS } from "@/lib/podcast/mock";

export function PodcastGuestsStrip() {
  const counts: Record<string, number> = {};
  for (const e of PODCAST_EPISODES) {
    if (!e.guest_slug) continue;
    counts[e.guest_slug] = (counts[e.guest_slug] ?? 0) + 1;
  }

  const guests = PODCAST_GUESTS.filter((g) => counts[g.slug] > 0).sort(
    (a, b) => (counts[b.slug] ?? 0) - (counts[a.slug] ?? 0),
  );

  if (guests.length === 0) return null;

  return (
    <section className="dispaccio-card rounded-[1.75rem] p-5 md:p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2.5">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
            <Users2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Ospiti del podcast
            </h2>
            <p className="text-[11px] text-muted-foreground">
              Gli esperti del settore energia che abbiamo portato al microfono.
            </p>
          </div>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {guests.map((g) => (
          <li
            key={g.slug}
            className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/15 transition-colors px-3 py-2.5"
          >
            <div
              className={cn(
                "inline-flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br text-sm font-bold text-white border border-white/20 shrink-0",
                g.gradient,
              )}
            >
              {g.initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">
                {g.name}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {g.role} · {g.company}
              </p>
            </div>
            <span className="inline-flex items-center justify-center rounded-full bg-primary/15 text-primary px-2 min-w-[1.75rem] h-6 text-[10px] font-bold">
              {counts[g.slug]}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
