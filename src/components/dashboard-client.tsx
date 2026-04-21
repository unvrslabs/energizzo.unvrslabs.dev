"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Table2, LayoutGrid, Map as MapIcon } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeadsTable } from "./leads-table";
import { KanbanBoard } from "./kanban-board";
import { LeadDrawer } from "./lead-drawer";
import type { Lead } from "@/lib/types";

const ItalyMap = dynamic(() => import("./italy-map"), {
  ssr: false,
  loading: () => (
    <div className="glass rounded-lg h-[70vh] flex items-center justify-center text-muted-foreground">
      Caricamento mappa...
    </div>
  ),
});

type Props = {
  leads: Lead[];
  initialLeadId: string | null;
};

export function DashboardClient({ leads, initialLeadId }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(initialLeadId);
  const [tab, setTab] = useState<"tabella" | "pipeline" | "mappa">("tabella");

  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [selectedId, leads],
  );

  // Update URL via History API (no RSC refetch) so the drawer doesn't
  // unmount/remount during open animation.
  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    const target = `/dashboard/leads/${id}`;
    if (typeof window !== "undefined" && window.location.pathname !== target) {
      window.history.pushState(null, "", target);
    }
  }, []);

  const onClose = useCallback(() => {
    setSelectedId(null);
    if (
      typeof window !== "undefined" &&
      window.location.pathname.startsWith("/dashboard/leads/")
    ) {
      window.history.pushState(null, "", "/dashboard");
    }
  }, []);

  // Support browser back/forward buttons
  useEffect(() => {
    const handler = () => {
      if (typeof window === "undefined") return;
      const match = window.location.pathname.match(/^\/dashboard\/leads\/([^/?#]+)/);
      setSelectedId(match?.[1] ?? null);
    };
    window.addEventListener("popstate", handler);
    return () => window.removeEventListener("popstate", handler);
  }, []);

  return (
    <>
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="w-full">
        <TabsList>
          <TabsTrigger value="tabella">
            <Table2 className="h-4 w-4" />
            Tabella
          </TabsTrigger>
          <TabsTrigger value="pipeline">
            <LayoutGrid className="h-4 w-4" />
            Pipeline
          </TabsTrigger>
          <TabsTrigger value="mappa">
            <MapIcon className="h-4 w-4" />
            Mappa
          </TabsTrigger>
        </TabsList>
        <TabsContent value="tabella">
          <LeadsTable leads={leads} onSelect={onSelect} />
        </TabsContent>
        <TabsContent value="pipeline">
          <KanbanBoard leads={leads} onSelect={onSelect} />
        </TabsContent>
        <TabsContent value="mappa">
          <ItalyMap leads={leads} onSelect={onSelect} />
        </TabsContent>
      </Tabs>
      <LeadDrawer lead={selected} open={selected !== null} onClose={onClose} />
    </>
  );
}
