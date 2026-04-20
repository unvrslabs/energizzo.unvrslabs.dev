import { createClient } from "@/lib/supabase/server";
import { TACTICS, type TacticStatus } from "@/lib/strategy";
import { TacticCard } from "@/components/tactic-card";
import { Target } from "lucide-react";

type TacticRow = { id: string; status: TacticStatus; notes: string | null };

export default async function StrategiaPage() {
  const supabase = await createClient();
  const { data } = await supabase.from("strategy_tactics").select("id, status, notes");
  const map = new Map<string, TacticRow>(
    ((data ?? []) as TacticRow[]).map((r) => [r.id, r]),
  );

  const p0 = TACTICS.filter((t) => t.priority === "P0");
  const p1 = TACTICS.filter((t) => t.priority === "P1");
  const p2 = TACTICS.filter((t) => t.priority === "P2");

  const counts = {
    total: TACTICS.length,
    fatto: [...map.values()].filter((r) => r.status === "fatto").length,
    inCorso: [...map.values()].filter((r) => r.status === "in_corso").length,
  };

  return (
    <div className="space-y-6">
      <header className="glass rounded-lg p-6 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary shadow-lg shadow-primary/30 shrink-0">
              <Target className="h-6 w-6 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold tracking-tight gradient-text">
                PIANO GO-TO-MARKET
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                7 tattiche per attivare i 788 reseller italiani. Priorità crescente P0 → P2.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <Stat label="Tattiche" value={counts.total} />
            <Stat label="In corso" value={counts.inCorso} accent="#f59e0b" />
            <Stat label="Fatte" value={counts.fatto} accent="#22c55e" />
          </div>
        </div>
      </header>

      <Section
        label="P0 — Subito"
        color="rgb(252 165 165)"
        description="Alta priorità, impatto immediato, cost basso."
      >
        {p0.map((t) => (
          <TacticCard
            key={t.id}
            tactic={t}
            initialStatus={(map.get(t.id)?.status as TacticStatus) ?? "da_fare"}
            initialNotes={map.get(t.id)?.notes ?? ""}
          />
        ))}
      </Section>

      <Section
        label="P1 — In parallelo"
        color="rgb(253 224 71)"
        description="Da avviare insieme alle P0 dopo la prima settimana."
      >
        {p1.map((t) => (
          <TacticCard
            key={t.id}
            tactic={t}
            initialStatus={(map.get(t.id)?.status as TacticStatus) ?? "da_fare"}
            initialNotes={map.get(t.id)?.notes ?? ""}
          />
        ))}
      </Section>

      <Section
        label="P2 — Fase scaling"
        color="rgb(147 197 253)"
        description="Quando P0/P1 hanno tracking, attiva queste per scalare."
      >
        {p2.map((t) => (
          <TacticCard
            key={t.id}
            tactic={t}
            initialStatus={(map.get(t.id)?.status as TacticStatus) ?? "da_fare"}
            initialNotes={map.get(t.id)?.notes ?? ""}
          />
        ))}
      </Section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div className="text-right">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p
        className="font-display text-2xl font-bold tabular-nums"
        style={{ color: accent ?? undefined }}
      >
        {value}
      </p>
    </div>
  );
}

function Section({
  label,
  color,
  description,
  children,
}: {
  label: string;
  color: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-baseline gap-3 border-l-2 pl-3" style={{ borderColor: color }}>
        <h2 className="font-display text-lg font-bold tracking-wide" style={{ color }}>
          {label}
        </h2>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}
