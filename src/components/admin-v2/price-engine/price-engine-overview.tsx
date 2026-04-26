import { FileText, Flame, Send, Zap } from "lucide-react";
import { ProgressRing } from "@/components/admin-v2/viz/progress-ring";
import { Sparkline } from "@/components/admin-v2/viz/sparkline";
import { CountUp } from "@/components/admin-v2/viz/count-up";

export type PriceEngineOverviewData = {
  total: number;
  luce: number;
  gas: number;
  published: number;
  draft: number;
  // Sparkline 12 mesi: report pubblicati per mese
  publishedSpark12m: number[];
};

export function PriceEngineOverview({ data }: { data: PriceEngineOverviewData }) {
  const publishPct = data.total > 0 ? (data.published / data.total) * 100 : 0;

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
          <FileText
            className="w-3.5 h-3.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          />
          <span className="v2-card-title">Report mensili pricing</span>
        </div>
        {data.publishedSpark12m.some((v) => v > 0) && (
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
              Pubblicati 12 mesi
            </span>
            <Sparkline
              data={data.publishedSpark12m}
              width={100}
              height={24}
              variant="accent"
            />
          </div>
        )}
      </div>

      {/* Body 3 col: ProgressRing | Categoria split | Quick stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(220px, 280px) minmax(0, 1.2fr) minmax(0, 1fr)",
          gap: 1,
          background: "hsl(var(--v2-border))",
        }}
      >
        {/* Col 1: Ring pubblicati / totali */}
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
            value={Math.round(publishPct)}
            total={100}
            size={140}
            variant="accent"
            label="Tasso pubblicazione"
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
            <CountUp value={data.published} suffix={` su ${data.total}`} />
          </div>
        </div>

        {/* Col 2: Categoria breakdown */}
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
            Per categoria
          </div>
          <CategoryBar
            icon={<Zap className="w-4 h-4" />}
            label="Energia elettrica"
            value={data.luce}
            total={Math.max(data.luce + data.gas, 1)}
            color="hsl(var(--v2-warn))"
          />
          <CategoryBar
            icon={<Flame className="w-4 h-4" />}
            label="Gas naturale"
            value={data.gas}
            total={Math.max(data.luce + data.gas, 1)}
            color="hsl(var(--v2-info))"
          />
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
            icon={<FileText className="w-4 h-4" />}
            label="Report totali"
            value={data.total}
            tint="info"
          />
          <QuickStat
            icon={<Send className="w-4 h-4" />}
            label="Pubblicati"
            value={data.published}
            tint="accent"
          />
          {data.draft > 0 && (
            <QuickStat
              icon={<FileText className="w-4 h-4" />}
              label="In bozza"
              value={data.draft}
              tint="warn"
            />
          )}
        </div>
      </div>
    </div>
  );
}

function CategoryBar({
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
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div className="flex items-center gap-2">
          <span style={{ color }}>{icon}</span>
          <span
            style={{
              fontSize: 12.5,
              color: "hsl(var(--v2-text))",
              fontWeight: 600,
            }}
          >
            {label}
          </span>
        </div>
        <span
          className="v2-mono"
          style={{
            fontSize: 12.5,
            fontWeight: 700,
            color: "hsl(var(--v2-text))",
          }}
        >
          <CountUp value={value} />
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
            background: `linear-gradient(90deg, ${color}aa, ${color})`,
            boxShadow: value > 0 ? `0 0 8px ${color}66` : "none",
            transition: "width 600ms ease",
          }}
        />
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
  tint: "accent" | "info" | "warn";
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
