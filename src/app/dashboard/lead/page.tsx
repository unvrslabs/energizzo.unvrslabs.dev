import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import {
  ACTIVE_PIPELINE_STATUSES,
  DEMO_DONE_STATUSES,
  STATUS_CONFIG,
  type Categoria,
  type Status,
  type TipoServizio,
} from "@/lib/status-config";
import { FilterBarV2 } from "@/components/admin-v2/lead/filter-bar-v2";
import { LeadDashboardV2Client } from "@/components/admin-v2/lead/client";
import {
  LeadOverview,
  type LeadOverviewData,
} from "@/components/admin-v2/lead/overview";

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

  // ── Overview data: status counts, serie temporali, donut tipo servizio ──
  const statusCounts = STATUSES_TO_COUNT.reduce(
    (acc, s) => ({ ...acc, [s]: 0 }),
    {} as Record<Status, number>,
  );
  for (const l of leads) {
    if (l.status in statusCounts) {
      statusCounts[l.status as Status] = (statusCounts[l.status as Status] ?? 0) + 1;
    }
  }

  // Serie 90gg lead created
  const heatStrip90 = buildDailySeries(
    leads.map((l) => l.created_at),
    90,
  );
  const leadsSpark14 = heatStrip90.slice(-14).map((d) => d.value);

  // Serie 14gg lead won (basata su updated_at del lead chiuso_vinto)
  const wonSpark14Series = buildDailySeries(
    leads
      .filter((l) => l.status === "chiuso_vinto")
      .map((l) => l.updated_at ?? l.created_at),
    14,
  );
  const wonSpark14 = wonSpark14Series.map((d) => d.value);

  // Conversione 30gg: lead creati negli ultimi 30gg vs won negli ultimi 30gg
  const cutoff30 = Date.now() - 30 * 86400000;
  const leadsLast30 = leads.filter(
    (l) => l.created_at && new Date(l.created_at).getTime() >= cutoff30,
  );
  const wonLast30 = leads.filter(
    (l) =>
      l.status === "chiuso_vinto" &&
      l.updated_at &&
      new Date(l.updated_at).getTime() >= cutoff30,
  );

  // Won mese corrente vs mese precedente (delta KPI)
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
  const startOfPrevMonth = new Date(
    now.getFullYear(),
    now.getMonth() - 1,
    1,
  ).getTime();
  const wonThisMonth = leads.filter(
    (l) =>
      l.status === "chiuso_vinto" &&
      l.updated_at &&
      new Date(l.updated_at).getTime() >= startOfThisMonth,
  ).length;
  const wonPrevMonth = leads.filter((l) => {
    if (l.status !== "chiuso_vinto" || !l.updated_at) return false;
    const t = new Date(l.updated_at).getTime();
    return t >= startOfPrevMonth && t < startOfThisMonth;
  }).length;

  // Distribuzione tipo servizio (per Donut)
  const tipoCounts = leads.reduce<Record<string, number>>((acc, l) => {
    const key = l.tipo_servizio ?? "N/D";
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const tipoServizioSlices = Object.entries(tipoCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([label, value]) => ({
      label: label.replace(/^Solo /, "").replace(/^Dual.*/, "Dual"),
      value,
    }));

  const overviewData: LeadOverviewData = {
    total: leads.length,
    inPipeline: leads.filter((l) =>
      ACTIVE_PIPELINE_STATUSES.includes(l.status),
    ).length,
    demoDone: leads.filter((l) => DEMO_DONE_STATUSES.includes(l.status)).length,
    won: leads.filter((l) => l.status === "chiuso_vinto").length,
    leadsSpark14,
    wonSpark14,
    heatStrip90,
    statusCounts,
    tipoServizioSlices,
    conversion30Won: wonLast30.length,
    conversion30Total: leadsLast30.length,
    wonThisMonth,
    wonPrevMonth,
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

      <LeadOverview data={overviewData} />

      <FilterBarV2 provinces={provinces} />

      <LeadDashboardV2Client leads={filteredLeads} />
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

const STATUSES_TO_COUNT = Object.keys(STATUS_CONFIG) as Status[];

function buildDailySeries(
  dates: Array<string | null | undefined>,
  days: number,
): Array<{ date: string; value: number; label?: string }> {
  const buckets = new Map<string, number>();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.set(d.toISOString().slice(0, 10), 0);
  }
  for (const ts of dates) {
    if (!ts) continue;
    const day = new Date(ts).toISOString().slice(0, 10);
    if (buckets.has(day)) buckets.set(day, (buckets.get(day) ?? 0) + 1);
  }
  return Array.from(buckets.entries()).map(([date, value]) => ({
    date,
    value,
    label: `${new Date(date).toLocaleDateString("it-IT", {
      day: "numeric",
      month: "short",
    })}: ${value} lead`,
  }));
}
