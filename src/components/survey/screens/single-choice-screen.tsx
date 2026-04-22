"use client";

import { useEffect } from "react";
import { AlertCircle, Check } from "lucide-react";
import type { SingleChoiceScreen as S } from "@/lib/survey/survey-config";
import { cn, keyFor } from "@/lib/utils";
import { SectionLabel } from "../section-label";

export function SingleChoiceScreen({
  screen,
  value,
  onChange,
  error,
}: {
  screen: S;
  value: string | null;
  onChange: (v: string) => void;
  error: string | null;
}) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toUpperCase();
      const idx = "ABCDEFGHIJKL".indexOf(k);
      if (idx >= 0 && idx < screen.options.length) {
        e.preventDefault();
        onChange(screen.options[idx]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen.options, onChange]);

  return (
    <div className="space-y-5 sm:space-y-7">
      {screen.section && <SectionLabel index={screen.section.index} label={screen.section.label} />}
      <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
        {screen.title}
      </h2>
      {screen.description && (
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">{screen.description}</p>
      )}

      <div className="flex flex-col gap-2.5 pt-2">
        {screen.options.map((opt, i) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={cn("choice-row", active && "active")}
            >
              <span className="choice-key">{keyFor(i)}</span>
              <span className="flex-1">{opt}</span>
              {active && <Check className="h-4 w-4 text-primary shrink-0" />}
            </button>
          );
        })}
      </div>

      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
    </div>
  );
}
