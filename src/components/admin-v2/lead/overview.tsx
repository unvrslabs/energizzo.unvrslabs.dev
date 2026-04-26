import {
  Activity,
  ArrowDown,
  Calendar,
  Trophy,
  Users,
} from "lucide-react";
import { KpiTile } from "@/components/admin-v2/viz/kpi-tile";
import { Donut, type DonutSlice } from "@/components/admin-v2/viz/donut";
import { ProgressRing } from "@/components/admin-v2/viz/progress-ring";
import { CountUp } from "@/components/admin-v2/viz/count-up";
import { STATUS_CONFIG, type Status } from "@/lib/status-config";

const PIPELINE_FUNNEL_ORDER: Status[] = [
  "primo_contatto",
  "qualificato",
  "call_fissata",
  "call_effettuata",
  "demo_fissata",
  "demo_effettuata",
  "proposta_inviata",
  "negoziazione",
  "chiuso_vinto",
];

export type LeadOverviewData = {
  total: number;
  inPipeline: number;
  demoDone: number;
  won: number;
  // Sparkline series (ultimi 14 punti)
  leadsSpark14: number[];
  wonSpark14: number[];
  // Status counts per funnel
  statusCounts: Record<Status, number>;
  // Distribuzione tipo servizio
  tipoServizioSlices: DonutSlice[];
  // Conversion 30gg (won_30 / leads_30)
  conversion30Won: number;
  conversion30Total: number;
  // Delta won mese
  wonThisMonth: number;
  wonPrevMonth: number;
};

