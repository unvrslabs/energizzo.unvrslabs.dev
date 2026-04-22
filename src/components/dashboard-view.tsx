import { createClient } from "@/lib/supabase/server";
import { StatsCards } from "@/components/stats-cards";
import { FilterBar } from "@/components/filter-bar";
import { DashboardClient } from "@/components/dashboard-client";
import type { Lead } from "@/lib/types";
import {
  ACTIVE_PIPELINE_STATUSES,
  DEMO_DONE_STATUSES,
  type Status,
  type TipoServizio,
} from "@/lib/status-config";

type SearchParams = {
  q?: string;
  status?: string;
  tipo?: string;
  prov?: string;
};

export async function DashboardView({
  searchParams,
  initialLeadId,
}: {
  searchParams: SearchParams;
  initialLeadId: string | null;
}) {
  const sp = searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("leads")
    .select("*, contacts:lead_contacts(count)")
    .order("ragione_sociale");

  if (sp.status) {
    const arr = sp.status.split(",").filter(Boolean) as Status[];
    if (arr.length) query = query.in("status", arr);
  }
  if (sp.tipo) {
    const arr = sp.tipo.split(",").filter(Boolean) as TipoServizio[];
    if (arr.length) query = query.in("tipo_servizio", arr);
  }
  if (sp.prov) {
    const arr = sp.prov.split(",").filter(Boolean);
    if (arr.length) query = query.in("provincia", arr);
  }
  if (sp.q) {
    const q = sp.q.trim();
    query = query.or(
      `ragione_sociale.ilike.%${q}%,piva.ilike.%${q}%,dominio.ilike.%${q}%,comune.ilike.%${q}%`,
    );
  }

  const { data, error } = await query.limit(5000);
  if (error) {
    return (
      <div className="glass rounded-lg p-8 text-center">
        <p className="text-destructive">Errore caricamento lead: {error.message}</p>
      </div>
    );
  }

  const leadsRaw = ((data ?? []) as (Lead & { contacts: { count: number }[] })[]).map(
    (r) => ({ ...r, contacts_count: r.contacts?.[0]?.count ?? 0 }),
  );

  const leadIds = leadsRaw.map((l) => l.id);
  const { data: guestRows } = leadIds.length
    ? await supabase
        .from("podcast_guests")
        .select("lead_id, status, response_confirmed_at")
        .in("lead_id", leadIds)
    : { data: [] };
  const guestByLead = new Map<
    string,
    { status: string; response_confirmed_at: string | null }
  >();
  for (const g of (guestRows ?? []) as {
    lead_id: string | null;
    status: string;
    response_confirmed_at: string | null;
  }[]) {
    if (g.lead_id) guestByLead.set(g.lead_id, g);
  }

  const { data: docRows } = leadIds.length
    ? await supabase
        .from("lead_documents")
        .select("lead_id")
        .in("lead_id", leadIds)
    : { data: [] };
  const docsByLead = new Map<string, number>();
  for (const d of (docRows ?? []) as { lead_id: string }[]) {
    docsByLead.set(d.lead_id, (docsByLead.get(d.lead_id) ?? 0) + 1);
  }

  const leads: Lead[] = leadsRaw.map((l) => ({
    ...l,
    podcast_status: guestByLead.get(l.id)?.status ?? null,
    podcast_confirmed_at: guestByLead.get(l.id)?.response_confirmed_at ?? null,
    documents_count: docsByLead.get(l.id) ?? 0,
  }));

  const { data: provData } = await supabase
    .from("leads")
    .select("provincia")
    .not("provincia", "is", null)
    .order("provincia");
  const provinces = Array.from(
    new Set(((provData ?? []) as { provincia: string }[]).map((r) => r.provincia).filter(Boolean)),
  );

  const stats = {
    total: leads.length,
    inPipeline: leads.filter((l) => ACTIVE_PIPELINE_STATUSES.includes(l.status)).length,
    demoDone: leads.filter((l) => DEMO_DONE_STATUSES.includes(l.status)).length,
    won: leads.filter((l) => l.status === "chiuso_vinto").length,
  };

  return (
    <div className="space-y-4">
      <StatsCards stats={stats} />
      <FilterBar provinces={provinces} />
      <DashboardClient leads={leads} initialLeadId={initialLeadId} />
    </div>
  );
}
