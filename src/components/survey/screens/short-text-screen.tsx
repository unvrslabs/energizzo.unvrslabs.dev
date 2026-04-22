"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import type { ShortTextScreen as S } from "@/lib/survey/survey-config";
import { SectionLabel } from "../section-label";

export function ShortTextScreen({
  screen,
  value,
  onChange,
  onNext,
  error,
}: {
  screen: S;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  error: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    inputRef.current?.focus();
  }, [screen.id]);

  return (
    <div className="space-y-7">
      {screen.section && <SectionLabel index={screen.section.index} label={screen.section.label} />}
      <h2 className="font-display text-2xl sm:text-4xl font-bold leading-tight tracking-tight">
        {screen.title}
      </h2>
      {screen.description && (
        <p className="text-muted-foreground text-base">{screen.description}</p>
      )}
      <input
        ref={inputRef}
        type="text"
        className="underline-input"
        placeholder={screen.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            e.preventDefault();
            onNext();
          }
        }}
      />
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button onClick={onNext} className="btn-premium">
          OK
          <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground">
          premi <kbd>Invio</kbd> ↵
        </span>
      </div>
    </div>
  );
}