export function LeadOverview({ data }: { data: LeadOverviewData }) {
  const conversionPct =
    data.conversion30Total > 0
      ? (data.conversion30Won / data.conversion30Total) * 100
      : 0;
  const wonDelta = data.wonThisMonth - data.wonPrevMonth;
  const wonTrend: "up" | "down" | "flat" =
    wonDelta > 0 ? "up" : wonDelta < 0 ? "down" : "flat";

  return (
    <div className="flex flex-col gap-5">
      {/* KPI tiles 4 colonne */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <KpiTile
          code="TOTALE"
          label="Lead in pipeline"
          value={data.total}
          spark={data.leadsSpark14}
          variant="info"
          icon={<Users className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="ATTIVI"
          label="In lavorazione"
          value={data.inPipeline}
          variant="warn"
          icon={<Activity className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="DEMO"
          label="Demo effettuate"
          value={data.demoDone}
          variant="accent"
          icon={<Calendar className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="WON"
          label="Chiusi vinti"
          value={data.won}
          delta={
            wonDelta === 0
              ? "—"
              : wonDelta > 0
                ? `+${wonDelta} mese`
                : `${wonDelta} mese`
          }
          trend={wonTrend}
          spark={data.wonSpark14}
          variant="accent"
          icon={<Trophy className="w-3.5 h-3.5" />}
        />
      </section>

      {/* Funnel pipeline 9-stage + ProgressRing conversione + Donut tipo servizio */}
      <section className="v2-bento">
        <div className="v2-card v2-col-6">
          <div className="v2-card-head flex items-center gap-2">
            <ArrowDown
              className="w-3.5 h-3.5"
              style={{ color: "hsl(var(--v2-accent))" }}
            />
            <span className="v2-card-title">Funnel pipeline</span>
          </div>
          <div style={{ padding: "14px 18px" }}>
            <PipelineFunnel statusCounts={data.statusCounts} />
          </div>
        </div>

        <div className="v2-card v2-col-3">
          <div className="v2-card-head flex items-center gap-2">
            <Trophy
              className="w-3.5 h-3.5"
              style={{ color: "hsl(var(--v2-accent))" }}
            />
            <span className="v2-card-title">Conversione 30gg</span>
          </div>
          <div
            style={{
              padding: 16,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <ProgressRing
              value={Math.round(conversionPct)}
              total={100}
              size={130}
              variant="accent"
              label="Won / nuovi lead"
            />
            <div
              className="v2-mono"
              style={{
                fontSize: 10.5,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
              }}
            >
              {data.conversion30Won} / {data.conversion30Total}
            </div>
          </div>
        </div>

        <div className="v2-card v2-col-3">
          <div className="v2-card-head flex items-center gap-2">
            <Users
              className="w-3.5 h-3.5"
              style={{ color: "hsl(var(--v2-info))" }}
            />
            <span className="v2-card-title">Tipo servizio</span>
          </div>
          <div style={{ padding: 14 }}>
            {data.tipoServizioSlices.length === 0 ? (
              <div
                className="v2-mono"
                style={{
                  fontSize: 11,
                  color: "hsl(var(--v2-text-mute))",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                Nessun dato
              </div>
            ) : (
              <Donut
                slices={data.tipoServizioSlices}
                size={120}
                centerValue={data.tipoServizioSlices.reduce(
                  (s, x) => s + x.value,
                  0,
                )}
                centerLabel="lead"
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Funnel pipeline a 9 stadi (escludiamo chiuso_perso e non_interessato dal
 * funnel principale). Ogni barra rappresenta uno stage: la lunghezza è
 * proporzionale al MAX (primo stadio o stadio più popolato), e a destra
 * mostriamo il drop-off% rispetto allo stadio precedente.
 */
function PipelineFunnel({
  statusCounts,
}: {
  statusCounts: Record<Status, number>;
}) {
  const max = Math.max(
    ...PIPELINE_FUNNEL_ORDER.map((s) => statusCounts[s] ?? 0),
    1,
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {PIPELINE_FUNNEL_ORDER.map((status, i) => {
        const count = statusCounts[status] ?? 0;
        const cfg = STATUS_CONFIG[status];
        const widthPct = (count / max) * 100;
        const prevCount =
          i > 0 ? statusCounts[PIPELINE_FUNNEL_ORDER[i - 1]] ?? 0 : null;
        const conv =
          prevCount && prevCount > 0
            ? (count / prevCount) * 100
            : null;

        const isWon = status === "chiuso_vinto";

        return (
          <div
            key={status}
            style={{
              display: "grid",
              gridTemplateColumns: "150px 1fr 60px",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "hsl(var(--v2-text-dim))",
                textTransform: "capitalize",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
              title={cfg?.label ?? status}
            >
              {cfg?.label ?? status.replace(/_/g, " ")}
            </div>
            <div
              style={{
                position: "relative",
                height: 18,
                background: "hsl(var(--v2-card))",
                border: "1px solid hsl(var(--v2-border))",
                borderRadius: 4,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  width: `${widthPct}%`,
                  background: isWon
                    ? "linear-gradient(90deg, hsl(var(--v2-accent) / 0.7), hsl(var(--v2-accent)))"
                    : `linear-gradient(90deg, ${
                        cfg?.color ?? "hsl(var(--v2-text-dim))"
                      }cc, ${cfg?.color ?? "hsl(var(--v2-text-dim))"})`,
                  transition: "width 600ms ease",
                  boxShadow: isWon
                    ? "0 0 12px hsl(var(--v2-accent) / 0.5)"
                    : "none",
                }}
              />
              <span
                className="v2-mono"
                style={{
                  position: "absolute",
                  left: 8,
                  top: "50%",
                  transform: "translateY(-50%)",
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: "hsl(var(--v2-text))",
                  textShadow: "0 0 4px hsl(0 0% 0% / 0.5)",
                }}
              >
                <CountUp value={count} />
              </span>
              {conv !== null && i > 0 && (
                <span
                  className="v2-mono"
                  style={{
                    position: "absolute",
                    right: 8,
                    top: "50%",
                    transform: "translateY(-50%)",
                    fontSize: 9.5,
                    fontWeight: 700,
                    color: conv >= 50 ? "hsl(var(--v2-accent))" : "hsl(var(--v2-warn))",
                    background: "hsl(var(--v2-bg-elev) / 0.8)",
                    padding: "1px 5px",
                    borderRadius: 3,
                    letterSpacing: "0.06em",
                  }}
                >
                  {conv.toFixed(0)}%
                </span>
              )}
            </div>
            <div
              className="v2-mono"
              style={{
                fontSize: 10.5,
                color: "hsl(var(--v2-text-mute))",
                textAlign: "right",
                letterSpacing: "0.06em",
              }}
            >
              {widthPct.toFixed(0)}%
            </div>
          </div>
        );
      })}
    </div>
  );
}
