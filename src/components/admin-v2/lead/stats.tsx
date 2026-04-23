import { Activity, Calendar, Trophy, Users } from "lucide-react";

type Stats = {
  total: number;
  inPipeline: number;
  demoDone: number;
  won: number;
};

export function LeadStatsV2({ stats }: { stats: Stats }) {
  return (
    <div className="v2-ticker-row" style={{ gridTemplateColumns: "repeat(4, minmax(0, 1fr))" }}>
      <Cell code="TOTALE" label="Lead in pipeline" value={stats.total} icon={<Users />} tint="info" />
      <Cell code="ATTIVI" label="In lavorazione" value={stats.inPipeline} icon={<Activity />} tint="warn" />
      <Cell code="DEMO" label="Demo effettuate" value={stats.demoDone} icon={<Calendar />} tint="accent" />
      <Cell code="WON" label="Chiusi vinti" value={stats.won} icon={<Trophy />} tint="accent" />
    </div>
  );
}

function Cell({
  code,
  label,
  value,
  icon,
  tint,
}: {
  code: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  tint: "accent" | "warn" | "info" | "danger";
}) {
  const color =
    tint === "warn"
      ? "hsl(var(--v2-warn))"
      : tint === "info"
      ? "hsl(var(--v2-info))"
      : tint === "danger"
      ? "hsl(var(--v2-danger))"
      : "hsl(var(--v2-accent))";
  return (
    <div className="v2-ticker-cell">
      <div className="v2-ticker-head">
        <span className="v2-ticker-code">{code}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="v2-ticker-value" style={{ color }}>
        {value.toLocaleString("it-IT")}
      </span>
      <span className="v2-ticker-label">{label}</span>
    </div>
  );
}
