import { Flame, Info, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { getLatestGasStorage, listGasStorageHistory } from "@/lib/market/storage-db";
import { GasHistoryChart } from "@/components/network-v2/gas-history-chart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Mercato gas · Terminal",
};

const MONTHS = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDateFull(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}
function fmtDateShort(iso: string): string {
  const d = new Date(iso + "T12:00:00Z");
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export default async function MercatoGasPage() {
  const [latest, history] = await Promise.all([
    getLatestGasStorage(),
    listGasStorageHistory(365),
  ]);

  if (!latest) {
    return (
      <div className="v2-card p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
        Dati AGSI+ non ancora disponibili. Lancia <code>npx tsx scripts/sync-gas-storage.ts</code>.
      </div>
    );
  }

  const full = latest.full_pct ?? 0;
  const trend = latest.trend_pct ?? 0;
  const trendDir = trend > 0 ? "up" : trend < 0 ? "down" : "flat";
  const isInjecting = (latest.net_withdrawal_gwh ?? 0) < 0;

  // Compute useful stats
  const currentYearStart = history.filter((h) => {
    const d = new Date(h.gas_day + "T12:00:00Z");
    return d.getUTCFullYear() === new Date().getUTCFullYear() && d.getUTCMonth() === 0 && d.getUTCDate() === 1;
  })[0];

  const oneYearAgo = history[0];
  const ytdInjection = history.reduce((s, h) => s + (h.injection_gwh ?? 0), 0);
  const ytdWithdrawal = history.reduce((s, h) => s + (h.withdrawal_gwh ?? 0), 0);

  const recent = history.slice(-14).reverse();

  return (
    <div className="flex flex-col gap-5">
      {/* HERO gauge + chart */}
      <section className="v2-bento">
        {/* Gauge — 4 cols */}
        <div className="v2-card v2-col-4 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-accent))" }}>
              Riempimento oggi
            </div>
            <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              {fmtDateFull(latest.gas_day)}
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className="v2-mono"
              style={{
                fontSize: 72,
                fontWeight: 700,
                lineHeight: 0.95,
                letterSpacing: "-0.03em",
                color: "hsl(var(--v2-text))",
              }}
            >
              {full.toFixed(1)}
            </span>
            <span
              className="v2-mono"
              style={{ fontSize: 18, fontWeight: 600, color: "hsl(var(--v2-text-dim))" }}
            >
              %
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="v2-mono inline-flex items-center gap-1 text-[12px] font-semibold px-2 py-1 rounded"
              style={{
                color:
                  trendDir === "up"
                    ? "hsl(var(--v2-accent))"
                    : trendDir === "down"
                    ? "hsl(var(--v2-danger))"
                    : "hsl(var(--v2-text-mute))",
                background:
                  trendDir === "up"
                    ? "hsl(var(--v2-accent) / 0.1)"
                    : trendDir === "down"
                    ? "hsl(var(--v2-danger) / 0.1)"
                    : "hsl(var(--v2-border))",
                border: `1px solid ${
                  trendDir === "up"
                    ? "hsl(var(--v2-accent) / 0.3)"
                    : trendDir === "down"
                    ? "hsl(var(--v2-danger) / 0.3)"
                    : "hsl(var(--v2-border-strong))"
                }`,
              }}
            >
              {trendDir === "up" ? (
                <TrendingUp className="w-3 h-3" />
              ) : trendDir === "down" ? (
                <TrendingDown className="w-3 h-3" />
              ) : (
                <ArrowUpRight className="w-3 h-3" />
              )}
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(2)}% 24h
            </span>
            <span
              className="v2-mono text-[11px]"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              {isInjecting ? "iniezione in corso" : "prelievo in corso"}
            </span>
          </div>

          <div
            className="w-full h-2 rounded-full overflow-hidden"
            style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
          >
            <div
              style={{
                width: `${Math.min(100, Math.max(0, full))}%`,
                height: "100%",
                background:
                  full > 75
                    ? "linear-gradient(to right, hsl(var(--v2-accent)), hsl(var(--v2-accent) / 0.7))"
                    : full > 40
                    ? "linear-gradient(to right, hsl(var(--v2-info)), hsl(var(--v2-accent)))"
                    : "linear-gradient(to right, hsl(var(--v2-warn)), hsl(var(--v2-info)))",
              }}
            />
          </div>

          <div className="flex flex-col gap-2 pt-2" style={{ borderTop: "1px solid hsl(var(--v2-border))" }}>
            <RowKV
              label="Gas in stoccaggio"
              value={latest.gas_in_storage_twh?.toFixed(2) ?? "—"}
              unit="TWh"
            />
            <RowKV
              label="Working gas volume"
              value={latest.working_gas_volume_twh?.toFixed(2) ?? "—"}
              unit="TWh"
            />
            <RowKV
              label={isInjecting ? "Iniezione 24h" : "Prelievo 24h"}
              value={
                isInjecting
                  ? latest.injection_gwh?.toFixed(0) ?? "—"
                  : latest.withdrawal_gwh?.toFixed(0) ?? "—"
              }
              unit="GWh"
              accent={isInjecting ? "accent" : "warn"}
            />
            <RowKV
              label="Capacità max iniezione"
              value={latest.injection_capacity_gwh?.toFixed(0) ?? "—"}
              unit="GWh/g"
            />
            <RowKV
              label="Capacità max prelievo"
              value={latest.withdrawal_capacity_gwh?.toFixed(0) ?? "—"}
              unit="GWh/g"
            />
          </div>
        </div>

        {/* Chart — 8 cols */}
        <div className="v2-card v2-col-8 p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <div
                className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "hsl(var(--v2-accent))" }}
              >
                Andamento 12 mesi · % riempimento
              </div>
              <p className="text-[12.5px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
                {oneYearAgo && (
                  <>
                    Dal {fmtDateShort(oneYearAgo.gas_day)} a oggi · {history.length} giorni ·
                    fonte AGSI+
                  </>
                )}
              </p>
            </div>
            {currentYearStart?.full_pct !== undefined && currentYearStart.full_pct !== null && (
              <div
                className="v2-mono text-[11px] px-2 py-1 rounded"
                style={{
                  color: "hsl(var(--v2-text-dim))",
                  background: "hsl(var(--v2-bg-elev))",
                  border: "1px solid hsl(var(--v2-border))",
                }}
              >
                YTD: 1 gen {currentYearStart.full_pct.toFixed(1)}% → oggi {full.toFixed(1)}%
                <span
                  style={{
                    marginLeft: 6,
                    color:
                      full - currentYearStart.full_pct > 0
                        ? "hsl(var(--v2-accent))"
                        : "hsl(var(--v2-danger))",
                  }}
                >
                  ({full - currentYearStart.full_pct >= 0 ? "+" : ""}
                  {(full - currentYearStart.full_pct).toFixed(1)} pp)
                </span>
              </div>
            )}
          </div>
          <GasHistoryChart history={history} height={280} />
        </div>
      </section>

      {/* Daily detail table */}
      <section className="v2-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
        >
          <div>
            <div
              className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--v2-accent))" }}
            >
              Ultimi 14 giorni
            </div>
            <p className="text-[12.5px] mt-0.5" style={{ color: "hsl(var(--v2-text-dim))" }}>
              Iniezione/prelievo e trend giornaliero
            </p>
          </div>
          <span className="v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            {recent.length} righe
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}>
                <Th left>Data</Th>
                <Th>Riempimento</Th>
                <Th>Trend 24h</Th>
                <Th>Iniezione</Th>
                <Th>Prelievo</Th>
                <Th>Net</Th>
                <Th>Stoccaggio</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => (
                <tr
                  key={r.gas_day}
                  style={{ borderBottom: i < recent.length - 1 ? "1px solid hsl(var(--v2-border))" : undefined }}
                >
                  <td className="px-4 py-2.5 text-[12.5px] font-medium" style={{ color: "hsl(var(--v2-text))" }}>
                    {fmtDateFull(r.gas_day)}
                  </td>
                  <Td mono>{r.full_pct !== null ? `${r.full_pct.toFixed(2)}%` : "—"}</Td>
                  <Td
                    mono
                    color={
                      (r.trend_pct ?? 0) > 0
                        ? "hsl(var(--v2-accent))"
                        : (r.trend_pct ?? 0) < 0
                        ? "hsl(var(--v2-danger))"
                        : undefined
                    }
                  >
                    {r.trend_pct !== null
                      ? `${r.trend_pct >= 0 ? "+" : ""}${r.trend_pct.toFixed(2)}%`
                      : "—"}
                  </Td>
                  <Td mono>{r.injection_gwh !== null ? r.injection_gwh.toFixed(0) : "—"}</Td>
                  <Td mono>{r.withdrawal_gwh !== null ? r.withdrawal_gwh.toFixed(0) : "—"}</Td>
                  <Td
                    mono
                    color={
                      (r.net_withdrawal_gwh ?? 0) < 0
                        ? "hsl(var(--v2-accent))"
                        : "hsl(var(--v2-warn))"
                    }
                  >
                    {r.net_withdrawal_gwh !== null
                      ? `${r.net_withdrawal_gwh >= 0 ? "+" : ""}${r.net_withdrawal_gwh.toFixed(0)}`
                      : "—"}
                  </Td>
                  <Td mono>
                    {r.gas_in_storage_twh !== null ? `${r.gas_in_storage_twh.toFixed(2)} TWh` : "—"}
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Info box */}
      <section
        className="v2-card p-5 flex items-start gap-3"
        style={{ borderColor: "hsl(var(--v2-info) / 0.22)", background: "hsl(var(--v2-info) / 0.04)" }}
      >
        <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "hsl(var(--v2-info))" }} />
        <div className="text-[12.5px] leading-relaxed" style={{ color: "hsl(var(--v2-text-dim))" }}>
          <strong style={{ color: "hsl(var(--v2-text))" }}>Come leggere questi dati.</strong>{" "}
          Gli stoccaggi gas italiani sono aggregati di Stogit (Snam), Edison e IGS. Il{" "}
          <em>working gas volume</em> è la capacità utile totale (~204 TWh). Il{" "}
          <em>riempimento %</em> guida le strategie d&apos;acquisto: valori bassi a inizio
          ottobre significano prezzi spot più alti. Iniezione primavera/estate, prelievo
          autunno/inverno. Aggiornamento AGSI+ giornaliero (dati del gas day precedente).
        </div>
      </section>
    </div>
  );
}

function RowKV({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string;
  unit: string;
  accent?: "accent" | "warn";
}) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[12.5px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
        {label}
      </span>
      <span className="flex items-baseline gap-1">
        <span
          className="v2-mono font-semibold text-[14px]"
          style={{
            color:
              accent === "accent"
                ? "hsl(var(--v2-accent))"
                : accent === "warn"
                ? "hsl(var(--v2-warn))"
                : "hsl(var(--v2-text))",
          }}
        >
          {value}
        </span>
        <span className="v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          {unit}
        </span>
      </span>
    </div>
  );
}

function Th({ children, left }: { children: React.ReactNode; left?: boolean }) {
  return (
    <th
      className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-4 py-2.5"
      style={{
        color: "hsl(var(--v2-text-mute))",
        textAlign: left ? "left" : "right",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  mono,
  color,
}: {
  children: React.ReactNode;
  mono?: boolean;
  color?: string;
}) {
  return (
    <td
      className={mono ? "v2-mono px-4 py-2.5 text-[12.5px] text-right" : "px-4 py-2.5 text-[12.5px] text-right"}
      style={{
        color: color ?? "hsl(var(--v2-text))",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </td>
  );
}
