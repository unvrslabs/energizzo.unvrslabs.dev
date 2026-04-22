"use client";

import { ArrowRight } from "lucide-react";
import type { StatementScreen as S } from "@/lib/survey/survey-config";
import { SectionLabel } from "../section-label";

export function StatementScreen({ screen, onNext }: { screen: S; onNext: () => void }) {
  return (
    <div className="space-y-6">
      {screen.section && <SectionLabel index={screen.section.index} label={screen.section.label} />}
      <h2 className="font-display text-3xl sm:text-5xl font-bold leading-[1.1] tracking-tight">
        {screen.title}
      </h2>
      <p className="text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed whitespace-pre-line">
        {screen.description}
      </p>
      <button onClick={onNext} className="btn-premium mt-4">
        {screen.buttonText ?? "Continua"}
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
