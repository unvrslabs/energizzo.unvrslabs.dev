"use client";

import { useSurveyProgress } from "./progress-context";

// Props retained for backward compatibility; values are ignored.
// The label now reads the current question index + total from context.
export function SectionLabel(_: { index?: number; label?: string }) {
  const { current, total } = useSurveyProgress();
  if (total === 0) return null;
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="section-pill">
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(158_64%_42%)]" />
        Domanda {current}/{total}
      </span>
    </div>
  );
}
