"use client";

import { useEffect } from "react";
import { AlertCircle, ArrowRight, Check } from "lucide-react";
import type { MultiChoiceScreen as M } from "@/lib/survey/survey-config";
import { cn, keyFor } from "@/lib/utils";
import { SectionLabel } from "../section-label";

export function MultiChoiceScreen({
  screen,
  value,
  onChange,
  onNext,
  error,
}: {
  screen: M;
  value: string[];
  onChange: (v: string[]) => void;
  onNext: () => void;
  error: string | null;
}) {
  function toggle(opt: string) {
    const active = value.includes(opt);
    if (active) {
      onChange(value.filter((x) => x !== opt));
    } else {
      if (screen.maxSelections && value.length >= screen.maxSelections) return;
      onChange([...value, opt]);
    }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const k = e.key.toUpperCase();
      const idx = "ABCDEFGHIJKL".indexOf(k);
      if (idx >= 0 && idx < screen.options.length) {
        e.preventDefault();
        toggle(screen.options[idx]);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, screen.options]);

  return (
    <div className="space-y-7">
      {screen.section && <SectionLabel index={screen.section.index} label={screen.section.label} />}
      <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
        {screen.title}
        {screen.required && <span className="text-primary ml-1">*</span>}
      </h2>
      {screen.description && (
        <p className="text-muted-foreground max-w-2xl text-base leading-relaxed">{screen.description}</p>
      )}
      {screen.maxSelections && (
        <p className="text-xs font-mono text-muted-foreground">
          {value.length}/{screen.maxSelections} selezionate
        </p>
      )}

      <div className="flex flex-col gap-2.5 pt-2">
        {screen.options.map((opt, i) => {
          const active = value.includes(opt);
          const disabled =
            !active && screen.maxSelections !== undefined && value.length >= screen.maxSelections;
          return (
            <button
              key={opt}
              type="button"
              disabled={disabled}
              onClick={() => toggle(opt)}
              className={cn(
                "choice-row",
                active && "active",
                disabled && "opacity-40 cursor-not-allowed",
              )}
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

      <button onClick={onNext} className="btn-premium">
        OK
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
