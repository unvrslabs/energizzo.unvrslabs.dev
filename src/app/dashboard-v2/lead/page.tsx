import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import {
  ACTIVE_PIPELINE_STATUSES,
  DEMO_DONE_STATUSES,
  type Categoria,
  type Status,
  type TipoServizio,
} from "@/lib/status-config";
import { LeadStatsV2 } from "@/components/admin-v2/lead/stats";
import { FilterBarV2 } from "@/components/admin-v2/lead/filter-bar-v2";
import { LeadDashboardV2Client } from "@/components/admin-v2/lead/client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead · Admin v2" };

type SearchParams = {
  q?: string;
  status?: string;
  tipo?: string;
  categoria?: string;
  prov?: string;
  network?: string;
};

export default async function LeadV2Page({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  return <LeadV2Content sp={sp} initialLeadId={null} />;
}

export async function LeadV2Content({
  sp,
  initialLeadId,
}: {
  sp: SearchParams;
  initialLeadId: string | null;
}) {
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
  if (sp.categoria) {
    const arr = sp.categoria.split(",").filter(Boolean) as Categoria[];
    if (arr.length) query = query.in("categoria", arr);
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
      <div className="v2-card p-8 text-center text-sm" style={{ color: "hsl(var(--v2-danger))" }}>
        Errore caricamento lead: {error.message}
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

  const { data: memberRows } = await supabase
    .from("network_members")
    .select("piva")
    .is("revoked_at", null);
  const memberPivas = new Set(((memberRows ?? []) as { piva: string }[]).map((r) => r.piva));

  const leads: Lead[] = leadsRaw.map((l) => {
    const isMember = memberPivas.has(l.piva);
    const isInvited = !!l.survey_sent_at;
    const networkStatus: "member" | "invited" | null = isMember
      ? "member"
      : isInvited
      ? "invited"
      : null;
    return {
      ...l,
      podcast_status: guestByLead.get(l.id)?.status ?? null,
      podcast_confirmed_at: guestByLead.get(l.id)?.response_confirmed_at ?? null,
      documents_count: docsByLead.get(l.id) ?? 0,
      network_status: networkStatus,
    };
  });

  const networkFilter = sp.network;
  const filteredLeads =
    networkFilter === "member"
      ? leads.filter((l) => l.network_status === "member")
      : networkFilter === "invited"
      ? leads.filter((l) => l.network_status === "invited")
      : leads;

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
    <div className="flex flex-col gap-5">
      <header>
        <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          CRM · Pipeline reseller
        </p>
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
          Lead
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
          {filteredLeads.length.toLocaleString("it-IT")} record nel filtro corrente · Kanban drag&amp;drop · tabella · mappa geografica
        </p>
      </header>

      <LeadStatsV2 stats={stats} />

      <FilterBarV2 provinces={provinces} />

      <LeadDashboardV2Client leads={filteredLeads} initialLeadId={initialLeadId} />
    </div>
  );
}
