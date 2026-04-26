import { createClient } from "@/lib/supabase/server";
import { TACTICS, type TacticStatus } from "@/lib/strategy";
import { TacticCardV2 as TacticCard } from "@/components/admin-v2/tactic-card";
import { Flag } from "lucide-react";
import {
  StrategiaOverview,
  type StrategiaOverviewData,
} from "@/components/admin-v2/strategia/strategia-overview";

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

  // Per-priority breakdown per StrategiaOverview
  const buildPrioCounts = (prio: "P0" | "P1" | "P2") => {
    const tactics = TACTICS.filter((t) => t.priority === prio);
    return {
      total: tactics.length,
      fatto: tactics.filter((t) => map.get(t.id)?.status === "fatto").length,
      inCorso: tactics.filter((t) => map.get(t.id)?.status === "in_corso").length,
    };
  };
  const overviewData: StrategiaOverviewData = {
    total: counts.total,
    fatto: counts.fatto,
    inCorso: counts.inCorso,
    daFare,
    archiviato: counts.archiviato,
    byPriority: {
      P0: buildPrioCounts("P0"),
      P1: buildPrioCounts("P1"),
      P2: buildPrioCounts("P2"),
    },
  };

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

      <StrategiaOverview data={overviewData} />

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

