import { Info, ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";
import { getLatestPun, listPunHistory } from "@/lib/market/power-pun-db";
import { PunHistoryChart } from "@/components/network-v2/pun-history-chart";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Mercato elettrico · Terminal",
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

const ZONE_LABELS: Record<string, string> = {
  "IT-North": "Nord",
  "IT-Centre-North": "Centro-Nord",
  "IT-Centre-South": "Centro-Sud",
  "IT-South": "Sud",
  "IT-Sicily": "Sicilia",
  "IT-Sardinia": "Sardegna",
  "IT-Calabria": "Calabria",
};

const ZONE_WEIGHTS: Record<string, number> = {
  "IT-North": 0.47,
  "IT-Centre-North": 0.11,
  "IT-Centre-South": 0.13,
  "IT-South": 0.14,
  "IT-Sicily": 0.06,
  "IT-Sardinia": 0.04,
  "IT-Calabria": 0.05,
};

export default async function MercatoElettricoPage() {
  const [latest, history] = await Promise.all([
    getLatestPun(),
    listPunHistory(90),
  ]);

  if (!latest) {
    return (
      <div
        className="v2-card p-10 text-center text-sm"
        style={{ color: "hsl(var(--v2-text-mute))" }}
      >
        Dati PUN non ancora disponibili. Sincronizzazione in corso.
      </div>
    );
  }

  const pun = Number(latest.price_eur_mwh);
  const zones = (latest.zones as Record<string, number>) ?? {};
  const sortedZones = Object.entries(zones).sort((a, b) => a[1] - b[1]);
  const minZ = sortedZones[0];
  const maxZ = sortedZones[sortedZones.length - 1];
  const spread = minZ && maxZ ? maxZ[1] - minZ[1] : 0;

  const weekAgo = history.find((row) => {
    const diff =
      (new Date(latest.price_day).getTime() - new Date(row.price_day).getTime()) /
      86400000;
    return diff >= 6.5 && diff <= 8;
  });
  const deltaWeek =
    weekAgo && Number(weekAgo.price_eur_mwh) > 0
      ? ((pun - Number(weekAgo.price_eur_mwh)) /
          Number(weekAgo.price_eur_mwh)) *
        100
      : null;
  const trendDir =
    deltaWeek == null ? "flat" : deltaWeek > 0 ? "up" : deltaWeek < 0 ? "down" : "flat";

  const first = history[0];
  const prices = history.map((h) => Number(h.price_eur_mwh));
  const avg = prices.length
    ? prices.reduce((a, b) => a + b, 0) / prices.length
    : 0;
  const min30 = prices.length ? Math.min(...prices) : 0;
  const max30 = prices.length ? Math.max(...prices) : 0;

  const recent = history.slice(-14).reverse();

  return (
    <div className="flex flex-col gap-5">
      {/* HERO */}
      <section className="v2-bento">
        <div className="v2-card v2-col-4 p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div
              className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--v2-warn))" }}
            >
              PUN stimato oggi
            </div>
            <span
              className="v2-mono text-[10px]"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              {fmtDateFull(latest.price_day)}
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
              {pun.toFixed(1)}
            </span>
            <span
              className="v2-mono"
              style={{ fontSize: 18, fontWeight: 600, color: "hsl(var(--v2-text-dim))" }}
            >
              €/MWh
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {deltaWeek != null && (
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
              >
                {trendDir === "up" ? (
                  <TrendingUp className="w-3 h-3" />
                ) : trendDir === "down" ? (
                  <TrendingDown className="w-3 h-3" />
                ) : (
                  <ArrowUpRight className="w-3 h-3" />
                )}
                {deltaWeek >= 0 ? "+" : ""}
                {deltaWeek.toFixed(1)}% 7g
              </span>
            )}
            <span
              className="v2-mono text-[11px]"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              media pesata 7 zone ENTSO-E
            </span>
          </div>

          <div
            className="flex flex-col gap-2 pt-2"
            style={{ borderTop: "1px solid hsl(var(--v2-border))" }}
          >
            <RowKV
              label="Spread Nord-Sud"
              value={spread.toFixed(2)}
              unit="€/MWh"
              accent={spread > 15 ? "warn" : undefined}
            />
            <RowKV label="Media 90 giorni" value={avg.toFixed(1)} unit="€/MWh" />
            <RowKV label="Min 90g" value={min30.toFixed(1)} unit="€/MWh" accent="accent" />
            <RowKV label="Max 90g" value={max30.toFixed(1)} unit="€/MWh" accent="warn" />
          </div>
        </div>

        <div className="v2-card v2-col-8 p-5">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <div
                className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
                style={{ color: "hsl(var(--v2-warn))" }}
              >
                Andamento 90 giorni · €/MWh
              </div>
              <p
                className="text-[12.5px] mt-1"
                style={{ color: "hsl(var(--v2-text-dim))" }}
              >
                {first && (
                  <>
                    Dal {fmtDateShort(first.price_day)} a oggi · {history.length} giorni ·
                    fonte ENTSO-E
                  </>
                )}
              </p>
            </div>
          </div>
          <PunHistoryChart history={history} height={280} />
        </div>
      </section>

      {/* Breakdown zonale */}
      <section className="v2-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
        >
          <div>
            <div
              className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--v2-warn))" }}
            >
              Breakdown zone
            </div>
            <p className="text-[12.5px] mt-0.5" style={{ color: "hsl(var(--v2-text-dim))" }}>
              Prezzi medi giornalieri per zona · {fmtDateFull(latest.price_day)}
            </p>
          </div>
          <span className="v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            spread {spread.toFixed(1)} €/MWh
          </span>
        </div>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {Object.entries(ZONE_LABELS).map(([code, label]) => {
            const price = zones[code];
            const weight = ZONE_WEIGHTS[code] ?? 0;
            const isMin = minZ && code === minZ[0];
            const isMax = maxZ && code === maxZ[0];
            return (
              <div
                key={code}
                className="rounded-lg p-3 flex flex-col gap-1.5"
                style={{
                  background: isMin
                    ? "hsl(var(--v2-accent) / 0.08)"
                    : isMax
                      ? "hsl(var(--v2-warn) / 0.08)"
                      : "hsl(var(--v2-bg-elev))",
                  border: `1px solid ${
                    isMin
                      ? "hsl(var(--v2-accent) / 0.3)"
                      : isMax
                        ? "hsl(var(--v2-warn) / 0.3)"
                        : "hsl(var(--v2-border))"
                  }`,
                }}
              >
                <div
                  className="v2-mono text-[9.5px] font-bold uppercase tracking-[0.14em]"
                  style={{ color: "hsl(var(--v2-text-mute))" }}
                >
                  {label}
                </div>
                <div className="flex items-baseline gap-1">
                  <span
                    className="v2-mono"
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: isMin
                        ? "hsl(var(--v2-accent))"
                        : isMax
                          ? "hsl(var(--v2-warn))"
                          : "hsl(var(--v2-text))",
                      letterSpacing: "-0.01em",
                    }}
                  >
                    {price != null ? price.toFixed(1) : "—"}
                  </span>
                  <span
                    className="v2-mono text-[10px]"
                    style={{ color: "hsl(var(--v2-text-mute))" }}
                  >
                    €/MWh
                  </span>
                </div>
                <div
                  className="v2-mono text-[9.5px]"
                  style={{ color: "hsl(var(--v2-text-mute))" }}
                >
                  peso {(weight * 100).toFixed(0)}%
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tabella storica */}
      <section className="v2-card overflow-hidden">
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}
        >
          <div>
            <div
              className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em]"
              style={{ color: "hsl(var(--v2-warn))" }}
            >
              Ultimi 14 giorni
            </div>
            <p className="text-[12.5px] mt-0.5" style={{ color: "hsl(var(--v2-text-dim))" }}>
              PUN stimato + zone chiave
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
                <Th>PUN stimato</Th>
                <Th>Nord</Th>
                <Th>Sud</Th>
                <Th>Spread</Th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r, i) => {
                const rz = (r.zones as Record<string, number>) ?? {};
                const rNord = rz["IT-North"];
                const rSud = rz["IT-South"] ?? rz["IT-Sicily"];
                const rSpread =
                  rNord != null && rSud != null ? Math.abs(rNord - rSud) : null;
                return (
                  <tr
                    key={r.price_day}
                    style={{
                      borderBottom:
                        i < recent.length - 1
                          ? "1px solid hsl(var(--v2-border))"
                          : undefined,
                    }}
                  >
                    <td
                      className="px-4 py-2.5 text-[12.5px] font-medium"
                      style={{ color: "hsl(var(--v2-text))" }}
                    >
                      {fmtDateFull(r.price_day)}
                    </td>
                    <Td mono>{Number(r.price_eur_mwh).toFixed(2)}</Td>
                    <Td mono>{rNord != null ? rNord.toFixed(1) : "—"}</Td>
                    <Td mono>{rSud != null ? rSud.toFixed(1) : "—"}</Td>
                    <Td
                      mono
                      color={
                        rSpread != null && rSpread > 15
                          ? "hsl(var(--v2-warn))"
                          : undefined
                      }
                    >
                      {rSpread != null ? rSpread.toFixed(1) : "—"}
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Info box */}
      <section
        className="v2-card p-5 flex items-start gap-3"
        style={{
          borderColor: "hsl(var(--v2-info) / 0.22)",
          background: "hsl(var(--v2-info) / 0.04)",
        }}
      >
        <Info
          className="w-4 h-4 shrink-0 mt-0.5"
          style={{ color: "hsl(var(--v2-info))" }}
        />
        <div
          className="text-[12.5px] leading-relaxed"
          style={{ color: "hsl(var(--v2-text-dim))" }}
        >
          <strong style={{ color: "hsl(var(--v2-text))" }}>Come leggere questi dati.</strong>{" "}
          Il PUN mostrato è una stima calcolata come media pesata dei prezzi MGP delle 7
          zone bidding italiane, con pesi basati sulla quota di fabbisogno Terna (Nord 47%,
          Centro-Nord 11%, Centro-Sud 13%, Sud 14%, Sicilia 6%, Sardegna 4%, Calabria 5%).
          Errore tipico vs PUN ufficiale GME: <strong>&lt; 5%</strong>. Fonte dati: Fraunhofer
          ISE via ENTSO-E Transparency Platform. Spread Nord-Sud &gt; 15 €/MWh indica
          congestioni di rete. Il PUN ufficiale GME sarà integrato appena approvata la
          richiesta API ENTSO-E.
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
      className={
        mono
          ? "v2-mono px-4 py-2.5 text-[12.5px] text-right"
          : "px-4 py-2.5 text-[12.5px] text-right"
      }
      style={{
        color: color ?? "hsl(var(--v2-text))",
        fontVariantNumeric: "tabular-nums",
      }}
    >
      {children}
    </td>
  );
}
