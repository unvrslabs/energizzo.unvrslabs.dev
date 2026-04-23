import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { MARKET_SNAPSHOT } from "@/lib/delibere/mock";
import { cn } from "@/lib/utils";

export function V2TickerRow() {
  return (
    <div className="v2-ticker-row">
      {MARKET_SNAPSHOT.map((m) => (
        <div key={m.code} className="v2-ticker-cell">
          <div className="v2-ticker-head">
            <span className="v2-ticker-code">{m.code}</span>
            <Delta value={m.delta} trend={m.trend} />
          </div>
          <div>
            <span className="v2-ticker-value">{m.value}</span>
            <span className="v2-ticker-unit">{m.unit}</span>
          </div>
          <span className="v2-ticker-label">{m.label}</span>
        </div>
      ))}
    </div>
  );
}

function Delta({ value, trend }: { value: string; trend: "up" | "down" | "flat" }) {
  const Icon = trend === "up" ? ArrowUpRight : trend === "down" ? ArrowDownRight : Minus;
  return (
    <span
      className={cn(
        "v2-delta",
        trend === "up" && "v2-delta--up",
        trend === "down" && "v2-delta--down",
        trend === "flat" && "v2-delta--flat",
      )}
    >
      <Icon className="w-3 h-3" />
      {value}
    </span>
  );
}
