"use client";

import { useSurveyProgress } from "./progress-context";

function toRoman(num: number): string {
  const romans: [number, string][] = [
    [50, "L"], [40, "XL"], [10, "X"], [9, "IX"],
    [5, "V"], [4, "IV"], [1, "I"],
  ];
  let n = num;
  let result = "";
  for (const [v, s] of romans) {
    while (n >= v) {
      result += s;
      n -= v;
    }
  }
  return result;
}

export function SectionLabel(_: { index?: number; label?: string }) {
  const { current, total } = useSurveyProgress();
  if (total === 0) return null;
  return (
    <div className="mb-8 flex items-center gap-3">
      <span className="section-pill">
        Domanda {toRoman(current)} / {toRoman(total)}
      </span>
    </div>
  );
}
