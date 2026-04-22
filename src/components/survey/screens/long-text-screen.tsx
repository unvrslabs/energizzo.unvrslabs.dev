"use client";

import { useEffect, useRef } from "react";
import { ArrowRight, AlertCircle } from "lucide-react";
import type { LongTextScreen as L } from "@/lib/survey/survey-config";
import { SectionLabel } from "../section-label";

export function LongTextScreen({
  screen,
  value,
  onChange,
  onNext,
  error,
}: {
  screen: L;
  value: string;
  onChange: (v: string) => void;
  onNext: () => void;
  error: string | null;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    ref.current?.focus();
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
      <textarea
        ref={ref}
        rows={3}
        maxLength={screen.maxLength}
        placeholder={screen.placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
            e.preventDefault();
            onNext();
          }
        }}
        className="w-full bg-transparent border-0 border-b-2 border-border focus:border-primary text-xl sm:text-2xl py-3 placeholder:text-muted-foreground/40 resize-none transition-colors"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        {screen.maxLength && (
          <span>{value.length} / {screen.maxLength}</span>
        )}
        <span>
          <kbd>⌘ + Invio</kbd> per avanzare
        </span>
      </div>
      {error && (
        <p className="text-sm text-red-400 flex items-center gap-1.5">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </p>
      )}
      <button onClick={onNext} className="btn-premium">
        {screen.required ? "OK" : value ? "OK" : "Salta"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
