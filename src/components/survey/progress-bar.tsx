"use client";

export function ProgressBar({ value }: { value: number }) {
  const pct = Math.min(100, Math.max(0, value * 100));
  return (
    <div className="se-progress-bar">
      <div className="se-progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}
