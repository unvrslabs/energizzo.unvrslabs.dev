"use client";

import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { LayoutGrid, Map as MapIcon, Table2 } from "lucide-react";
import { KanbanBoardV2 } from "./kanban-v2";
import { LeadsTableV2 } from "./table-v2";
import { cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

const ItalyMap = dynamic(() => import("@/components/italy-map"), {
  ssr: false,
  loading: () => (
    <div
      className="v2-card flex items-center justify-center text-sm"
      style={{ height: "70vh", color: "hsl(var(--v2-text-mute))" }}
    >
      Caricamento mappa...
    </div>
  ),
});

type Tab = "tabella" | "pipeline" | "mappa";
const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "tabella", label: "Tabella", icon: Table2 },
  { id: "pipeline", label: "Pipeline", icon: LayoutGrid },
  { id: "mappa", label: "Mappa", icon: MapIcon },
];

export function LeadDashboardV2Client({ leads }: { leads: Lead[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("tabella");

  const onSelect = useCallback(
    (id: string) => {
      router.push(`/dashboard/lead/${id}`);
    },
    [router],
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="v2-card p-1 flex items-center gap-0.5 w-fit">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[12.5px] font-medium transition-colors",
              )}
              style={{
                background: active ? "hsl(var(--v2-bg-elev))" : "transparent",
                color: active ? "hsl(var(--v2-text))" : "hsl(var(--v2-text-dim))",
                border: `1px solid ${active ? "hsl(var(--v2-border-strong))" : "transparent"}`,
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "tabella" && <LeadsTableV2 leads={leads} onSelect={onSelect} />}
      {tab === "pipeline" && <KanbanBoardV2 leads={leads} onSelect={onSelect} />}
      {tab === "mappa" && <ItalyMap leads={leads} onSelect={onSelect} />}
    </div>
  );
}
