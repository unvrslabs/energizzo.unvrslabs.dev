import type { GasStorageRow } from "@/lib/market/storage-db";

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

export function GasHistoryChart({
  history,
  height = 260,
}: {
  history: GasStorageRow[];
  height?: number;
}) {
  const points = history
    .filter((h) => h.full_pct !== null)
    .map((h) => ({
      day: h.gas_day,
      full: h.full_pct as number,
    }));
  if (points.length < 5) {
    return (
      <div
        className="p-8 text-center text-sm"
        style={{ color: "hsl(var(--v2-text-mute))" }}
      >
        Storico insufficiente.
      </div>
    );
  }

  const w = 960;
  const h = height;
  const paddingL = 42;
  const paddingR = 12;
  const paddingT = 16;
  const paddingB = 28;
  const innerW = w - paddingL - paddingR;
  const innerH = h - paddingT - paddingB;

  const n = points.length;
  const xStep = innerW / (n - 1);
  const yDomainMax = 100;
  const yDomainMin = 0;
  const yScale = (v: number) =>
    paddingT + innerH - ((v - yDomainMin) / (yDomainMax - yDomainMin)) * innerH;
  const xScale = (i: number) => paddingL + i * xStep;

  // Build path
  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${xScale(i).toFixed(1)} ${yScale(p.full).toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${xScale(n - 1).toFixed(1)} ${paddingT + innerH} L ${xScale(0).toFixed(1)} ${paddingT + innerH} Z`;

  // Y grid lines
  const yTicks = [0, 25, 50, 75, 100];

  // X labels (solo mesi unici)
  const monthMarks: { i: number; label: string }[] = [];
  let lastMonth = -1;
  points.forEach((p, i) => {
    const d = new Date(p.day + "T12:00:00Z");
    const m = d.getUTCMonth();
    if (m !== lastMonth) {
      lastMonth = m;
      monthMarks.push({ i, label: `${MONTHS_IT[m]} ${String(d.getUTCFullYear()).slice(2)}` });
    }
  });

  // Current + min/max markers
  const currentIdx = n - 1;
  const current = points[currentIdx];
  let minIdx = 0, maxIdx = 0;
  points.forEach((p, i) => {
    if (p.full < points[minIdx].full) minIdx = i;
    if (p.full > points[maxIdx].full) maxIdx = i;
  });

  return (
    <div>
      <svg
        viewBox={`0 0 ${w} ${h}`}
        className="w-full"
        style={{ height, display: "block" }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="gas-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="hsl(200 70% 58%)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(200 70% 58%)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* grid */}
        {yTicks.map((t) => (
          <g key={t}>
            <line
              x1={paddingL}
              x2={w - paddingR}
              y1={yScale(t)}
              y2={yScale(t)}
              stroke="hsl(var(--v2-border))"
              strokeWidth={1}
              strokeDasharray={t === 0 ? "0" : "3 3"}
            />
            <text
              x={paddingL - 6}
              y={yScale(t) + 3.5}
              textAnchor="end"
              fontSize="10"
              fontFamily="var(--font-mono), monospace"
              fill="hsl(var(--v2-text-mute))"
            >
              {t}%
            </text>
          </g>
        ))}

        {/* area + line */}
        <path d={areaPath} fill="url(#gas-area)" />
        <path
          d={linePath}
          fill="none"
          stroke="hsl(200 70% 65%)"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* markers */}
        <Marker x={xScale(minIdx)} y={yScale(points[minIdx].full)} color="hsl(var(--v2-warn))" />
        <Marker x={xScale(maxIdx)} y={yScale(points[maxIdx].full)} color="hsl(var(--v2-accent))" />
        <Marker x={xScale(currentIdx)} y={yScale(current.full)} color="hsl(200 70% 75%)" big />

        {/* x axis month labels */}
        {monthMarks.map((m) => (
          <g key={m.i}>
            <line
              x1={xScale(m.i)}
              x2={xScale(m.i)}
              y1={paddingT + innerH}
              y2={paddingT + innerH + 3}
              stroke="hsl(var(--v2-border))"
              strokeWidth={1}
            />
            <text
              x={xScale(m.i)}
              y={paddingT + innerH + 16}
              textAnchor={m.i === 0 ? "start" : m.i === n - 1 ? "end" : "middle"}
              fontSize="10"
              fontFamily="var(--font-mono), monospace"
              fill="hsl(var(--v2-text-mute))"
              letterSpacing="0.06em"
            >
              {m.label}
            </text>
          </g>
        ))}
      </svg>

      <div
        className="v2-mono flex items-center gap-4 flex-wrap mt-2 pl-1"
        style={{
          fontSize: 10.5,
          color: "hsl(var(--v2-text-mute))",
          letterSpacing: "0.14em",
          textTransform: "uppercase",
        }}
      >
        <span className="inline-flex items-center gap-1.5">
          <span
            style={{ width: 8, height: 8, borderRadius: 999, background: "hsl(var(--v2-accent))" }}
          />
          Max {points[maxIdx].full.toFixed(1)}% · {fmtDayShort(points[maxIdx].day)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            style={{ width: 8, height: 8, borderRadius: 999, background: "hsl(var(--v2-warn))" }}
          />
          Min {points[minIdx].full.toFixed(1)}% · {fmtDayShort(points[minIdx].day)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span
            style={{ width: 8, height: 8, borderRadius: 999, background: "hsl(200 70% 75%)" }}
          />
          Oggi {current.full.toFixed(1)}%
        </span>
      </div>
    </div>
  );
}

function Marker({
  x,
  y,
  color,
  big,
}: {
  x: number;
  y: number;
  color: string;
  big?: boolean;
}) {
  const r = big ? 4.5 : 3.5;
  return (
    <g>
      <circle cx={x} cy={y} r={r + 3} fill={color} opacity={0.2} />
      <circle cx={x} cy={y} r={r} fill={color} stroke="hsl(var(--v2-bg))" strokeWidth={1.5} />
    </g>
  );
}

function fmtDayShort(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS_IT[d.getUTCMonth()]} ${String(d.getUTCFullYear()).slice(2)}`;
}
