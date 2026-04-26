/**
 * Donut chart SVG inline. Distribuzione percentuali tra categorie.
 *
 * - Color rotation tra accent/info/warn/danger/text-dim per leggibilità
 * - Center label opzionale (es. totale)
 * - Legend renderizzata accanto al cerchio se `showLegend`
 */

const PALETTE = [
  "hsl(var(--v2-accent))",
  "hsl(var(--v2-info))",
  "hsl(var(--v2-warn))",
  "hsl(var(--v2-danger))",
  "hsl(var(--v2-text-dim))",
  "hsl(158 50% 35%)",
  "hsl(200 60% 38%)",
];

export type DonutSlice = {
  label: string;
  value: number;
  color?: string;
};

export function Donut({
  slices,
  size = 140,
  thickness = 14,
  centerLabel,
  centerValue,
  showLegend = true,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string | number;
  showLegend?: boolean;
}) {
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const r = size / 2 - thickness / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;

  // Calcolo segmenti come stroke-dasharray rotation
  let cursor = 0;
  const segments = slices.map((s, i) => {
    const portion = s.value / total;
    const length = portion * circumference;
    const seg = {
      color: s.color ?? PALETTE[i % PALETTE.length],
      length,
      offset: cursor,
      label: s.label,
      value: s.value,
      pct: portion * 100,
    };
    cursor += length;
    return seg;
  });

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        style={{ flexShrink: 0, transform: "rotate(-90deg)" }}
        role="img"
        aria-label="Distribuzione percentuali"
      >
        {/* Sfondo */}
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="hsl(var(--v2-border))"
          strokeWidth={thickness}
        />
        {segments.map((s, i) => (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${s.length} ${circumference - s.length}`}
            strokeDashoffset={-s.offset}
            strokeLinecap="butt"
          />
        ))}
        {(centerValue !== undefined || centerLabel) && (
          <g transform={`rotate(90 ${cx} ${cy})`}>
            {centerValue !== undefined && (
              <text
                x={cx}
                y={cy + 2}
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize={Math.round(size * 0.18)}
                fontWeight={700}
                fill="hsl(var(--v2-text))"
                dominantBaseline="middle"
              >
                {centerValue}
              </text>
            )}
            {centerLabel && (
              <text
                x={cx}
                y={cy + Math.round(size * 0.18) - 2}
                textAnchor="middle"
                fontFamily="var(--font-mono), monospace"
                fontSize={9}
                letterSpacing="0.2em"
                fill="hsl(var(--v2-text-mute))"
              >
                {centerLabel.toUpperCase()}
              </text>
            )}
          </g>
        )}
      </svg>

      {showLegend && (
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            minWidth: 0,
          }}
        >
          {segments.map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 11.5,
                color: "hsl(var(--v2-text-dim))",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: s.color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textTransform: "capitalize",
                }}
                title={s.label}
              >
                {s.label}
              </span>
              <span
                className="v2-mono"
                style={{
                  fontWeight: 700,
                  color: "hsl(var(--v2-text))",
                  fontSize: 11,
                }}
              >
                {s.value}
              </span>
              <span
                className="v2-mono"
                style={{
                  fontSize: 10,
                  color: "hsl(var(--v2-text-mute))",
                  width: 38,
                  textAlign: "right",
                }}
              >
                {s.pct.toFixed(0)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
