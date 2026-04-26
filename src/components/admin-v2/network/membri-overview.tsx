import { Crown, MapPin, Sparkles, UserCheck, Users } from "lucide-react";
import { KpiTile } from "@/components/admin-v2/viz/kpi-tile";
import { Donut, type DonutSlice } from "@/components/admin-v2/viz/donut";
import { ProgressRing } from "@/components/admin-v2/viz/progress-ring";
import { CountUp } from "@/components/admin-v2/viz/count-up";

const NETWORK_CAP = 100;

type TierKey = "founder" | "pioneer" | "early" | "member";

const TIER_META: Record<
  TierKey,
  { label: string; range: string; color: string; variant: "accent" | "info" | "warn" | "danger" }
> = {
  founder: { label: "Founder", range: "1–10", color: "hsl(var(--v2-accent))", variant: "accent" },
  pioneer: { label: "Pioneer", range: "11–30", color: "hsl(var(--v2-info))", variant: "info" },
  early: { label: "Early", range: "31–60", color: "hsl(var(--v2-warn))", variant: "warn" },
  member: { label: "Member", range: "61+", color: "hsl(var(--v2-text-dim))", variant: "accent" },
};

export type MembriOverviewData = {
  total: number;
  active: number;
  revoked: number;
  // Tier distribution: count per tier
  tierCounts: Record<TierKey, number>;
  // Sparkline 30gg approvati/giorno (ultimi 14 punti)
  approvedSpark14: number[];
  // Top province: [name, count][]
  topProvinces: Array<{ name: string; count: number }>;
  // Approvati nuovi questo mese vs precedente
  approvedThisMonth: number;
  approvedPrevMonth: number;
};

export function MembriOverview({ data }: { data: MembriOverviewData }) {
  const tierSlices: DonutSlice[] = (Object.keys(TIER_META) as TierKey[])
    .map((k) => ({
      label: TIER_META[k].label,
      value: data.tierCounts[k] ?? 0,
      color: TIER_META[k].color,
    }))
    .filter((s) => s.value > 0);

  const approvedDelta = data.approvedThisMonth - data.approvedPrevMonth;
  const approvedTrend: "up" | "down" | "flat" =
    approvedDelta > 0 ? "up" : approvedDelta < 0 ? "down" : "flat";

  const provinceMax = Math.max(...data.topProvinces.map((p) => p.count), 1);

  return (
    <div className="flex flex-col gap-5">
      {/* KPI: 4 tier + cap progress */}
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: 14,
        }}
      >
        <KpiTile
          code="ATTIVI"
          label="Membri network attivi"
          value={data.active}
          delta={
            approvedDelta === 0
              ? "—"
              : approvedDelta > 0
                ? `+${approvedDelta} mese`
                : `${approvedDelta} mese`
          }
          trend={approvedTrend}
          spark={data.approvedSpark14}
          variant="accent"
          icon={<UserCheck className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="FOUNDER"
          label="Tier 1–10"
          value={data.tierCounts.founder}
          variant="accent"
          icon={<Crown className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="PIONEER"
          label="Tier 11–30"
          value={data.tierCounts.pioneer}
          variant="info"
          icon={<Sparkles className="w-3.5 h-3.5" />}
        />
        <KpiTile
          code="EARLY"
          label="Tier 31–60"
          value={data.tierCounts.early}
          variant="warn"
          icon={<Users className="w-3.5 h-3.5" />}
        />
      </section>

      {/* Donut tier + Cap progress + Top province */}
      <section className="v2-bento">
        {/* Cap progress ring */}
        <div className="v2-card v2-col-3">
          <div className="v2-card-head flex items-center gap-2">
            <UserCheck
              className="w-3.5 h-3.5"
              style={{ color: "hsl(var(--v2-accent))" }}
            />
            <span className="v2-card-title">Capienza network</span>
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
              value={data.active}
              total={NETWORK_CAP}
              size={140}
              variant="accent"
              label={`Slot occupati`}
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
              {((data.active / NETWORK_CAP) * 100).toFixed(0)}% del cap
            </div>
          </div>
        </div>

        {/* Donut tier */}
        <div className="v2-card v2-col-4">
          <div className="v2-card-head flex items-center gap-2">
            <Crown
              className="w-3.5 h-3.5"
              style={{ color: "hsl(var(--v2-accent))" }}
            />
            <span className="v2-card-title">Distribuzione per tier</span>
          </div>
          <div style={{ padding: 16 }}>
            {tierSlices.length === 0 ? (
              <div
                className="v2-mono"
                style={{
                  fontSize: 11,
                  color: "hsl(var(--v2-text-mute))",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                Nessun membro
              </div>
            ) : (
              <Donut
                slices={tierSlices}
                size={150}
                centerValue={data.active}
                centerLabel="membri"
              />
            )}
          </div>
        </div>

        {/* Top province bar chart */}
        <div className="v2-card v2-col-5">
          <div className="v2-card-head flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin
                className="w-3.5 h-3.5"
                style={{ color: "hsl(var(--v2-info))" }}
              />
              <span className="v2-card-title">Top province</span>
            </div>
            <span
              className="v2-mono"
              style={{
                fontSize: 10,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
              }}
            >
              {data.topProvinces.length} prov.
            </span>
          </div>
          <div style={{ padding: "14px 18px", display: "flex", flexDirection: "column", gap: 8 }}>
            {data.topProvinces.length === 0 ? (
              <div
                className="v2-mono"
                style={{
                  fontSize: 11,
                  color: "hsl(var(--v2-text-mute))",
                  textAlign: "center",
                  padding: 20,
                }}
              >
                Nessuna provincia mappata
              </div>
            ) : (
              data.topProvinces.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr 36px",
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
                      background: "hsl(var(--v2-card))",
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
                      fontSize: 11.5,
                      fontWeight: 700,
                      color: "hsl(var(--v2-text))",
                      textAlign: "right",
                    }}
                  >
                    <CountUp value={p.count} />
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

/**
 * Calcola il tier in base all'invite_number progressivo.
 */
export function tierFromInviteNumber(n: number | null): TierKey {
  if (n === null) return "member";
  if (n <= 10) return "founder";
  if (n <= 30) return "pioneer";
  if (n <= 60) return "early";
  return "member";
}
