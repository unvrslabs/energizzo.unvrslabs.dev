/**
 * Sparkline SVG inline. Trend mini-chart per card KPI.
 * Server-component compatibile (no "use client" perché è puro SVG statico).
 *
 * Disegna sia l'area che la linea, con gradient emerald di default.
 * Accetta valori numerici grezzi; l'auto-scale è min..max della serie.
 */

type Variant = "accent" | "info" | "warn" | "danger";

const COLORS: Record<Variant, { stroke: string; fill: string }> = {
  accent: {
    stroke: "hsl(var(--v2-accent))",
    fill: "hsl(var(--v2-accent) / 0.18)",
  },
  info: {
    stroke: "hsl(var(--v2-info))",
    fill: "hsl(var(--v2-info) / 0.18)",
  },
  warn: {
    stroke: "hsl(var(--v2-warn))",
    fill: "hsl(var(--v2-warn) / 0.18)",
  },
  danger: {
    stroke: "hsl(var(--v2-danger))",
    fill: "hsl(var(--v2-danger) / 0.18)",
  },
};

export function Sparkline({
  data,
  width = 120,
  height = 32,
  variant = "accent",
  showDot = true,
  ariaLabel,
}: {
  data: number[];
  width?: number;
  height?: number;
  variant?: Variant;
  showDot?: boolean;
  ariaLabel?: string;
}) {
  const safe = data.length === 0 ? [0, 0] : data.length === 1 ? [data[0], data[0]] : data;
  const min = Math.min(...safe);
  const max = Math.max(...safe);
  const range = max - min || 1;
  const padY = 2;
  const innerH = height - padY * 2;

  const points = safe.map((v, i) => {
    const x = (i / (safe.length - 1)) * width;
    const y = padY + innerH - ((v - min) / range) * innerH;
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const areaPath =
    `${linePath} L ${width.toFixed(2)} ${height.toFixed(2)} L 0 ${height.toFixed(2)} Z`;

  const last = points[points.length - 1];
  const colors = COLORS[variant];
  const gradId = `spark-${variant}-${Math.random().toString(36).slice(2, 7)}`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel ?? `Trend ${safe.length} punti`}
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={colors.fill} />
          <stop offset="100%" stopColor={colors.fill} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={colors.stroke}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {showDot && (
        <circle
          cx={last[0]}
          cy={last[1]}
          r={2.5}
          fill={colors.stroke}
          stroke="hsl(var(--v2-bg-elev))"
          strokeWidth={1.5}
        />
      )}
    </svg>
  );
}
