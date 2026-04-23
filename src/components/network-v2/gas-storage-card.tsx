import { Flame, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import type { GasStorageRow } from "@/lib/market/storage-db";

const MONTHS = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function GasStorageCard({
  latest,
  history,
}: {
  latest: GasStorageRow | null;
  history: GasStorageRow[];
}) {
  if (!latest) {
    return (
      <div className="v2-card v2-col-6">
        <div className="v2-card-head flex items-center gap-2">
          <Flame className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-info))" }} />
          <span className="v2-card-title">Stoccaggi gas Italia</span>
        </div>
        <div className="p-5 text-sm text-center" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Dati non ancora disponibili
        </div>
      </div>
    );
  }

  const full = latest.full_pct ?? 0;
  const trend = latest.trend_pct ?? 0;
  const isInjecting = (latest.net_withdrawal_gwh ?? 0) < 0;

  // mini sparkline full_pct
  const values = history
    .map((h) => h.full_pct)
    .filter((v): v is number => v !== null);
  const trendDir = trend > 0 ? "up" : trend < 0 ? "down" : "flat";

  return (
    <div className="v2-card v2-col-6">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-info))" }} />
          <span className="v2-card-title">Stoccaggi gas Italia</span>
        </div>
        <span
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em]"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          AGSI · {fmtDate(latest.gas_day)}
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4">
        {/* Big gauge */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span
              className="v2-mono"
              style={{
                fontSize: 46,
                fontWeight: 700,
                lineHeight: 1,
                color: "hsl(var(--v2-text))",
                letterSpacing: "-0.02em",
              }}
            >
              {full.toFixed(1)}
            </span>
            <span
              className="v2-mono"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "hsl(var(--v2-text-dim))",
              }}
            >
              %
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={`v2-mono inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded`}
              style={{
                color:
                  trendDir === "up"
                    ? "hsl(var(--v2-accent))"
                    : trendDir === "down"
                    ? "hsl(var(--v2-danger))"
                    : "hsl(var(--v2-text-mute))",
                background:
                  trendDir === "up"
                    ? "hsl(var(--v2-accent) / 0.1)"
                    : trendDir === "down"
                    ? "hsl(var(--v2-danger) / 0.1)"
                    : "hsl(var(--v2-border))",
                border: `1px solid ${
                  trendDir === "up"
                    ? "hsl(var(--v2-accent) / 0.3)"
                    : trendDir === "down"
                    ? "hsl(var(--v2-danger) / 0.3)"
                    : "hsl(var(--v2-border-strong))"
                }`,
              }}
            >
              {trendDir === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : trendDir === "down" ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(2)}% 24h
            </span>
          </div>
        </div>

        {/* Bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{
            background: "hsl(var(--v2-bg-elev))",
            border: "1px solid hsl(var(--v2-border))",
          }}
        >
          <div
            style={{
              width: `${Math.min(100, Math.max(0, full))}%`,
              height: "100%",
              background:
                full > 75
                  ? "linear-gradient(to right, hsl(var(--v2-accent)), hsl(var(--v2-accent) / 0.7))"
                  : full > 40
                  ? "linear-gradient(to right, hsl(var(--v2-info)), hsl(var(--v2-accent)))"
                  : "linear-gradient(to right, hsl(var(--v2-warn)), hsl(var(--v2-info)))",
              transition: "width 400ms ease",
            }}
          />
        </div>

        {/* Sparkline */}
        {values.length >= 7 && <MiniSpark values={values} />}

        {/* KPI row */}
        <div className="grid grid-cols-3 gap-3">
          <KPI
            label="In stoccaggio"
            value={latest.gas_in_storage_twh !== null ? `${latest.gas_in_storage_twh.toFixed(1)}` : "—"}
            unit="TWh"
          />
          <KPI
            label={isInjecting ? "Iniezione" : "Prelievo"}
            value={
              isInjecting
                ? latest.injection_gwh !== null
                  ? latest.injection_gwh.toFixed(0)
                  : "—"
                : latest.withdrawal_gwh !== null
                ? latest.withdrawal_gwh.toFixed(0)
                : "—"
            }
            unit="GWh/g"
            accent={isInjecting ? "accent" : "warn"}
          />
          <KPI
            label="Capacità"
            value={
              latest.working_gas_volume_twh !== null
                ? latest.working_gas_volume_twh.toFixed(1)
                : "—"
            }
            unit="TWh"
          />
        </div>

        <p
          className="text-[12px] leading-relaxed"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          Stoccaggi aggregati Italia (Stogit · Edison · IGS). Fonte AGSI+ · Gas
          Infrastructure Europe.
        </p>
      </div>
    </div>
  );
}

function KPI({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: "accent" | "warn";
}) {
  const valueColor =
    accent === "accent"
      ? "hsl(var(--v2-accent))"
      : accent === "warn"
      ? "hsl(var(--v2-warn))"
      : "hsl(var(--v2-text))";
  return (
    <div
      className="rounded-lg p-2.5"
      style={{
        background: "hsl(var(--v2-bg-elev))",
        border: "1px solid hsl(var(--v2-border))",
      }}
    >
      <div
        className="v2-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] mb-1"
        style={{ color: "hsl(var(--v2-text-mute))" }}
      >
        {label}
      </div>
      <div className="flex items-baseline gap-1.5">
        <span
          className="v2-mono"
          style={{
            fontSize: 18,
            fontWeight: 700,
            color: valueColor,
            letterSpacing: "-0.01em",
          }}
        >
          {value}
        </span>
        <span
          className="v2-mono"
          style={{ fontSize: 10, color: "hsl(var(--v2-text-mute))" }}
        >
          {unit}
        </span>
      </div>
    </div>
  );
}

function MiniSpark({ values }: { values: number[] }) {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const w = 600;
  const h = 44;
  const step = w / (values.length - 1);
  const range = max - min || 1;
  const path = values
    .map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
    })
    .join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-10" preserveAspectRatio="none">
        <defs>
          <linearGradient id="storage-spark" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(200 70% 58%)" stopOpacity="0.3" />
            <stop offset="100%" stopColor="hsl(200 70% 58%)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#storage-spark)" />
        <path d={path} fill="none" stroke="hsl(200 70% 65%)" strokeWidth="1.3" />
      </svg>
      <div
        className="v2-mono flex items-center justify-between mt-1"
        style={{ fontSize: 9.5, color: "hsl(var(--v2-text-mute))", letterSpacing: "0.14em", textTransform: "uppercase" }}
      >
        <span>{values.length} giorni · min {min.toFixed(1)}%</span>
        <span>max {max.toFixed(1)}%</span>
      </div>
    </div>
  );
}
