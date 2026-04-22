"use client";

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-background/60 z-50 overflow-hidden">
      <div
        className="h-full transition-[width] duration-700 ease-out"
        style={{
          width: `${pct}%`,
          background:
            "linear-gradient(90deg, hsl(158 64% 42%) 0%, hsl(160 70% 48%) 50%, hsl(158 64% 42%) 100%)",
          boxShadow:
            "0 0 12px hsl(158 64% 42% / 0.6), 0 0 24px hsl(158 64% 42% / 0.3)",
        }}
      />
    </div>
  );
}
