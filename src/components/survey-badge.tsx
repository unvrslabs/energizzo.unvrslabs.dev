"use client";

import { cn } from "@/lib/utils";
import { SURVEY_STATUS_CONFIG, type SurveyStatus } from "@/lib/survey-questions";

export function SurveyBadge({ status, className }: { status: SurveyStatus; className?: string }) {
  const cfg = SURVEY_STATUS_CONFIG[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-medium whitespace-nowrap",
        cfg.color,
        className,
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ backgroundColor: cfg.dot }} />
      {cfg.label}
    </span>
  );
}
