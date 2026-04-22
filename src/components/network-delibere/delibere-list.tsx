"use client";

import { useMemo, useState } from "react";
import { Calendar, ChevronDown, Check, Search, X } from "lucide-react";
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
import { DelibereSidebar } from "./delibere-sidebar";

type SectorFilter = "all" | "eel" | "gas";

const SECTORS: { v: SectorFilter; label: string }[] = [
  { v: "all", label: "Tutte" },
  { v: "eel", label: "EEL" },
  { v: "gas", label: "GAS" },
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

const MONTHS_IT_SHORT = [
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

function todayLabel(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}·${MONTHS_IT_SHORT[d.getMonth()]}`;
}

export function DelibereList() {
  const [sector, setSector] = useState<SectorFilter>("all");
  const [period, setPeriod] = useState<PeriodFilter>("all");
  const [year, setYear] = useState<number | null>(null);
  const [query, setQuery] = useState("");
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

  const periodLabel =
    year !== null
      ? String(year)
      : PERIODS.find((p) => p.v === period)?.label ?? "Tutte le date";
  const periodActive = period !== "all" || year !== null;

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page header — editorial */}
      <header className="pt-4 md:pt-8 pb-8 flex items-end justify-between gap-6 flex-wrap border-b border-white/[0.06]">
        <div>
          <p className="net-mono text-[10.5px] font-semibold uppercase tracking-[0.22em] text-primary/90 flex items-center gap-3">
            <span aria-hidden className="w-5 h-px bg-primary" />
            Atti di regolazione · 2024–2026
          </p>
          <h1 className="mt-4 text-[34px] md:text-[48px] font-extrabold leading-[1] tracking-[-0.035em] text-foreground">
            Delibere{" "}
            <span className="net-serif italic font-normal text-primary/90">
              ARERA
            </span>
          </h1>
        </div>
        <div className="flex items-baseline gap-7 md:gap-9 pr-1">
          <KPI value={String(DELIBERE.length).padStart(2, "0")} label="Atti" />
          <KPI value={String(visible.length).padStart(2, "0")} label="Filtrate" />
          <KPI value={todayLabel()} label="Aggiornato" mono />
        </div>
      </header>

      {/* Sticky filter rail */}
      <div className="sticky top-[88px] z-30 -mx-4 md:-mx-6 px-4 md:px-6 pt-5 pb-4 bg-gradient-to-b from-[hsl(218_32%_7%)] via-[hsl(218_32%_7%/0.95)] to-transparent backdrop-blur-sm">
        <div className="flex items-stretch border border-white/[0.1] rounded-xl bg-[hsl(218_28%_10%)] overflow-hidden">
          {/* Search */}
          <label className="flex items-center gap-3 px-4 md:px-5 flex-1 min-w-0 border-r border-white/[0.08]">
            <Search className="h-4 w-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca titolo, codice, contenuto…"
              className="bg-transparent border-0 outline-none w-full py-3 text-[14px] text-foreground placeholder:text-muted-foreground/60 tracking-[-0.005em]"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Pulisci ricerca"
                className="text-muted-foreground hover:text-foreground shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>

          {/* Sector segmented — hairline underline */}
          <div className="hidden md:flex items-stretch border-r border-white/[0.08]">
            {SECTORS.map((s) => {
              const active = sector === s.v;
              const count = sectorCounts[s.v];
              return (
                <button
                  key={s.v}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setSector(s.v)}
                  className={cn(
                    "relative px-4 lg:px-5 net-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                    active
                      ? "text-foreground bg-white/[0.03]"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {s.label}
                  <span
                    className={cn(
                      "ml-2 text-[10px] tracking-[0.08em]",
                      active ? "text-primary/90" : "text-muted-foreground/70",
                    )}
                  >
                    {String(count).padStart(2, "0")}
                  </span>
                  {active && (
                    <span
                      aria-hidden
                      className="absolute left-4 right-4 lg:left-5 lg:right-5 bottom-0 h-[2px] bg-primary"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* Date popover */}
          <DatePopoverTrigger
            label={periodLabel}
            active={periodActive}
            period={period}
            year={year}
            availableYears={availableYears}
            onSelectPeriod={(p) => {
              setPeriod(p);
              setYear(null);
            }}
            onSelectYear={(y) => {
              setYear(y);
              setPeriod("all");
            }}
          />
        </div>

        {/* Mobile sector row */}
        <div className="md:hidden mt-2 flex items-center gap-1 border border-white/[0.1] rounded-xl bg-[hsl(218_28%_10%)] overflow-hidden">
          {SECTORS.map((s) => {
            const active = sector === s.v;
            const count = sectorCounts[s.v];
            return (
              <button
                key={s.v}
                type="button"
                onClick={() => setSector(s.v)}
                className={cn(
                  "relative flex-1 px-4 py-2.5 net-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  active
                    ? "text-foreground bg-white/[0.03]"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s.label}
                <span
                  className={cn(
                    "ml-2 text-[10px]",
                    active ? "text-primary/90" : "text-muted-foreground/70",
                  )}
                >
                  {String(count).padStart(2, "0")}
                </span>
                {active && (
                  <span
                    aria-hidden
                    className="absolute left-4 right-4 bottom-0 h-[2px] bg-primary"
                  />
                )}
              </button>
            );
          })}
        </div>

        <p className="net-mono text-[10.5px] uppercase tracking-[0.2em] text-muted-foreground/80 mt-3 px-1">
          — {String(visible.length).padStart(2, "0")} atti nel filtro corrente
        </p>
      </div>

      {/* Grid · sidebar + articles */}
      <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-12 items-start pt-6 pb-16">
        <DelibereSidebar />

        <div className="min-w-0">
          {visible.length === 0 ? (
            <div className="net-card p-10 text-center">
              <p className="net-serif text-[15px] text-muted-foreground">
                Nessun atto corrisponde al filtro corrente.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {visible.map((d) => (
                <DeliberaCard
                  key={d.code}
                  delibera={d}
                  onAskAgent={openChat}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <DeliberaChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        delibera={selected}
      />
    </div>
  );
}

function KPI({
  value,
  label,
  mono,
}: {
  value: string;
  label: string;
  mono?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span
        className={cn(
          "font-bold text-[22px] md:text-[26px] leading-none tracking-[-0.02em] text-foreground",
          mono && "net-mono",
          !mono && "net-mono",
        )}
      >
        {value}
      </span>
      <span className="net-mono text-[9.5px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/80">
        {label}
      </span>
    </div>
  );
}

function DatePopoverTrigger({
  label,
  active,
  period,
  year,
  availableYears,
  onSelectPeriod,
  onSelectYear,
}: {
  label: string;
  active: boolean;
  period: PeriodFilter;
  year: number | null;
  availableYears: number[];
  onSelectPeriod: (p: PeriodFilter) => void;
  onSelectYear: (y: number) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 px-4 md:px-5 net-mono text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors shrink-0",
            active
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span className="truncate max-w-[140px] normal-case tracking-[0.06em]">
            {label}
          </span>
          <ChevronDown className="h-3 w-3 opacity-70" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[220px] p-0 border-white/10 bg-[hsl(218_28%_10%)] rounded-xl overflow-hidden"
      >
        <div className="py-1 border-b border-white/[0.08]">
          {PERIODS.map((p) => {
            const active = period === p.v && year === null;
            return (
              <button
                key={p.v}
                type="button"
                onClick={() => {
                  onSelectPeriod(p.v);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center justify-between gap-2 px-3 py-2 text-[13px] text-left transition-colors tracking-[-0.005em]",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
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
            <p className="net-mono px-3 py-1.5 text-[9.5px] uppercase tracking-[0.22em] text-muted-foreground/80 font-semibold">
              Per anno
            </p>
            {availableYears.map((y) => {
              const active = year === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    onSelectYear(y);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center justify-between gap-2 px-3 py-2 net-mono text-[12px] text-left transition-colors tracking-[0.04em]",
                    active
                      ? "bg-primary/10 text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
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
  );
}
