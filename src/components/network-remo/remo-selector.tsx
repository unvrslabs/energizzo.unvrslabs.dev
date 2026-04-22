"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Flame, Zap, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RemoCategory, RemoReportMeta } from "@/lib/remo/types";

const MONTH_NAMES = [
  "Gennaio",
  "Febbraio",
  "Marzo",
  "Aprile",
  "Maggio",
  "Giugno",
  "Luglio",
  "Agosto",
  "Settembre",
  "Ottobre",
  "Novembre",
  "Dicembre",
];

function monthLabel(month: string) {
  const d = new Date(month + "T00:00:00Z");
  return `${MONTH_NAMES[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function RemoSelector({
  category,
  month,
  reports,
}: {
  category: RemoCategory;
  month: string;
  reports: RemoReportMeta[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const monthsForCategory = Array.from(
    new Set(reports.filter((r) => r.category === category).map((r) => r.month)),
  ).sort((a, b) => b.localeCompare(a));

  function navigate(nextCategory: RemoCategory, nextMonth: string) {
    const validMonths = Array.from(
      new Set(
        reports.filter((r) => r.category === nextCategory).map((r) => r.month),
      ),
    ).sort((a, b) => b.localeCompare(a));
    const resolvedMonth = validMonths.includes(nextMonth)
      ? nextMonth
      : validMonths[0] ?? nextMonth;
    const params = new URLSearchParams();
    params.set("cat", nextCategory);
    params.set("month", resolvedMonth);
    startTransition(() => {
      router.replace(`/network/price-engine?${params.toString()}`, {
        scroll: false,
      });
    });
  }

  return (
    <div className="liquid-glass-nav rounded-[1.75rem] p-2 flex items-center gap-2 flex-wrap">
      <div className="flex items-center gap-1 flex-1 min-w-0">
        <CategoryPill
          active={category === "luce"}
          onClick={() => navigate("luce", month)}
          icon={Zap}
          label="Energia"
          activeColor="text-amber-300"
        />
        <CategoryPill
          active={category === "gas"}
          onClick={() => navigate("gas", month)}
          icon={Flame}
          label="Gas"
          activeColor="text-sky-300"
        />
      </div>

      <div aria-hidden className="w-px h-6 bg-white/10 hidden sm:block" />

      <div className="relative">
        <select
          value={month}
          onChange={(e) => navigate(category, e.target.value)}
          className="appearance-none rounded-full border border-white/10 bg-white/[0.04] pl-4 pr-9 py-1.5 text-xs font-semibold text-foreground outline-none hover:border-white/25 cursor-pointer min-w-[160px]"
        >
          {monthsForCategory.length === 0 ? (
            <option value="" disabled>
              Nessun report
            </option>
          ) : (
            monthsForCategory.map((m) => (
              <option key={m} value={m}>
                {monthLabel(m)}
              </option>
            ))
          )}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
      </div>

      {pending && (
        <Loader2 className="h-4 w-4 text-primary animate-spin" aria-label="Caricamento" />
      )}
    </div>
  );
}

function CategoryPill({
  active,
  onClick,
  icon: Icon,
  label,
  activeColor,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  activeColor: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all",
        active
          ? "bg-primary/15 text-primary border border-primary shadow-sm shadow-primary/20"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5 border border-transparent",
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", active ? "text-primary" : activeColor)} />
      {label}
    </button>
  );
}
