import Link from "next/link";
import { Flame, ArrowRight, TrendingUp, TrendingDown } from "lucide-react";
import type { PsvRow } from "@/lib/market/gas-psv-db";

function PsvSparkline({ history }: { history: PsvRow[] }) {
  if (history.length < 3) return null;
  const prices = history.map((h) => Number(h.price_eur_mwh));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const w = 320;
  const h = 44;
  const step = w / Math.max(1, prices.length - 1);
  const points = prices.map((p, i) => ({
    x: i * step,
    y: h - ((p - min) / range) * (h - 4) - 2,
  }));
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`)
    .join(" ");
  const area =
    `M 0 ${h} ` +
    points.map((p) => `L ${p.x.toFixed(2)} ${p.y.toFixed(2)}`).join(" ") +
    ` L ${w} ${h} Z`;
  const last = points[points.length - 1];
  // Colore PSV: arancio caldo (gas-thermal), distinto dal warn-PUN
  const color = "hsl(28 92% 56%)";
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width="100%"
      height={h}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient id="psv-card-spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.3" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#psv-card-spark)" />
      <path d={path} fill="none" stroke={color} strokeWidth="1.6" />
      <circle
        cx={last.x}
        cy={last.y}
        r="3"
        fill={color}
        stroke="hsl(var(--v2-bg))"
        strokeWidth="2"
      />
    </svg>
  );
}

const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS_IT[d.getUTCMonth()]}`;
}

export function PsvCard({
  latest,
  weekAgo,
  history,
}: {
  latest: PsvRow | null;
  weekAgo?: PsvRow | null;
  history?: PsvRow[];
}) {
  // Colore PSV
  const color = "hsl(28 92% 56%)"; // arancio caldo

  if (!latest) {
    return (
      <div className="v2-card v2-col-6 flex flex-col">
        <div className="v2-card-head flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-3.5 h-3.5" style={{ color }} />
            <span className="v2-card-title">Mercato gas · PSV</span>
          </div>
          <span
            className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
            style={{
              color: "hsl(var(--v2-text-mute))",
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
            }}
          >
            in sync
          </span>
        </div>
        <div className="p-5 text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Sincronizzazione PSV in corso. Fonte: GME MGP-Gas. I dati appariranno
          dopo la chiusura giornaliera dell&apos;asta (14:30 IT).
        </div>
      </div>
    );
  }

  const psv = Number(latest.price_eur_mwh);
  const delta =
    weekAgo && Number(weekAgo.price_eur_mwh) > 0
      ? ((psv - Number(weekAgo.price_eur_mwh)) / Number(weekAgo.price_eur_mwh)) * 100
      : null;
  const trendUp = delta != null && delta > 0;
  const trendDown = delta != null && delta < 0;

  return (
    <div className="v2-card v2-col-6 flex flex-col">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-3.5 h-3.5" style={{ color }} />
          <span className="v2-card-title">Mercato gas · PSV</span>
        </div>
        <Link
          href="/network/mercato/gas"
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors flex items-center gap-1"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          dettaglio
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>

      <div className="p-5 flex flex-col gap-3">
        {/* Big KPI: prezzo PSV */}
        <div className="flex items-baseline gap-2">
          <span
            className="v2-mono"
            style={{
              fontSize: 48,
              fontWeight: 700,
              lineHeight: 0.95,
              color,
              letterSpacing: "-0.03em",
            }}
          >
            {psv.toFixed(2).replace(".", ",")}
          </span>
          <span
            className="v2-mono"
            style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--v2-text-dim))" }}
          >
            €/MWh
          </span>
        </div>

        {/* Delta + data */}
        <div className="flex items-center gap-3 flex-wrap">
          {delta != null && (
            <div
              className="v2-mono inline-flex items-center gap-1 px-2 py-0.5 rounded"
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: trendDown
                  ? "hsl(var(--v2-accent))"
                  : trendUp
                    ? "hsl(var(--v2-danger))"
                    : "hsl(var(--v2-text-mute))",
                background: trendDown
                  ? "hsl(var(--v2-accent) / 0.10)"
                  : trendUp
                    ? "hsl(var(--v2-danger) / 0.10)"
                    : "hsl(var(--v2-bg-elev))",
                border: trendDown
                  ? "1px solid hsl(var(--v2-accent) / 0.28)"
                  : trendUp
                    ? "1px solid hsl(var(--v2-danger) / 0.28)"
                    : "1px solid hsl(var(--v2-border))",
              }}
            >
              {trendUp ? (
                <TrendingUp className="w-3 h-3" />
              ) : trendDown ? (
                <TrendingDown className="w-3 h-3" />
              ) : null}
              {delta > 0 ? "+" : ""}
              {delta.toFixed(1)}% vs 7gg
            </div>
          )}
          <span
            className="v2-mono text-[11px]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            {fmtDate(latest.price_day)} · {latest.source.toUpperCase()}
          </span>
        </div>

        {/* Sparkline 14gg */}
        {history && history.length >= 3 && (
          <div className="mt-1">
            <PsvSparkline history={history} />
            <div
              className="flex justify-between v2-mono text-[9.5px] mt-1"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              <span>{fmtDate(history[0].price_day)}</span>
              <span>14 GIORNI</span>
              <span>{fmtDate(history[history.length - 1].price_day)}</span>
            </div>
          </div>
        )}

        {latest.volume_mwh != null && (
          <div
            className="text-[11.5px] pt-2"
            style={{
              color: "hsl(var(--v2-text-mute))",
              borderTop: "1px solid hsl(var(--v2-border))",
            }}
          >
            Volume:{" "}
            <strong style={{ color: "hsl(var(--v2-text))" }}>
              {(latest.volume_mwh / 1000).toFixed(1)} GWh
            </strong>
            {latest.trades_count != null && ` · ${latest.trades_count} contratti`}
          </div>
        )}
      </div>
    </div>
  );
}
