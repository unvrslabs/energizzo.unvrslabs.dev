import { createClient } from "@/lib/supabase/server";
import { TACTICS, type TacticStatus } from "@/lib/strategy";
import { TacticCard } from "@/components/tactic-card";
import { CheckCircle2, CircleDot, Flag, Target } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Strategia · Admin v2" };

type TacticRow = { id: string; status: TacticStatus; notes: string | null };

const PRIORITY_CONFIG: Record<
  "P0" | "P1" | "P2",
  { label: string; description: string; color: string; tint: string }
> = {
  P0: {
    label: "P0 · Subito",
    description: "Alta priorità, impatto immediato, cost basso",
    color: "hsl(358 75% 66%)",
    tint: "hsl(var(--v2-danger) / 0.1)",
  },
  P1: {
    label: "P1 · In parallelo",
    description: "Da avviare insieme alle P0 dopo la prima settimana",
    color: "hsl(var(--v2-warn))",
    tint: "hsl(var(--v2-warn) / 0.1)",
  },
  P2: {
    label: "P2 · Scaling",
    description: "Quando P0/P1 hanno tracking, attiva queste per scalare",
    color: "hsl(var(--v2-info))",
    tint: "hsl(var(--v2-info) / 0.1)",
  },
};

export default async function StrategiaV2Page() {
  const supabase = await createClient();
  const { data } = await supabase.from("strategy_tactics").select("id, status, notes");
  const map = new Map<string, TacticRow>(((data ?? []) as TacticRow[]).map((r) => [r.id, r]));

  const counts = {
    total: TACTICS.length,
    fatto: [...map.values()].filter((r) => r.status === "fatto").length,
    inCorso: [...map.values()].filter((r) => r.status === "in_corso").length,
    archiviato: [...map.values()].filter((r) => r.status === "archiviato").length,
  };
  const daFare = counts.total - counts.fatto - counts.inCorso - counts.archiviato;

  const p0 = TACTICS.filter((t) => t.priority === "P0");
  const p1 = TACTICS.filter((t) => t.priority === "P1");
  const p2 = TACTICS.filter((t) => t.priority === "P2");

  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Strategy · Piano Go-To-Market
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            7 tattiche per 788 reseller
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Priorità P0 → P2 · aggiorna status e note inline
          </p>
        </div>
      </header>

      {/* Stats ticker */}
      <div className="v2-ticker-row">
        <StatCell code="TOTALE" label="Tattiche pianificate" value={counts.total} icon={<Target className="w-3.5 h-3.5" />} tint="info" />
        <StatCell code="IN_CORSO" label="In esecuzione" value={counts.inCorso} icon={<CircleDot className="w-3.5 h-3.5" />} tint="warn" />
        <StatCell code="COMPLETATE" label="Consegnate" value={counts.fatto} icon={<CheckCircle2 className="w-3.5 h-3.5" />} tint="accent" />
      </div>

      {/* Progress bar */}
      <div className="v2-card p-4">
        <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Progresso complessivo
        </div>
        <div className="flex h-2 w-full rounded-full overflow-hidden" style={{ background: "hsl(var(--v2-border))" }}>
          {counts.fatto > 0 && (
            <div style={{ width: `${(counts.fatto / counts.total) * 100}%`, background: "hsl(var(--v2-accent))" }} />
          )}
          {counts.inCorso > 0 && (
            <div style={{ width: `${(counts.inCorso / counts.total) * 100}%`, background: "hsl(var(--v2-warn))" }} />
          )}
          {daFare > 0 && (
            <div style={{ width: `${(daFare / counts.total) * 100}%`, background: "hsl(var(--v2-text-mute))", opacity: 0.4 }} />
          )}
        </div>
        <div className="flex items-center gap-4 mt-3 v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
          <LegendDot color="hsl(var(--v2-accent))" label={`Fatte ${counts.fatto}`} />
          <LegendDot color="hsl(var(--v2-warn))" label={`In corso ${counts.inCorso}`} />
          <LegendDot color="hsl(var(--v2-text-mute))" label={`Da fare ${daFare}`} />
          {counts.archiviato > 0 && <LegendDot color="hsl(var(--v2-text-mute))" label={`Archiviate ${counts.archiviato}`} dim />}
        </div>
      </div>

      {[
        { priority: "P0" as const, tactics: p0 },
        { priority: "P1" as const, tactics: p1 },
        { priority: "P2" as const, tactics: p2 },
      ].map(({ priority, tactics }) => {
        const cfg = PRIORITY_CONFIG[priority];
        return (
          <section key={priority} className="flex flex-col gap-3">
            <div className="flex items-center gap-3 pl-1">
              <Flag className="w-4 h-4" style={{ color: cfg.color }} />
              <span
                className="v2-mono text-[11px] font-bold uppercase tracking-[0.18em]"
                style={{ color: cfg.color }}
              >
                {cfg.label}
              </span>
              <span className="text-[12px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                {cfg.description}
              </span>
            </div>
            <div className="space-y-3">
              {tactics.map((t) => (
                <TacticCard
                  key={t.id}
                  tactic={t}
                  initialStatus={(map.get(t.id)?.status as TacticStatus) ?? "da_fare"}
                  initialNotes={map.get(t.id)?.notes ?? ""}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function StatCell({
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
  tint: "accent" | "warn" | "info";
}) {
  const color =
    tint === "warn" ? "hsl(var(--v2-warn))" : tint === "info" ? "hsl(var(--v2-info))" : "hsl(var(--v2-accent))";
  return (
    <div className="v2-ticker-cell">
      <div className="v2-ticker-head">
        <span className="v2-ticker-code">{code}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="v2-ticker-value" style={{ color }}>{value}</span>
      <span className="v2-ticker-label">{label}</span>
    </div>
  );
}

function LegendDot({ color, label, dim }: { color: string; label: string; dim?: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5" style={{ opacity: dim ? 0.5 : 1 }}>
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}
