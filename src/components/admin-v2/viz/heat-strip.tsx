/**
 * Heat strip: barra di celle quadrate, una per giorno (o slot temporale).
 * Intensità del colore proporzionale al valore.
 *
 * Uso tipico: "attività ultimi 30/90 giorni" — leads, post, registrazioni, ecc.
 * Hover su singola cella mostra tooltip con label + valore.
 */

type Variant = "accent" | "info" | "warn";

const COLORS: Record<Variant, { hue: number; sat: number }> = {
  accent: { hue: 158, sat: 64 },
  info: { hue: 200, sat: 60 },
  warn: { hue: 38, sat: 80 },
};

export function HeatStrip({
  data,
  variant = "accent",
  cellSize = 14,
  gap = 3,
  ariaLabel,
}: {
  data: Array<{ date: string; value: number; label?: string }>;
  variant?: Variant;
  cellSize?: number;
  gap?: number;
  ariaLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const { hue, sat } = COLORS[variant];

  return (
    <div
      role="img"
      aria-label={ariaLabel ?? `Heatmap ${data.length} giorni`}
      style={{
        display: "grid",
        gridAutoFlow: "column",
        gridAutoColumns: `${cellSize}px`,
        gap: `${gap}px`,
      }}
    >
      {data.map((d, i) => {
        const intensity = d.value === 0 ? 0 : 0.18 + (d.value / max) * 0.72;
        const bg =
          d.value === 0
            ? "hsl(var(--v2-card))"
            : `hsl(${hue} ${sat}% ${30 + intensity * 30}% / ${0.4 + intensity * 0.55})`;
        const tip = d.label ?? `${d.date}: ${d.value}`;
        return (
          <div
            key={`${d.date}-${i}`}
            title={tip}
            style={{
              width: cellSize,
              height: cellSize,
              borderRadius: 3,
              background: bg,
              border:
                d.value === 0
                  ? "1px solid hsl(var(--v2-border))"
                  : `1px solid hsl(${hue} ${sat}% 50% / ${0.3 + intensity * 0.4})`,
              cursor: "default",
              transition: "transform 120ms ease",
            }}
          />
        );
      })}
    </div>
  );
}
