"use client";

import dynamic from "next/dynamic";
import { useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
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
  const router = useRouter();
  const pathname = usePathname();
  const [selectedId, setSelectedId] = useState<string | null>(initialLeadId);
  const [tab, setTab] = useState<"tabella" | "pipeline" | "mappa">("tabella");

  const selected = useMemo(
    () => leads.find((l) => l.id === selectedId) ?? null,
    [selectedId, leads],
  );

  const onSelect = useCallback(
    (id: string) => {
      setSelectedId(id);
      if (pathname !== `/dashboard/leads/${id}`) {
        router.push(`/dashboard/leads/${id}`, { scroll: false });
      }
    },
    [router, pathname],
  );

  const onClose = useCallback(() => {
    setSelectedId(null);
    if (pathname.startsWith("/dashboard/leads/")) {
      router.push("/dashboard", { scroll: false });
    }
  }, [router, pathname]);

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
