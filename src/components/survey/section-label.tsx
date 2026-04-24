"use client";

import { useSurveyProgress } from "./progress-context";

export function SectionLabel(_: { index?: number; label?: string }) {
  const { current, total } = useSurveyProgress();
  if (total === 0) return null;
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="section-pill">
        Domanda {current} / {total}
      </span>
    </div>
  );
}
