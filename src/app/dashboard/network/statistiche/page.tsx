import { createAdminClient } from "@/lib/supabase/admin";
import { ReportDashboard } from "@/components/report-dashboard";
import type { Lead, SurveyResponse } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function NetworkStatisticsPage() {
  const supabase = createAdminClient();

  const { data: leads } = await supabase
    .from("leads")
    .select(
      "id, ragione_sociale, piva, tipo_servizio, provincia, email, whatsapp, survey_status, survey_sent_at, survey_completed_at, survey_last_step_at",
    )
    .neq("survey_status", "not_sent")
    .order("survey_sent_at", { ascending: false, nullsFirst: false });

  const leadList = (leads ?? []) as Lead[];

  const leadIds = leadList.map((l) => l.id);
  const { data: responses } = leadIds.length
    ? await supabase.from("survey_responses").select("*").in("lead_id", leadIds)
    : { data: [] };

  const responsesByLead = new Map<string, SurveyResponse>();
  for (const r of (responses ?? []) as SurveyResponse[]) {
    responsesByLead.set(r.lead_id, r);
  }

  const rows = leadList.map((l) => ({
    lead: l,
    response: responsesByLead.get(l.id) ?? null,
  }));

  return <ReportDashboard rows={rows} />;
}
