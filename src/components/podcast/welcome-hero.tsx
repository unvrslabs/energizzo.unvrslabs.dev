"use client";

import { useMemo } from "react";

const EMOJI = ["🎉", "🎊", "🏆", "✨", "🎙️", "⭐", "🎈", "🥳"];

export function WelcomeHero() {
  // Deterministic positions so we don't get hydration mismatches.
  const confetti = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const seed = (i * 2654435761) % 1000 / 1000;
        const seed2 = (i * 1597 + 31) % 1000 / 1000;
        const seed3 = (i * 7919 + 13) % 1000 / 1000;
        return {
          emoji: EMOJI[i % EMOJI.length],
          left: `${5 + seed * 90}%`,
          top: `${5 + seed2 * 80}%`,
          delay: `${-(seed3 * 2).toFixed(2)}s`,
          rotate: `${(seed3 - 0.5) * 60}deg`,
          size: 0.8 + seed * 0.6,
        };
      }),
    [],
  );

  return (
    <header className="relative liquid-glass rounded-[1.5rem] p-10 text-center space-y-4 overflow-hidden bg-gradient-to-br from-emerald-500/10 via-amber-400/10 to-emerald-500/10">
      {/* background confetti layer */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {confetti.map((c, i) => (
          <span
            key={i}
            className="absolute animate-bounce opacity-50"
            style={{
              left: c.left,
              top: c.top,
              animationDelay: c.delay,
              animationDuration: "2.4s",
              transform: `rotate(${c.rotate}) scale(${c.size})`,
              fontSize: "1.25rem",
            }}
          >
            {c.emoji}
          </span>
        ))}
      </div>

      {/* content */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 text-primary px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-bold">
          🏆 Ospite selezionato
        </div>
        <h1 className="font-display text-3xl md:text-5xl tracking-tight">
          Complimenti! 🎉
        </h1>
        <p className="text-base md:text-lg font-semibold">
          Sei stato selezionato per partecipare al podcast{" "}
          <span className="text-primary">&quot;Il Reseller&quot;</span>.
        </p>
      </div>
    </header>
  );
}
