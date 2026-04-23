type Trend = "up" | "down" | "flat";
interface Item {
  code: string;
  value: string;
  unit: string;
  trend: Trend;
  delta: string;
}

const ITEMS: Item[] = [
  { code: "PUN", value: "143,40", unit: "€/MWh", trend: "up", delta: "+25,3%" },
  { code: "PSV", value: "0,5577", unit: "€/Smc", trend: "up", delta: "+48,0%" },
  { code: "TTF", value: "14,74", unit: "€/GJ", trend: "up", delta: "+4,1%" },
  { code: "CMEM", value: "14,478", unit: "€/GJ", trend: "up", delta: "+5,2%" },
  { code: "CCR", value: "0,0315", unit: "€/Smc", trend: "up", delta: "+17,9%" },
  { code: "QVD", value: "4,62", unit: "€/mese", trend: "down", delta: "−3,5%" },
  { code: "CDISP", value: "0,01553", unit: "€/kWh", trend: "down", delta: "−5,9%" },
  { code: "PSBIL", value: "0,5803", unit: "€/Smc", trend: "up", delta: "+53,0%" },
  { code: "ASOS", value: "0,02866", unit: "€/kWh", trend: "flat", delta: "0,0%" },
  { code: "F1 PEAK", value: "143,02", unit: "€/MWh", trend: "up", delta: "+16,9%" },
  { code: "F3 OFF", value: "138,09", unit: "€/MWh", trend: "up", delta: "+31,2%" },
];

export function TickerBarV2() {
  const doubled = [...ITEMS, ...ITEMS];
  return (
    <div className="lv2-ticker-bar" aria-label="Indicatori di mercato energetico">
      <div className="lv2-ticker-track">
        {doubled.map((it, i) => (
          <span key={`${it.code}-${i}`} className="lv2-ticker-pill">
            <span className="lv2-ticker-code">{it.code}</span>
            <span className="lv2-ticker-value">{it.value}</span>
            <span style={{ color: "hsl(var(--lv2-text-mute))", fontSize: "11px" }}>
              {it.unit}
            </span>
            <span className={`lv2-ticker-delta--${it.trend}`}>{it.delta}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
