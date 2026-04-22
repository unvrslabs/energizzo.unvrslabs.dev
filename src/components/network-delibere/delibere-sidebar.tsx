import { CalendarClock, Flame, Zap } from "lucide-react";
import {
  DELIBERE_DEADLINES,
  type DeadlineSeverity,
  type DeliberaSector,
} from "@/lib/delibere/mock";
import { cn } from "@/lib/utils";

function daysUntil(date: string): number {
  const target = new Date(date + "T00:00:00Z").getTime();
  const now = Date.now();
  return Math.round((target - now) / (24 * 60 * 60 * 1000));
}

function formatDate(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

const SEVERITY_STYLE: Record<
  DeadlineSeverity,
  { dot: string; badge: string; label: string }
> = {
  live: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    label: "Live",
  },
  imminent: {
    dot: "bg-amber-400",
    badge: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    label: "Imminente",
  },
  upcoming: {
    dot: "bg-sky-400",
    badge: "bg-sky-500/15 text-sky-300 border-sky-500/30",
    label: "In arrivo",
  },
  far: {
    dot: "bg-muted",
    badge: "bg-white/5 text-muted-foreground border-white/10",
    label: "Pianificato",
  },
};

function SectorIcon({ sector }: { sector: DeliberaSector }) {
  if (sector === "gas") return <Flame className="h-3 w-3 text-sky-300" />;
  if (sector === "eel") return <Zap className="h-3 w-3 text-amber-300" />;
  return <Zap className="h-3 w-3 text-muted-foreground" />;
}

function DeadlinesCard() {
  const sorted = [...DELIBERE_DEADLINES].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <section className="dispaccio-card rounded-2xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/25">
          <CalendarClock className="h-3.5 w-3.5" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xs font-bold tracking-tight">Prossime scadenze</h3>
          <p className="text-[10px] text-muted-foreground">
            {sorted.length} date chiave dalle delibere in vigore
          </p>
        </div>
      </div>

      <ol className="space-y-2">
        {sorted.map((d) => {
          const diff = daysUntil(d.date);
          const style = SEVERITY_STYLE[d.severity];
          const diffLabel =
            diff === 0
              ? "oggi"
              : diff > 0
                ? `fra ${diff}g`
                : `${Math.abs(diff)}g fa`;

          return (
            <li
              key={`${d.date}-${d.deliberaCode}`}
              className="rounded-lg border border-white/5 bg-white/[0.02] p-2.5 space-y-1.5"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <SectorIcon sector={d.sector} />
                  <p className="text-[11px] font-bold tracking-wide">
                    {formatDate(d.date)}
                  </p>
                </div>
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.1em]",
                    style.badge,
                  )}
                >
                  {style.label}
                </span>
              </div>
              <p className="text-[11px] text-foreground/85 leading-snug">
                {d.label}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-between">
                <span className="font-mono">{d.deliberaCode}</span>
                <span className="font-semibold">{diffLabel}</span>
              </p>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function DelibereSidebar() {
  return (
    <aside className="lg:sticky lg:top-[11rem] lg:self-start">
      <DeadlinesCard />
    </aside>
  );
}
