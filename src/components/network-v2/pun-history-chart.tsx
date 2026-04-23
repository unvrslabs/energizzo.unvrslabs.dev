import type { PunRow } from "@/lib/market/power-pun-db";

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

export function PunHistoryChart({
  history,
  height = 260,
}: {
  history: PunRow[];
  height?: number;
}) {
  const points = history
    .filter((h) => h.price_eur_mwh != null)
    .map((h) => ({
      day: h.price_day,
      price: Number(h.price_eur_mwh),
    }));

  if (points.length < 5) {
    return (
      <div
        className="p-8 text-center text-sm"
        style={{ color: "hsl(var(--v2-text-mute))" }}
      >
        Storico insufficiente ({points.length} punti). Il cron sta ancora riempiendo il backfill.
      </div>
    );
  }

  const w = 960;
  const h = height;
  const padL = 48;
  const padR = 16;
  const padT = 18;
  const padB = 28;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const prices = points.map((p) => p.price);
  const minPrice = Math.max(0, Math.min(...prices) - 15);
  const maxPrice = Math.max(...prices) + 15;
  const range = maxPrice - minPrice || 1;

  const xOf = (i: number) => padL + (i * innerW) / Math.max(1, points.length - 1);
  const yOf = (p: number) => padT + (1 - (p - minPrice) / range) * innerH;

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xOf(i).toFixed(2)} ${yOf(p.price).toFixed(2)}`)
    .join(" ");

  const areaPath =
    `M ${xOf(0).toFixed(2)} ${(padT + innerH).toFixed(2)} ` +
    points
      .map((p, i) => `L ${xOf(i).toFixed(2)} ${yOf(p.price).toFixed(2)}`)
      .join(" ") +
    ` L ${xOf(points.length - 1).toFixed(2)} ${(padT + innerH).toFixed(2)} Z`;

  // Griglia orizzontale (5 linee)
  const gridLines: Array<{ y: number; value: number }> = [];
  for (let i = 0; i <= 4; i++) {
    const v = minPrice + (range * (4 - i)) / 4;
    gridLines.push({ y: padT + (i * innerH) / 4, value: v });
  }

  // Tick date: primo, 25%, 50%, 75%, ultimo
  const tickIdx = [0, Math.floor(points.length / 4), Math.floor(points.length / 2), Math.floor((points.length * 3) / 4), points.length - 1].filter(
    (v, i, a) => a.indexOf(v) === i,
  );

  const last = points[points.length - 1];
  const first = points[0];
  const totalDelta =
    first.price > 0 ? ((last.price - first.price) / first.price) * 100 : 0;
  const deltaColor =
    totalDelta > 0 ? "hsl(var(--v2-danger))" : totalDelta < 0 ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-mute))";

  function fmtDay(iso: string) {
    const d = new Date(iso + "T12:00:00Z");
    return `${d.getUTCDate()} ${MONTHS_IT[d.getUTCMonth()]}`;
  }

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="pun-area-gradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--v2-warn))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--v2-warn))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* griglia */}
      {gridLines.map((g, i) => (
        <g key={i}>
          <line
            x1={padL}
            x2={w - padR}
            y1={g.y}
            y2={g.y}
            stroke="hsl(var(--v2-border))"
            strokeDasharray="2 3"
            opacity={0.5}
          />
          <text
            x={padL - 8}
            y={g.y + 3}
            textAnchor="end"
            fontSize="10"
            fontFamily="var(--font-mono), monospace"
            fill="hsl(var(--v2-text-mute))"
          >
            {g.value.toFixed(0)}
          </text>
        </g>
      ))}

      {/* area */}
      <path d={areaPath} fill="url(#pun-area-gradient)" />

      {/* linea */}
      <path d={linePath} fill="none" stroke="hsl(var(--v2-warn))" strokeWidth="1.8" />

      {/* punto ultimo */}
      <circle
        cx={xOf(points.length - 1)}
        cy={yOf(last.price)}
        r="3.5"
        fill="hsl(var(--v2-warn))"
        stroke="hsl(var(--v2-bg))"
        strokeWidth="2"
      />

      {/* tick date */}
      {tickIdx.map((i) => (
        <text
          key={i}
          x={xOf(i)}
          y={h - 8}
          textAnchor="middle"
          fontSize="10"
          fontFamily="var(--font-mono), monospace"
          fill="hsl(var(--v2-text-mute))"
        >
          {fmtDay(points[i].day)}
        </text>
      ))}

      {/* delta totale badge */}
      <text
        x={w - padR}
        y={padT + 4}
        textAnchor="end"
        fontSize="11"
        fontWeight="700"
        fontFamily="var(--font-mono), monospace"
        fill={deltaColor}
      >
        {totalDelta >= 0 ? "+" : ""}
        {totalDelta.toFixed(1)}% nel periodo
      </text>
    </svg>
  );
}
