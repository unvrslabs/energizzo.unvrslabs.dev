"use client";

import { useEffect, useRef, useState } from "react";

interface StatCounterProps {
  /** The final numeric value to count up to. */
  value: number;
  /** Text that appears before the number (e.g. "€"). */
  prefix?: string;
  /** Text that appears after the number (e.g. "%", "M", "/MWh"). */
  suffix?: string;
  /** Caption shown below the number. */
  label: string;
  /** Duration of the count-up animation in ms. */
  duration?: number;
  /** Decimal places to display. */
  decimals?: number;
}

/**
 * StatCounter — animated counter card.
 * Starts counting when it scrolls into view (IntersectionObserver).
 */
export function StatCounter({
  value,
  prefix = "",
  suffix = "",
  label,
  duration = 1800,
  decimals = 0,
}: StatCounterProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (!ref.current) return;
    const node = ref.current;

    const run = () => {
      if (started.current) return;
      started.current = true;

      const start = performance.now();
      const from = 0;
      const to = value;

      const tick = (now: number) => {
        const elapsed = now - start;
        const t = Math.min(elapsed / duration, 1);
        // easeOutCubic
        const eased = 1 - Math.pow(1 - t, 3);
        setDisplay(from + (to - from) * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            io.disconnect();
          }
        });
      },
      { threshold: 0.3 }
    );
    io.observe(node);
    return () => io.disconnect();
  }, [value, duration]);

  const formatted =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString("it-IT");

  return (
    <div
      ref={ref}
      className="liquid-glass-card p-5 sm:p-6 flex flex-col gap-2 animate-fade-in-up"
    >
      <div className="font-display text-3xl sm:text-4xl font-black tracking-tight">
        <span className="gradient-text">
          {prefix}
          {formatted}
          {suffix}
        </span>
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground leading-snug">
        {label}
      </p>
    </div>
  );
}
