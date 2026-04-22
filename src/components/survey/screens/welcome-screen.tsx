"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import type { WelcomeScreen as W } from "@/lib/survey/survey-config";

export function WelcomeScreen({ screen, onNext }: { screen: W; onNext: () => void }) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="section-pill">
        <Sparkles className="h-3 w-3" />
        Energizzo · Report 2026
      </div>
      <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
        <span className="gradient-text">{screen.title}</span>
      </h1>
      <div className="space-y-4 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
        {screen.description.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-5 pt-2">
        <button onClick={onNext} className="btn-premium text-base">
          {screen.buttonText}
          <ArrowRight className="h-4 w-4" />
        </button>
        <span className="text-xs text-muted-foreground">
          premi <kbd>Invio</kbd> ↵
        </span>
      </div>
    </div>
  );
}
