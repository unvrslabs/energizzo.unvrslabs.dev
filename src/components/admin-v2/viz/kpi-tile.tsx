import { CountUp } from "./count-up";
import { Sparkline } from "./sparkline";

type Variant = "accent" | "info" | "warn" | "danger";
type Trend = "up" | "down" | "flat";

/**
 * KPI tile: valore grande + label + delta + sparkline opzionale.
 * Combina CountUp (anima il numero al mount) con Sparkline trend mini-chart.
 *
 * Dimensione tile pensata per griglia 4 colonne su desktop (col-3 in v2-bento).
 */
export function KpiTile({
  code,
  label,
  value,
  decimals = 0,
  prefix = "",
  suffix = "",
  delta,
  trend = "flat",
  spark,
  variant = "accent",
  icon,
}: {
  code: string;
  label: string;
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  delta?: string;
  trend?: Trend;
  spark?: number[];
  variant?: Variant;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className="v2-card"
      style={{
        padding: "16px 18px",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Glow accent in alto a sx */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          top: -28,
          left: -28,
          width: 110,
          height: 110,
          borderRadius: "50%",
          background: `radial-gradient(circle, hsl(var(--v2-${variant}) / 0.16), transparent 60%)`,
          filter: "blur(8px)",
          pointerEvents: "none",
        }}
      />
      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          {icon && (
            <span
              style={{
                width: 24,
                height: 24,
                borderRadius: 6,
                display: "grid",
                placeItems: "center",
                background: `hsl(var(--v2-${variant}) / 0.14)`,
                color: `hsl(var(--v2-${variant}))`,
                flexShrink: 0,
              }}
            >
              {icon}
            </span>
          )}
          <span
            className="v2-ticker-code"
            style={{
              fontSize: 10.5,
              letterSpacing: "0.16em",
              color: "hsl(var(--v2-text-dim))",
            }}
          >
            {code}
          </span>
        </div>
        {delta && (
          <span className={`v2-delta v2-delta--${trend}`} style={{ fontSize: 10.5 }}>
            {delta}
          </span>
        )}
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontFamily: "var(--font-mono), monospace",
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: "-0.02em",
              color: "hsl(var(--v2-text))",
              lineHeight: 1,
            }}
          >
            <CountUp
              value={value}
              decimals={decimals}
              prefix={prefix}
              suffix={suffix}
            />
          </div>
          <div
            style={{
              fontSize: 11.5,
              color: "hsl(var(--v2-text-mute))",
              marginTop: 6,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {label}
          </div>
        </div>
        {spark && spark.length > 1 && (
          <div style={{ flexShrink: 0 }}>
            <Sparkline data={spark} variant={variant} width={92} height={36} />
          </div>
        )}
      </div>
    </div>
  );
}
