"use client";

import { useMemo, useState } from "react";
import {
  Zap,
  Flame,
  Layers,
  Search,
  Calendar,
  ChevronDown,
  X,
  Check,
} from "lucide-react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  DELIBERE,
  type Delibera,
  type DeliberaSector,
} from "@/lib/delibere/mock";
import { DeliberaCard } from "./delibera-card";
import { DeliberaChatDialog } from "./delibera-chat-dialog";

type SectorFilter = "all" | "eel" | "gas";

const FILTERS: {
  v: SectorFilter;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { v: "all", label: "Tutte", icon: Layers, color: "text-muted-foreground" },
  { v: "eel", label: "Energia", icon: Zap, color: "text-amber-300" },
  { v: "gas", label: "Gas", icon: Flame, color: "text-sky-300" },
];

type PeriodFilter = "all" | "30d" | "90d" | "180d" | "year";

const PERIODS: { v: PeriodFilter; label: string }[] = [
  { v: "all", label: "Tutte le date" },
  { v: "30d", label: "Ultimi 30 giorni" },
  { v: "90d", label: "Ultimi 3 mesi" },
  { v: "180d", label: "Ultimi 6 mesi" },
  { v: "year", label: "Ultimo anno" },
];

function periodCutoff(period: PeriodFilter): number | null {
  if (period === "all") return null;
  const now = Date.now();
  const days =
    period === "30d" ? 30 : period === "90d" ? 90 : period === "180d" ? 180 : 365;
  return now - days * 24 * 60 * 60 * 1000;
}

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function DelibereList() {
  const [sector, setSector] = useState<SectorFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [year, setYear] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [yearOpen, setYearOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [selected, setSelected] = useState<Delibera | null>(null);

  const availableYears = useMemo(() => {
    const set = new Set<number>();
    for (const d of DELIBERE) set.add(new Date(d.date).getFullYear());
    return Array.from(set).sort((a, b) => b - a);
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const cutoff = periodCutoff(period);
    const base = DELIBERE.filter((d) => {
      if (sector !== "all" && !(d.sectors as DeliberaSector[]).includes(sector)) {
        return false;
      }
      const t = new Date(d.date).getTime();
      if (cutoff !== null && t < cutoff) return false;
      if (year !== null && new Date(d.date).getFullYear() !== year) return false;
      if (q) {
        const hay = (
          d.title +
          " " +
          d.code +
          " " +
          d.summary +
          " " +
          d.bullets.join(" ")
        ).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return sortByDateDesc(base);
  }, [sector, period, year, query]);

  const sectorCounts = useMemo(
    () => ({
      all: DELIBERE.length,
      eel: DELIBERE.filter((d) => d.sectors.includes("eel")).length,
      gas: DELIBERE.filter((d) => d.sectors.includes("gas")).length,
    }),
    [],
  );

  function openChat(d: Delibera) {
    setSelected(d);
    setChatOpen(true);
  }

  const hasAnyFilter =
    sector !== "all" || period !== "all" || year !== null || query !== "";
  const periodLabel =
    year !== null
      ? String(year)
      : PERIODS.find((p) => p.v === period)?.label ?? "Tutte le date";
  const periodActive = period !== "all" || year !== null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <header className="space-y-3">
        <div className="liquid-glass-nav rounded-[1.75rem] p-2.5 sm:p-3 flex flex-col md:flex-row md:items-center gap-2">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per titolo, codice, contenuto…"
              className="w-full rounded-full bg-transparent pl-10 pr-10 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Pulisci ricerca"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div
            aria-hidden
            className="hidden md:block w-px h-6 bg-white/10"
          />

          <div className="flex items-center gap-1.5 flex-wrap">
          {FILTERS.map((f) => {
            const active = sector === f.v;
            const Icon = f.icon;
            const count = sectorCounts[f.v];
            return (
              <button
                key={f.v}
                type="button"
                onClick={() => setSector(f.v)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                  active
                    ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:border-white/25",
                )}
              >
                <Icon
                  className={cn(
                    "h-3.5 w-3.5",
                    active ? "text-primary" : f.color,
                  )}
                />
                {f.label}
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
          })}

          <Popover open={yearOpen} onOpenChange={setYearOpen}>
            <PopoverTrigger asChild>
              <button
                type="button"
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all",
                  periodActive
                    ? "border-primary bg-primary/15 text-primary shadow-sm shadow-primary/20"
                    : "border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:border-white/25",
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                {periodLabel}
                <ChevronDown className="h-3.5 w-3.5 opacity-60" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="w-[220px] p-0 border-primary/20 bg-card/40 backdrop-blur-xl dispaccio-card rounded-2xl"
            >
              <div className="py-1 border-b border-white/10">
                {PERIODS.map((p) => {
                  const active = period === p.v && year === null;
                  return (
                    <button
                      key={p.v}
                      type="button"
                      onClick={() => {
                        setPeriod(p.v);
                        setYear(null);
                        setYearOpen(false);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-left transition-colors",
                        active
                          ? "bg-primary/10 text-foreground"
                          : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                      )}
                    >
                      {p.label}
                      {active && <Check className="h-3.5 w-3.5 text-primary" />}
                    </button>
                  );
                })}
              </div>
              {availableYears.length > 0 && (
                <div className="py-1">
                  <p className="px-3 py-1 text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                    Per anno
                  </p>
                  {availableYears.map((y) => {
                    const active = year === y;
                    return (
                      <button
                        key={y}
                        type="button"
                        onClick={() => {
                          setYear(y);
                          setPeriod("all");
                          setYearOpen(false);
                        }}
                        className={cn(
                          "w-full flex items-center justify-between gap-2 px-3 py-1.5 text-sm text-left transition-colors",
                          active
                            ? "bg-primary/10 text-foreground"
                            : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                        )}
                      >
                        {y}
                        {active && <Check className="h-3.5 w-3.5 text-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </PopoverContent>
          </Popover>

            {hasAnyFilter && (
              <button
                type="button"
                onClick={() => {
                  setSector("all");
                  setPeriod("all");
                  setYear(null);
                  setQuery("");
                }}
                className="inline-flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] text-muted-foreground hover:text-foreground hover:border-white/25 px-3 py-1.5 text-xs font-semibold transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                Pulisci
              </button>
            )}
          </div>
        </div>

        <p className="text-[11px] text-muted-foreground/70 px-2">
          {visible.length}{" "}
          {visible.length === 1 ? "delibera" : "delibere"} nel filtro corrente
        </p>
      </header>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nessuna delibera nel filtro corrente.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:gap-5">
          {visible.map((d) => (
            <DeliberaCard
              key={d.code}
              delibera={d}
              onAskAgent={openChat}
            />
          ))}
        </div>
      )}

      <DeliberaChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        delibera={selected}
      />
    </div>
  );
}
