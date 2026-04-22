"use client";

import { ArrowDown, ArrowRight, ArrowUp, AlertCircle } from "lucide-react";
import type { RankingScreen as R } from "@/lib/survey/survey-config";
import { SectionLabel } from "../section-label";

export function RankingScreen({
  screen,
  value,
  onChange,
  onNext,
  error,
}: {
  screen: R;
  value: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
  error: string | null;
}) {
  const items = value.length === screen.options.length ? value : screen.options;

  function move(i: number, delta: number) {
    const j = i + delta;
    if (j < 0 || j >= items.length) return;
    const next = items.slice();
    const tmp = next[i];
    next[i] = next[j];
    next[j] = tmp;
    onChange(next);
  }

  return (
    <div className="space-y-5 sm:space-y-7">
      {screen.section && <SectionLabel index={screen.section.index} label={screen.section.label} />}
      <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
        {screen.title}
      </h2>
      {screen.description && (
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">{screen.description}</p>
      )}

      <ol className="flex flex-col gap-2.5 pt-2">
        {items.map((opt, i) => (
          <li
            key={opt}
            className="flex items-center gap-3 rounded-[0.875rem] border border-border bg-card/40 backdrop-blur px-4 py-3.5 transition-all hover:border-primary/40"
          >
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 border border-primary/30 text-primary font-mono text-sm font-bold">
              {i + 1}
            </span>
            <span className="flex-1 text-sm sm:text-base">{opt}</span>
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={() => move(i, -1)}
                disabled={i === 0}
                className="p-1 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors disabled:opacity-25 disabled:hover:text-muted-foreground disabled:hover:border-border"
                aria-label="Sposta su"
              >
                <ArrowUp className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === items.length - 1}
                className="p-1 rounded-md border border-border text-muted-foreground hover:text-primary hover:border-primary transition-colors disabled:opacity-25 disabled:hover:text-muted-foreground disabled:hover:border-border"
                aria-label="Sposta giù"
              >
                <ArrowDown className="h-3.5 w-3.5" />
              </button>
            </div>
          </li>
        ))}
      </ol>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}

      <button onClick={onNext} className="btn-premium">
        OK
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
