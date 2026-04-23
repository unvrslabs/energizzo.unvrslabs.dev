import { getLatestPun, listPunHistory } from "@/lib/market/power-pun-db";
import { getLatestGasStorage, listGasStorageHistory } from "@/lib/market/storage-db";

type Trend = "up" | "down" | "flat";
interface Item {
  code: string;
  value: string;
  unit: string;
  trend: Trend;
  delta: string;
}

function formatDelta(pct: number | null): { delta: string; trend: Trend } {
  if (pct == null || !isFinite(pct)) return { delta: "—", trend: "flat" };
  const sign = pct > 0 ? "+" : "";
  if (Math.abs(pct) < 0.05) return { delta: "0,0%", trend: "flat" };
  return {
    delta: `${sign}${pct.toFixed(1).replace(".", ",")}%`,
    trend: pct > 0 ? "up" : "down",
  };
}

function fallbackItems(): Item[] {
  return [
    { code: "PUN", value: "—", unit: "€/MWh", trend: "flat", delta: "—" },
    { code: "GAS · STOCK", value: "—", unit: "%", trend: "flat", delta: "—" },
    { code: "PSV", value: "n/d", unit: "€/Smc", trend: "flat", delta: "in sync" },
    { code: "TTF", value: "n/d", unit: "€/MWh", trend: "flat", delta: "in sync" },
  ];
}

async function buildItems(): Promise<Item[]> {
  try {
    const [punLatest, punHistory, gasLatest, gasHistory] = await Promise.all([
      getLatestPun(),
      listPunHistory(10),
      getLatestGasStorage(),
      listGasStorageHistory(10),
    ]);

    const items: Item[] = [];

    if (punLatest) {
      const cur = Number(punLatest.price_eur_mwh);
      const weekAgo = punHistory.find((r) => {
        const diff =
          (new Date(punLatest.price_day).getTime() -
            new Date(r.price_day).getTime()) /
          86400000;
        return diff >= 6.5 && diff <= 8;
      });
      const pct =
        weekAgo && Number(weekAgo.price_eur_mwh) > 0
          ? ((cur - Number(weekAgo.price_eur_mwh)) /
              Number(weekAgo.price_eur_mwh)) *
            100
          : null;
      const d = formatDelta(pct);
      items.push({
        code: "PUN",
        value: cur.toFixed(1).replace(".", ","),
        unit: "€/MWh",
        trend: d.trend,
        delta: d.delta,
      });
    }

    if (gasLatest && gasLatest.full_pct != null) {
      const cur = Number(gasLatest.full_pct);
      const weekAgo = gasHistory.find((r) => {
        const diff =
          (new Date(gasLatest.gas_day).getTime() -
            new Date(r.gas_day).getTime()) /
          86400000;
        return diff >= 6.5 && diff <= 8;
      });
      const deltaPp =
        weekAgo && weekAgo.full_pct != null
          ? cur - Number(weekAgo.full_pct)
          : null;
      const trend: Trend =
        deltaPp == null || Math.abs(deltaPp) < 0.05
          ? "flat"
          : deltaPp > 0
            ? "up"
            : "down";
      items.push({
        code: "GAS · STOCK",
        value: cur.toFixed(1).replace(".", ","),
        unit: "%",
        trend,
        delta:
          deltaPp == null
            ? "—"
            : `${deltaPp >= 0 ? "+" : ""}${deltaPp.toFixed(1).replace(".", ",")}pp 7g`,
      });
    }

    items.push({
      code: "PSV",
      value: "n/d",
      unit: "€/Smc",
      trend: "flat",
      delta: "in sync",
    });
    items.push({
      code: "TTF",
      value: "n/d",
      unit: "€/MWh",
      trend: "flat",
      delta: "in sync",
    });

    return items.length > 0 ? items : fallbackItems();
  } catch {
    return fallbackItems();
  }
}

export async function TickerBarV2() {
  const items = await buildItems();
  const doubled = [...items, ...items, ...items]; // triplo per scroll fluido
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
