"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Anima un numero da 0 (o `from`) a `value` con easing easeOutCubic.
 * Si attiva una sola volta quando entra nel viewport (IntersectionObserver).
 *
 * Per numeri decimali passa `decimals`. Locale italiano per separatori.
 */
export function CountUp({
  value,
  from = 0,
  duration = 900,
  decimals = 0,
  prefix = "",
  suffix = "",
  className,
  style,
}: {
  value: number;
  from?: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState<number>(from);
  const ref = useRef<HTMLSpanElement | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      runAnimation();
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !fired.current) {
          fired.current = true;
          runAnimation();
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  function runAnimation() {
    const start = performance.now();
    const delta = value - from;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(from + delta * eased);
      if (t < 1) requestAnimationFrame(tick);
      else setDisplay(value);
    };
    requestAnimationFrame(tick);
  }

  const formatted = display.toLocaleString("it-IT", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  return (
    <span ref={ref} className={className} style={style}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}
