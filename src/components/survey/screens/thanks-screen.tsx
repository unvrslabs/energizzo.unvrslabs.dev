"use client";

import { ArrowRight, CheckCircle2 } from "lucide-react";
import type { ThanksScreen as T } from "@/lib/survey/survey-config";

export function ThanksScreen({ screen }: { screen: T }) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div
        className="inline-flex h-20 w-20 items-center justify-center rounded-full animate-pulse-glow"
        style={{
          background: "linear-gradient(135deg, hsl(158 64% 42% / 0.25), hsl(160 70% 36% / 0.15))",
          border: "1px solid hsl(158 64% 42% / 0.5)",
        }}
      >
        <CheckCircle2 className="h-10 w-10 text-primary" strokeWidth={2} />
      </div>
      <h1 className="font-display text-5xl sm:text-6xl font-bold leading-[1.05] tracking-tight">
        <span className="gradient-text">{screen.title}</span>
      </h1>
      <div className="space-y-4 text-base sm:text-lg text-muted-foreground max-w-xl leading-relaxed">
        {screen.description.split("\n\n").map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>
      <a href={screen.buttonHref} className="btn-premium text-base">
        {screen.buttonText}
        <ArrowRight className="h-4 w-4" />
      </a>
    </div>
  );
}
