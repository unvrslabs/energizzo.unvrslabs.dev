import { ArrowDown, Mic, Radio, UserCheck, Users } from "lucide-react";
import { ProgressRing } from "@/components/admin-v2/viz/progress-ring";
import { Sparkline } from "@/components/admin-v2/viz/sparkline";
import { CountUp } from "@/components/admin-v2/viz/count-up";
import {
  GUEST_STATUS_CONFIG,
  type GuestStatus,
} from "@/lib/podcast-config";

const PUBLISH_TARGET = 50;

const FUNNEL_ORDER: GuestStatus[] = [
  "target",
  "invited",
  "confirmed",
  "recorded",
  "published",
];

export type PodcastOverviewData = {
  total: number;
  target: number;
  invited: number;
  confirmed: number;
  recorded: number;
  published: number;
  rejected: number;
  // Sparkline 12 settimane: pubblicazioni/settimana
  publishedSpark12w: number[];
};

export function PodcastOverview({ data }: { data: PodcastOverviewData }) {
  const funnelMax = Math.max(
    ...FUNNEL_ORDER.map((s) => data[s as keyof PodcastOverviewData] as number),
    1,
  );

  return (
    <div className="v2-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header riga unica */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 20px",
          borderBottom: "1px solid hsl(var(--v2-border))",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div className="flex items-center gap-2">
          <Mic
            className="w-3.5 h-3.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          />
          <span className="v2-card-title">Podcast pipeline</span>
        </div>
        {data.publishedSpark12w.some((v) => v > 0) && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              className="v2-mono"
              style={{
                fontSize: 9.5,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
              }}
            >
              Pubblicati 12 settimane
            </span>
            <Sparkline
              data={data.publishedSpark12w}
              width={100}
              height={24}
              variant="accent"
            />
          </div>
        )}
      </div>

      {/* Body: 3 colonne — Target raggiunto | Funnel | Quick stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1.4fr) minmax(0, 1fr)",
          gap: 1,
          background: "hsl(var(--v2-border))",
        }}
      >
        {/* Col 1: Target progress */}
        <div
          style={{
            background: "hsl(var(--v2-card))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <ProgressRing
            value={data.published}
            total={PUBLISH_TARGET}
            size={140}
            variant="accent"
            label="Episodi pubblicati"
            showPercent={false}
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
            <CountUp
              value={Math.round((data.published / PUBLISH_TARGET) * 100)}
              suffix={`% del target ${PUBLISH_TARGET}`}
            />
          </div>
        </div>

        {/* Col 2: Funnel ospite */}
        <div
          style={{
            background: "hsl(var(--v2-card))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
          }}
        >
          <div
            className="v2-mono"
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-text-mute))",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <ArrowDown className="w-3 h-3" /> Funnel ospite
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {FUNNEL_ORDER.map((status, i) => {
              const cfg = GUEST_STATUS_CONFIG[status];
              const count =
                (data[status as keyof PodcastOverviewData] as number) ?? 0;
              const widthPct = (count / funnelMax) * 100;
              const prevCount =
                i > 0
                  ? (data[FUNNEL_ORDER[i - 1] as keyof PodcastOverviewData] as number)
                  : null;
              const conv =
                prevCount && prevCount > 0
                  ? (count / prevCount) * 100
                  : null;
              const isPublished = status === "published";

              return (
                <div
                  key={status}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "85px 1fr 28px",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "hsl(var(--v2-text))",
                    }}
                  >
                    {cfg.label}
                  </span>
                  <div
                    style={{
                      position: "relative",
                      height: 16,
                      background: "hsl(var(--v2-bg))",
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
                        background: `linear-gradient(90deg, ${cfg.color}aa, ${cfg.color})`,
                        boxShadow:
                          isPublished && count > 0
                            ? `0 0 12px ${cfg.color}88`
                            : "none",
                        transition: "width 600ms ease",
                      }}
                    />
                    {conv !== null && i > 0 && count > 0 && (
                      <span
                        className="v2-mono"
                        style={{
                          position: "absolute",
                          right: 6,
                          top: "50%",
                          transform: "translateY(-50%)",
                          fontSize: 9.5,
                          fontWeight: 700,
                          color:
                            conv >= 50
                              ? "hsl(var(--v2-accent))"
                              : "hsl(var(--v2-warn))",
                          background: "hsl(var(--v2-bg-elev) / 0.85)",
                          padding: "0 4px",
                          borderRadius: 3,
                          letterSpacing: "0.04em",
                        }}
                      >
                        {conv.toFixed(0)}%
                      </span>
                    )}
                  </div>
                  <span
                    className="v2-mono"
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: "hsl(var(--v2-text))",
                      textAlign: "right",
                    }}
                  >
                    <CountUp value={count} />
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 3: Quick stats */}
        <div
          style={{
            background: "hsl(var(--v2-card))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            justifyContent: "center",
          }}
        >
          <QuickStat
            icon={<Users className="w-4 h-4" />}
            label="Ospiti totali"
            value={data.total}
            tint="info"
          />
          <QuickStat
            icon={<UserCheck className="w-4 h-4" />}
            label="In agenda registrazione"
            value={data.confirmed + data.recorded}
            tint="warn"
          />
          <QuickStat
            icon={<Radio className="w-4 h-4" />}
            label="Episodi live"
            value={data.published}
            tint="accent"
          />
          {data.rejected > 0 && (
            <QuickStat
              icon={<Users className="w-4 h-4" />}
              label="Rifiutati"
              value={data.rejected}
              tint="danger"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function QuickStat({
  icon,
  label,
  value,
  tint,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tint: "accent" | "info" | "warn" | "danger";
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 8,
          display: "grid",
          placeItems: "center",
          background: `hsl(var(--v2-${tint}) / 0.14)`,
          color: `hsl(var(--v2-${tint}))`,
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          className="v2-mono"
          style={{
            fontSize: 9.5,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "hsl(var(--v2-text-mute))",
            marginBottom: 2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontFamily: "var(--font-mono), monospace",
            fontSize: 22,
            fontWeight: 700,
            color: "hsl(var(--v2-text))",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          <CountUp value={value} />
        </div>
      </div>
    </div>
  );
}
