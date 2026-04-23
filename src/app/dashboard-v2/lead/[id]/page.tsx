import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type {
  ActivityEvent,
  Lead,
  LeadContact,
  Note,
  SurveyResponse,
} from "@/lib/types";
import { LeadProfileV2, type MembershipInfo } from "@/components/admin-v2/lead/profile";

export const dynamic = "force-dynamic";
export const metadata = { title: "Profilo lead · Admin v2" };

export default async function LeadProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: leadRaw } = await supabase
    .from("leads")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!leadRaw) notFound();

  const [memberRes, docsRes, notesRes, activityRes, contactsRes, surveyRes] =
    await Promise.all([
      leadRaw.piva
        ? supabase
            .from("network_members")
            .select("id, phone, referente, approved_at, last_login_at, revoked_at, notes")
            .eq("piva", leadRaw.piva)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase.from("lead_documents").select("id").eq("lead_id", id),
      supabase
        .from("notes")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false }),
      supabase
        .from("activity_log")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: false })
        .limit(50),
      supabase
        .from("lead_contacts")
        .select("*")
        .eq("lead_id", id)
        .order("created_at", { ascending: true }),
      supabase.from("survey_responses").select("*").eq("lead_id", id).maybeSingle(),
    ]);

  const membership: MembershipInfo | null = memberRes.data
    ? {
        id: memberRes.data.id,
        phone: memberRes.data.phone,
        referente: memberRes.data.referente,
        approved_at: memberRes.data.approved_at,
        last_login_at: memberRes.data.last_login_at,
        revoked_at: memberRes.data.revoked_at,
        notes: memberRes.data.notes,
      }
    : null;

  const isActiveMember = membership && !membership.revoked_at;
  const isInvited = !!leadRaw.survey_sent_at;
  const networkStatus: "member" | "invited" | null = isActiveMember
    ? "member"
    : isInvited
    ? "invited"
    : null;

  const lead: Lead = {
    ...(leadRaw as Lead),
    network_status: networkStatus,
    documents_count: (docsRes.data ?? []).length,
  };

  return (
    <LeadProfileV2
      lead={lead}
      membership={membership}
      initialNotes={(notesRes.data as Note[]) ?? []}
      initialActivity={(activityRes.data as ActivityEvent[]) ?? []}
      initialContacts={(contactsRes.data as LeadContact[]) ?? []}
      initialSurvey={(surveyRes.data as SurveyResponse | null) ?? null}
    />
  );
}
