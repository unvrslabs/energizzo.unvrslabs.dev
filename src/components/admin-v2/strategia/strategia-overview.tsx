import { Archive, CheckCircle2, CircleDot, Flag, Target } from "lucide-react";
import { ProgressRing } from "@/components/admin-v2/viz/progress-ring";
import { CountUp } from "@/components/admin-v2/viz/count-up";

type Priority = "P0" | "P1" | "P2";

const PRIO_META: Record<
  Priority,
  { label: string; color: string; icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }> }
> = {
  P0: {
    label: "P0 · Subito",
    color: "hsl(var(--v2-danger))",
    icon: Flag,
  },
  P1: {
    label: "P1 · Parallelo",
    color: "hsl(var(--v2-warn))",
    icon: Flag,
  },
  P2: {
    label: "P2 · Scaling",
    color: "hsl(var(--v2-info))",
    icon: Flag,
  },
};

export type StrategiaOverviewData = {
  total: number;
  fatto: number;
  inCorso: number;
  daFare: number;
  archiviato: number;
  byPriority: Record<Priority, { total: number; fatto: number; inCorso: number }>;
};

export function StrategiaOverview({ data }: { data: StrategiaOverviewData }) {
  const completedPct =
    data.total > 0 ? (data.fatto / data.total) * 100 : 0;

  return (
    <div className="v2-card" style={{ padding: 0, overflow: "hidden" }}>
      {/* Header */}
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
          <Target
            className="w-3.5 h-3.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          />
          <span className="v2-card-title">Esecuzione tattiche GTM</span>
        </div>
        <div
          className="v2-mono"
          style={{
            fontSize: 10.5,
            color: "hsl(var(--v2-text-mute))",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
          }}
        >
          <CountUp value={data.fatto} suffix={` / ${data.total} consegnate`} />
        </div>
      </div>

      {/* Body 3 col: Progress ring | Status breakdown | Priority breakdown */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1fr) minmax(0, 1.2fr)",
          gap: 1,
          background: "hsl(var(--v2-border))",
        }}
      >
        {/* Col 1: Progress ring */}
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
            value={Math.round(completedPct)}
            total={100}
            size={140}
            variant="accent"
            label="Completamento piano"
          />
          <div
            className="v2-mono"
            style={{
              fontSize: 10.5,
              color: "hsl(var(--v2-text-mute))",
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              textAlign: "center",
            }}
          >
            {data.fatto} su {data.total} tattiche
          </div>
        </div>

        {/* Col 2: Status breakdown (mini stats) */}
        <div
          style={{
            background: "hsl(var(--v2-card))",
            padding: "20px 18px",
            display: "flex",
            flexDirection: "column",
            gap: 12,
            justifyContent: "center",
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
            Status tattiche
          </div>
          <StatusRow
            icon={<CircleDot className="w-3.5 h-3.5" />}
            label="In corso"
            value={data.inCorso}
            total={data.total}
            color="hsl(var(--v2-warn))"
          />
          <StatusRow
            icon={<CheckCircle2 className="w-3.5 h-3.5" />}
            label="Completate"
            value={data.fatto}
            total={data.total}
            color="hsl(var(--v2-accent))"
          />
          <StatusRow
            icon={<Flag className="w-3.5 h-3.5" />}
            label="Da fare"
            value={data.daFare}
            total={data.total}
            color="hsl(var(--v2-text-dim))"
          />
          {data.archiviato > 0 && (
            <StatusRow
              icon={<Archive className="w-3.5 h-3.5" />}
              label="Archiviate"
              value={data.archiviato}
              total={data.total}
              color="hsl(var(--v2-text-mute))"
            />
          )}
        </div>

        {/* Col 3: Priority breakdown */}
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
            Per priorità
          </div>
          {(["P0", "P1", "P2"] as Priority[]).map((p) => {
            const meta = PRIO_META[p];
            const counts = data.byPriority[p] ?? { total: 0, fatto: 0, inCorso: 0 };
            const Icon = meta.icon;
            const pct = counts.total > 0 ? (counts.fatto / counts.total) * 100 : 0;
            return (
              <div
                key={p}
                style={{
                  display: "grid",
                  gridTemplateColumns: "120px 1fr 60px",
                  gap: 10,
                  alignItems: "center",
                }}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" style={{ color: meta.color }} />
                  <span
                    style={{
                      fontSize: 11.5,
                      fontWeight: 600,
                      color: "hsl(var(--v2-text))",
                    }}
                  >
                    {meta.label}
                  </span>
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
                      boxShadow: counts.fatto > 0 ? `0 0 8px ${meta.color}66` : "none",
                      transition: "width 600ms ease",
                    }}
                  />
                </div>
                <span
                  className="v2-mono"
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: "hsl(var(--v2-text))",
                    textAlign: "right",
                    letterSpacing: "0.04em",
                  }}
                >
                  <CountUp value={counts.fatto} />/{counts.total}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatusRow({
  icon,
  label,
  value,
  total,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "16px 1fr auto",
        alignItems: "center",
        gap: 10,
      }}
    >
      <span style={{ color, display: "inline-flex" }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 3,
          }}
        >
          <span
            style={{
              fontSize: 12,
              color: "hsl(var(--v2-text))",
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          <span
            className="v2-mono"
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "hsl(var(--v2-text))",
            }}
          >
            <CountUp value={value} />
          </span>
        </div>
        <div
          style={{
            height: 4,
            borderRadius: 2,
            background: "hsl(var(--v2-bg))",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${pct}%`,
              background: color,
              transition: "width 600ms ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}
