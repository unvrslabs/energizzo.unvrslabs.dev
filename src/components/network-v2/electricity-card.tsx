import Link from "next/link";
import { Zap, ArrowRight, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";
import type { PunRow } from "@/lib/market/power-pun-db";

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDate(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS_IT[d.getUTCMonth()]}`;
}

export function ElectricityCard({
  latest,
  weekAgo,
}: {
  latest: PunRow | null;
  weekAgo?: PunRow | null;
}) {
  if (!latest) {
    return (
      <div className="v2-card v2-col-6 flex flex-col">
        <div className="v2-card-head flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
            <span className="v2-card-title">Mercato elettrico</span>
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
          Sincronizzazione PUN in corso. I dati appariranno a breve.
        </div>
      </div>
    );
  }

  const pun = Number(latest.price_eur_mwh);
  const delta =
    weekAgo && Number(weekAgo.price_eur_mwh) > 0
      ? ((pun - Number(weekAgo.price_eur_mwh)) / Number(weekAgo.price_eur_mwh)) * 100
      : null;
  const trendDir = delta == null ? "flat" : delta > 0 ? "up" : delta < 0 ? "down" : "flat";

  const zones = (latest.zones as Record<string, number>) ?? {};
  const sorted = Object.entries(zones).sort((a, b) => a[1] - b[1]);
  const minZ = sorted[0];
  const maxZ = sorted[sorted.length - 1];
  const spread = minZ && maxZ ? maxZ[1] - minZ[1] : 0;

  return (
    <div className="v2-card v2-col-6 flex flex-col">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
          <span className="v2-card-title">Mercato elettrico</span>
        </div>
        <span
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
          style={{
            color: "hsl(var(--v2-accent))",
            background: "hsl(var(--v2-accent) / 0.08)",
            border: "1px solid hsl(var(--v2-accent) / 0.28)",
          }}
          title="Media pesata 7 zone italiane (ENTSO-E). Proxy del PUN ufficiale GME."
        >
          PUN · stimato
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span
              className="v2-mono"
              style={{
                fontSize: 52,
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                color: "hsl(var(--v2-text))",
              }}
            >
              {pun.toFixed(1)}
            </span>
            <span
              className="v2-mono"
              style={{ fontSize: 14, fontWeight: 600, color: "hsl(var(--v2-text-dim))" }}
            >
              €/MWh
            </span>
          </div>
          {delta != null && (
            <span
              className="v2-mono inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded"
              style={{
                color:
                  trendDir === "up"
                    ? "hsl(var(--v2-danger))"
                    : trendDir === "down"
                    ? "hsl(var(--v2-accent))"
                    : "hsl(var(--v2-text-mute))",
                background:
                  trendDir === "up"
                    ? "hsl(var(--v2-danger) / 0.1)"
                    : trendDir === "down"
                    ? "hsl(var(--v2-accent) / 0.1)"
                    : "hsl(var(--v2-border))",
                border: `1px solid ${
                  trendDir === "up"
                    ? "hsl(var(--v2-danger) / 0.3)"
                    : trendDir === "down"
                    ? "hsl(var(--v2-accent) / 0.3)"
                    : "hsl(var(--v2-border-strong))"
                }`,
              }}
              title="Variazione vs 7 giorni fa"
            >
              {trendDir === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : trendDir === "down" ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)}% 7g
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          <span className="v2-mono">{fmtDate(latest.price_day)}</span>
          <span>·</span>
          <span>media pesata 7 zone ENTSO-E</span>
        </div>

        <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid hsl(var(--v2-border))" }}>
          {minZ && (
            <div className="flex items-center justify-between text-[12.5px]">
              <span style={{ color: "hsl(var(--v2-text-dim))" }}>Zona min</span>
              <span className="flex items-baseline gap-1.5">
                <span className="v2-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  {minZ[0].replace("IT-", "")}
                </span>
                <span className="v2-mono font-semibold" style={{ color: "hsl(var(--v2-accent))" }}>
                  {minZ[1].toFixed(1)}
                </span>
              </span>
            </div>
          )}
          {maxZ && (
            <div className="flex items-center justify-between text-[12.5px]">
              <span style={{ color: "hsl(var(--v2-text-dim))" }}>Zona max</span>
              <span className="flex items-baseline gap-1.5">
                <span className="v2-mono text-[10.5px] uppercase tracking-[0.1em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  {maxZ[0].replace("IT-", "")}
                </span>
                <span className="v2-mono font-semibold" style={{ color: "hsl(var(--v2-warn))" }}>
                  {maxZ[1].toFixed(1)}
                </span>
              </span>
            </div>
          )}
          <div className="flex items-center justify-between text-[12.5px]">
            <span style={{ color: "hsl(var(--v2-text-dim))" }}>Spread Nord-Sud</span>
            <span className="v2-mono font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
              {spread.toFixed(1)} €/MWh
            </span>
          </div>
        </div>

        <Link
          href="/network/mercato/elettrico"
          className="v2-mono inline-flex items-center gap-1 text-[11px] font-semibold mt-auto pt-2"
          style={{ color: "hsl(var(--v2-accent))" }}
        >
          Vai al dettaglio <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}
