/**
 * Progress ring SVG: cerchio percentuale con label centrale.
 * Animato via CSS transition su strokeDashoffset (auto al primo render).
 */

type Variant = "accent" | "info" | "warn" | "danger";

const COLORS: Record<Variant, string> = {
  accent: "hsl(var(--v2-accent))",
  info: "hsl(var(--v2-info))",
  warn: "hsl(var(--v2-warn))",
  danger: "hsl(var(--v2-danger))",
};

export function ProgressRing({
  value,
  total,
  size = 96,
  thickness = 9,
  variant = "accent",
  label,
  showPercent = true,
}: {
  value: number;
  total: number;
  size?: number;
  thickness?: number;
  variant?: Variant;
  label?: string;
  showPercent?: boolean;
}) {
  const safeTotal = total > 0 ? total : 1;
  const pct = Math.min(100, Math.max(0, (value / safeTotal) * 100));
  const r = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;
  const color = COLORS[variant];

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 6,
      }}
    >
      <div style={{ position: "relative", width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          style={{ transform: "rotate(-90deg)" }}
          role="img"
          aria-label={`${pct.toFixed(0)} percento`}
        >
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke="hsl(var(--v2-border))"
            strokeWidth={thickness}
          />
          <circle
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
            style={{
              transition: "stroke-dashoffset 900ms cubic-bezier(0.2, 0.8, 0.2, 1)",
              filter: `drop-shadow(0 0 6px ${color})`,
            }}
          />
        </svg>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            flexDirection: "column",
            textAlign: "center",
            lineHeight: 1,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <span
              className="v2-mono"
              style={{
                fontSize: Math.round(size * 0.22),
                fontWeight: 800,
                color: "hsl(var(--v2-text))",
                letterSpacing: "-0.02em",
              }}
            >
              {showPercent ? `${pct.toFixed(0)}%` : `${value}`}
            </span>
            {!showPercent && (
              <span
                className="v2-mono"
                style={{
                  fontSize: Math.round(size * 0.09),
                  color: "hsl(var(--v2-text-mute))",
                  fontWeight: 600,
                }}
              >
                / {total}
              </span>
            )}
          </div>
        </div>
      </div>
      {label && (
        <div
          className="v2-mono"
          style={{
            fontSize: 9.5,
            fontWeight: 700,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "hsl(var(--v2-text-mute))",
            textAlign: "center",
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}
