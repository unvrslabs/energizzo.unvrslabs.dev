/**
 * Box countdown giorni-alla-scadenza.
 * Numero HUGE in alto + label "GIORNI" / "OGGI" sotto.
 * Colore per severità: rosso ≤7gg, arancione ≤30gg, blu ≤90gg, grigio oltre.
 *
 * 2 size:
 *  - "lg" (default): 76×76, numero 32px → uso pagina /network/scadenze
 *  - "sm": 44×44, numero 20px → uso card home /network
 */

const MONTHS_IT_SHORT = [
  "gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic",
];

export function daysToDate(iso: string): number {
  const target = new Date(iso + "T12:00:00Z").getTime();
  return Math.ceil((target - Date.now()) / 86400000);
}

type Severity = {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string | null;
};

export function severityFromDays(days: number): Severity {
  if (days <= 0)
    return {
      label: "OGGI",
      color: "hsl(var(--v2-danger))",
      bg: "hsl(var(--v2-danger) / 0.14)",
      border: "hsl(var(--v2-danger) / 0.5)",
      glow: "hsl(var(--v2-danger) / 0.4)",
    };
  if (days <= 7)
    return {
      label: "GIORNI",
      color: "hsl(var(--v2-danger))",
      bg: "hsl(var(--v2-danger) / 0.10)",
      border: "hsl(var(--v2-danger) / 0.4)",
      glow: "hsl(var(--v2-danger) / 0.3)",
    };
  if (days <= 30)
    return {
      label: "GIORNI",
      color: "hsl(var(--v2-warn))",
      bg: "hsl(var(--v2-warn) / 0.10)",
      border: "hsl(var(--v2-warn) / 0.4)",
      glow: null,
    };
  if (days <= 90)
    return {
      label: "GIORNI",
      color: "hsl(var(--v2-info))",
      bg: "hsl(var(--v2-info) / 0.10)",
      border: "hsl(var(--v2-info) / 0.32)",
      glow: null,
    };
  return {
    label: "GIORNI",
    color: "hsl(var(--v2-text-mute))",
    bg: "hsl(var(--v2-bg-elev))",
    border: "hsl(var(--v2-border-strong))",
    glow: null,
  };
}

function formatDateShort(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS_IT_SHORT[d.getUTCMonth()]}`;
}

export function ScadenzaCountdown({
  date,
  size = "lg",
}: {
  date: string;
  size?: "lg" | "sm";
}) {
  const days = daysToDate(date);
  const sev = severityFromDays(days);
  const isToday = days <= 0;

  const dim = size === "lg" ? 76 : 44;
  const numSize = size === "lg" ? 28 : 18;
  const labelSize = size === "lg" ? 9 : 7.5;
  const dateSize = size === "lg" ? 10 : 8.5;

  return (
    <div
      style={{
        width: dim,
        height: dim,
        borderRadius: 10,
        background: sev.bg,
        border: `1px solid ${sev.border}`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: size === "lg" ? 1 : 0,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
        boxShadow: sev.glow ? `0 0 16px ${sev.glow}` : undefined,
      }}
    >
      <span
        className="v2-mono"
        style={{
          fontSize: numSize,
          fontWeight: 800,
          color: sev.color,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {isToday ? "0" : Math.abs(days)}
      </span>
      <span
        className="v2-mono"
        style={{
          fontSize: labelSize,
          fontWeight: 700,
          letterSpacing: "0.18em",
          color: sev.color,
          opacity: 0.9,
          lineHeight: 1,
          marginTop: size === "lg" ? 4 : 2,
        }}
      >
        {sev.label}
      </span>
      {size === "lg" && (
        <span
          className="v2-mono"
          style={{
            fontSize: dateSize,
            fontWeight: 600,
            letterSpacing: "0.04em",
            color: "hsl(var(--v2-text-mute))",
            opacity: 0.85,
            lineHeight: 1,
            marginTop: 4,
          }}
        >
          {formatDateShort(date)}
        </span>
      )}
    </div>
  );
}
