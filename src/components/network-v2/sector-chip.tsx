import type { DeliberaSector } from "@/lib/delibere/mock";
import { cn } from "@/lib/utils";

const LABEL: Record<DeliberaSector, string> = {
  eel: "EEL",
  gas: "GAS",
};

export function V2SectorChip({ sector }: { sector: DeliberaSector }) {
  return (
    <span
      className={cn(
        "v2-chip",
        sector === "eel" && "v2-chip--eel",
        sector === "gas" && "v2-chip--gas",
      )}
    >
      {LABEL[sector]}
    </span>
  );
}
