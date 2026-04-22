import { DELIBERE_DEADLINES } from "@/lib/delibere/mock";
import { cn } from "@/lib/utils";

const MONTHS_IT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

function splitDate(date: string): { day: string; mon: string; yr: string } {
  const d = new Date(date + "T00:00:00Z");
  return {
    day: String(d.getUTCDate()).padStart(2, "0"),
    mon: MONTHS_IT[d.getUTCMonth()],
    yr: String(d.getUTCFullYear()).slice(2),
  };
}

function daysUntil(date: string): number {
  const target = new Date(date + "T00:00:00Z").getTime();
  const now = Date.now();
  return Math.round((target - now) / (24 * 60 * 60 * 1000));
}

function etaLabel(diff: number): string {
  if (diff === 0) return "oggi";
  if (diff > 0) return `fra ${diff}g`;
  return `${Math.abs(diff)}g fa`;
}

export function DelibereSidebar() {
  const sorted = [...DELIBERE_DEADLINES].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );

  return (
    <aside className="lg:sticky lg:top-[11rem] lg:self-start">
      <div className="border-t-2 border-foreground pt-5">
        <h2 className="text-[13px] font-bold uppercase tracking-[0.14em] text-foreground">
          Prossime scadenze
        </h2>
        <p className="net-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground/80 mt-1">
          — {String(sorted.length).padStart(2, "0")} date chiave
        </p>
      </div>

      <ol className="mt-1">
        {sorted.map((d) => {
          const { day, mon, yr } = splitDate(d.date);
          const diff = daysUntil(d.date);
          const isNow = d.severity === "live" || (diff >= 0 && diff <= 7);

          return (
            <li
              key={`${d.date}-${d.deliberaCode}`}
              className={cn(
                "relative grid grid-cols-[58px_minmax(0,1fr)] gap-4 py-4 border-t border-white/5",
                isNow && "pl-4 -ml-4",
              )}
            >
              {isNow && (
                <span
                  aria-hidden
                  className="absolute left-0 top-5 bottom-5 w-[2px] bg-primary"
                />
              )}

              <div>
                <div
                  className={cn(
                    "net-mono font-bold text-[26px] leading-none tracking-[-0.02em] pt-0.5",
                    isNow ? "text-primary" : "text-foreground",
                  )}
                >
                  {day}
                </div>
                <div
                  className={cn(
                    "net-mono font-medium text-[10px] uppercase tracking-[0.2em] mt-1.5",
                    isNow ? "text-primary/90" : "text-muted-foreground",
                  )}
                >
                  {mon} {yr}
                </div>
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-semibold leading-snug text-foreground tracking-[-0.005em] mb-1.5">
                  {d.label}
                </p>
                {isNow && d.severity === "live" && (
                  <div className="inline-flex items-center gap-1.5 mb-1.5">
                    <span className="net-live-dot" />
                    <span className="net-mono text-[9.5px] font-bold uppercase tracking-[0.2em] text-primary/90">
                      Live · oggi
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-2.5 net-mono text-[10px] tracking-[0.08em] text-muted-foreground/80">
                  <span>{d.deliberaCode}</span>
                  <span
                    aria-hidden
                    className="w-1 h-1 rounded-full bg-muted-foreground/40"
                  />
                  <span>{etaLabel(diff)}</span>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
