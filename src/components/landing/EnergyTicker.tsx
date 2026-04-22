import { Activity, ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

type Trend = "up" | "down" | "flat";

interface TickerItem {
  code: string;
  value: string;
  unit: string;
  trend: Trend;
  delta: string;
}

const ITEMS: TickerItem[] = [
  { code: "PUN", value: "143,40", unit: "€/MWh", trend: "up", delta: "+25,3%" },
  { code: "PSV", value: "0,5577", unit: "€/Smc", trend: "up", delta: "+48,0%" },
  { code: "TTF", value: "14,74", unit: "€/GJ", trend: "up", delta: "+4,1%" },
  { code: "CMEM", value: "14,478", unit: "€/GJ", trend: "up", delta: "+5,2%" },
  { code: "CCR", value: "0,0315", unit: "€/Smc", trend: "up", delta: "+17,9%" },
  { code: "QVD", value: "4,62", unit: "€/mese", trend: "down", delta: "-3,5%" },
  { code: "CDISP", value: "0,01553", unit: "€/kWh", trend: "down", delta: "-5,9%" },
  { code: "PSbil", value: "0,5803", unit: "€/Smc", trend: "up", delta: "+53,0%" },
  { code: "ASOS dom", value: "0,02866", unit: "€/kWh", trend: "flat", delta: "0,0%" },
  { code: "Accisa", value: "0,0125", unit: "€/kWh", trend: "flat", delta: "0,0%" },
  { code: "F1 peak", value: "143,02", unit: "€/MWh", trend: "up", delta: "+16,9%" },
  { code: "F3 off", value: "138,09", unit: "€/MWh", trend: "up", delta: "+31,2%" },
  { code: "Omega N-O", value: "11,89", unit: "€/MWh", trend: "flat", delta: "+0,1%" },
];

function TrendIcon({ trend }: { trend: Trend }) {
  if (trend === "up") return <ArrowUpRight className="h-3 w-3" />;
  if (trend === "down") return <ArrowDownRight className="h-3 w-3" />;
  return <Minus className="h-3 w-3" />;
}

function TickerPill({ item }: { item: TickerItem }) {
  return (
    <div className="ticker-pill">
      <span className="ticker-pill__code">{item.code}</span>
      <span className="ticker-pill__value">{item.value}</span>
      <span className="ticker-pill__unit">{item.unit}</span>
      <span
        className={`ticker-pill__delta ticker-pill__delta--${item.trend}`}
      >
        <TrendIcon trend={item.trend} />
        {item.delta}
      </span>
    </div>
  );
}

export function EnergyTicker() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div
      className="relative w-full border-y border-white/5 bg-white/[0.015]"
      aria-label="Indici di mercato energetico in tempo reale"
    >
      <div className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none z-10 bg-gradient-to-r from-[hsl(218_48%_10%)] to-transparent" />
      <div className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none z-10 bg-gradient-to-l from-[hsl(218_48%_10%)] to-transparent" />

      <div className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 items-center gap-2 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md px-3 py-1">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <Activity className="h-3 w-3 text-primary" />
        <span className="text-[10px] font-bold tracking-[0.15em] uppercase text-primary">
          Live market
        </span>
      </div>

      <div className="py-3 overflow-hidden">
        <div className="ticker-track">
          {doubled.map((item, i) => (
            <TickerPill key={`${item.code}-${i}`} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
}
