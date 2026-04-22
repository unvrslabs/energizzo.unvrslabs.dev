"use client";

import { useMemo, useState } from "react";
import { BookOpen, Filter, Zap, Flame, Layers } from "lucide-react";
import { cn } from "@/lib/utils";
import { DELIBERE, type Delibera, type DeliberaSector } from "@/lib/delibere/mock";
import { DeliberaCard } from "./delibera-card";
import { DeliberaChatDialog } from "./delibera-chat-dialog";

type Filter = "all" | "eel" | "gas";

const FILTERS: { v: Filter; label: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { v: "all", label: "Tutte", icon: Layers, color: "text-muted-foreground" },
  { v: "eel", label: "Energia", icon: Zap, color: "text-amber-300" },
  { v: "gas", label: "Gas", icon: Flame, color: "text-sky-300" },
];

function sortByDateDesc<T extends { date: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export function DelibereList() {
  const [filter, setFilter] = useState<Filter>("all");
  const [chatOpen, setChatOpen] = useState(false);
  const [selected, setSelected] = useState<Delibera | null>(null);

  const visible = useMemo(() => {
    const base =
      filter === "all"
        ? DELIBERE
        : DELIBERE.filter((d) => (d.sectors as DeliberaSector[]).includes(filter));
    return sortByDateDesc(base);
  }, [filter]);

  const counts = useMemo(
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

  return (
    <div className="space-y-6">
      <header className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 border border-primary/30 text-primary">
            <BookOpen className="h-4 w-4" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              Delibere ARERA
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Ogni delibera ARERA letta dall&apos;AI, in italiano operativo.
              Bullet point, allegati, link originale e agente dedicato su ogni
              card.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-semibold">
            <Filter className="h-3 w-3" />
            Filtra
          </span>
          {FILTERS.map((f) => {
            const active = filter === f.v;
            const Icon = f.icon;
            const count = counts[f.v];
            return (
              <button
                key={f.v}
                type="button"
                onClick={() => setFilter(f.v)}
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
        </div>
      </header>

      {visible.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-10 text-center">
          <p className="text-sm text-muted-foreground">
            Nessuna delibera nel filtro corrente.
          </p>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto flex flex-col gap-4 sm:gap-5">
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
