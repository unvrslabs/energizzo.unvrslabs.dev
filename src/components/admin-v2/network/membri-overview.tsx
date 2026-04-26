import { Crown, MapPin, Sparkles, UserCheck, Users } from "lucide-react";
import { ProgressRing } from "@/components/admin-v2/viz/progress-ring";
import { Sparkline } from "@/components/admin-v2/viz/sparkline";
import { CountUp } from "@/components/admin-v2/viz/count-up";

const NETWORK_CAP = 100;

type TierKey = "founder" | "pioneer" | "early" | "member";

const TIER_META: Record<
  TierKey,
  { label: string; range: string; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
> = {
  founder: { label: "Founder", range: "1–10", color: "hsl(var(--v2-accent))", icon: Crown },
  pioneer: { label: "Pioneer", range: "11–30", color: "hsl(var(--v2-info))", icon: Sparkles },
  early: { label: "Early", range: "31–60", color: "hsl(var(--v2-warn))", icon: Users },
  member: { label: "Member", range: "61+", color: "hsl(var(--v2-text-dim))", icon: UserCheck },
};

const TIER_ORDER: TierKey[] = ["founder", "pioneer", "early", "member"];

export type MembriOverviewData = {
  total: number;
  active: number;
  revoked: number;
  tierCounts: Record<TierKey, number>;
  approvedSpark14: number[];
  topProvinces: Array<{ name: string; count: number }>;
  approvedThisMonth: number;
  approvedPrevMonth: number;
};

export function MembriOverview({ data }: { data: MembriOverviewData }) {
  const capPct = (data.active / NETWORK_CAP) * 100;
  const approvedDelta = data.approvedThisMonth - data.approvedPrevMonth;
  const tierMax = Math.max(...Object.values(data.tierCounts), 1);
  const provinceMax = Math.max(...data.topProvinces.map((p) => p.count), 1);

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
          <UserCheck
            className="w-3.5 h-3.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          />
          <span className="v2-card-title">Network attivo</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            flexWrap: "wrap",
          }}
        >
          {data.approvedSpark14.some((v) => v > 0) && (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                className="v2-mono"
                style={{
                  fontSize: 9.5,
                  color: "hsl(var(--v2-text-mute))",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                }}
              >
                Approvati 14gg
              </span>
              <Sparkline
                data={data.approvedSpark14}
                width={80}
                height={22}
                variant="accent"
              />
            </div>
          )}
          {approvedDelta !== 0 && (
            <span
              className={`v2-delta v2-delta--${
                approvedDelta > 0 ? "up" : "down"
              }`}
              style={{ fontSize: 10.5 }}
            >
              {approvedDelta > 0 ? `+${approvedDelta} mese` : `${approvedDelta} mese`}
            </span>
          )}
        </div>
      </div>

      {/* Body: 3 colonne — Capienza | Tier | Province */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1.2fr) minmax(0, 1.4fr)",
          gap: 1,
          background: "hsl(var(--v2-border))",
        }}
      >
        {/* Col 1: Capienza */}
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
            value={data.active}
            total={NETWORK_CAP}
            size={140}
            variant="accent"
            label="Capienza network"
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
            <CountUp value={Math.round(capPct)} suffix="% del cap" />
          </div>
        </div>

        {/* Col 2: Tier breakdown */}
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
            }}
          >
            Distribuzione tier
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {TIER_ORDER.map((k) => {
              const meta = TIER_META[k];
              const count = data.tierCounts[k] ?? 0;
              const pct = (count / tierMax) * 100;
              const Icon = meta.icon;
              return (
                <div
                  key={k}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "16px 100px 1fr 30px",
                    gap: 10,
                    alignItems: "center",
                  }}
                >
                  <Icon
                    className="w-3.5 h-3.5"
                    style={{ color: meta.color }}
                  />
                  <div style={{ minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 600,
                        color: "hsl(var(--v2-text))",
                        lineHeight: 1.2,
                      }}
                    >
                      {meta.label}
                    </div>
                    <div
                      className="v2-mono"
                      style={{
                        fontSize: 9.5,
                        color: "hsl(var(--v2-text-mute))",
                        letterSpacing: "0.1em",
                      }}
                    >
                      {meta.range}
                    </div>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: "hsl(var(--v2-bg))",
                      border: "1px solid hsl(var(--v2-border))",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${pct}%`,
                        background: `linear-gradient(90deg, ${meta.color}aa, ${meta.color})`,
                        boxShadow: count > 0 ? `0 0 8px ${meta.color}66` : "none",
                        transition: "width 600ms ease",
                      }}
                    />
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

        {/* Col 3: Top province */}
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
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
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
              <MapPin className="w-3 h-3" /> Distribuzione geografica
            </div>
            <span
              className="v2-mono"
              style={{
                fontSize: 9.5,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.14em",
              }}
            >
              {data.topProvinces.length} prov.
            </span>
          </div>
          {data.topProvinces.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "grid",
                placeItems: "center",
                color: "hsl(var(--v2-text-mute))",
                fontSize: 11.5,
                textAlign: "center",
                padding: 20,
              }}
            >
              Nessuna provincia mappata
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              {data.topProvinces.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 30px",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <span
                    className="v2-mono"
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "hsl(var(--v2-text))",
                      letterSpacing: "0.06em",
                    }}
                  >
                    {p.name.toUpperCase()}
                  </span>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 4,
                      background: "hsl(var(--v2-bg))",
                      border: "1px solid hsl(var(--v2-border))",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${(p.count / provinceMax) * 100}%`,
                        background:
                          "linear-gradient(90deg, hsl(var(--v2-info) / 0.7), hsl(var(--v2-info)))",
                        boxShadow: "0 0 8px hsl(var(--v2-info) / 0.4)",
                        transition: "width 600ms ease",
                      }}
                    />
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
                    <CountUp value={p.count} />
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Tier in base all'invite_number progressivo.
 */
export function tierFromInviteNumber(n: number | null): TierKey {
  if (n === null) return "member";
  if (n <= 10) return "founder";
  if (n <= 30) return "pioneer";
  if (n <= 60) return "early";
  return "member";
}
