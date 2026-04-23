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
export const metadata = { title: "Profilo membro · Admin v2" };

export default async function MemberProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch membro
  const { data: member } = await supabase
    .from("network_members")
    .select("id, phone, ragione_sociale, piva, referente, approved_at, last_login_at, revoked_at, notes")
    .eq("id", id)
    .maybeSingle();

  if (!member) notFound();

  const membership: MembershipInfo = {
    id: member.id,
    phone: member.phone,
    referente: member.referente,
    approved_at: member.approved_at,
    last_login_at: member.last_login_at,
    revoked_at: member.revoked_at,
    notes: member.notes,
  };

  // Trova il lead via piva
  const { data: leadRaw } = member.piva
    ? await supabase.from("leads").select("*").eq("piva", member.piva).maybeSingle()
    : { data: null };

  // Caso: lead non trovato (membro orfano). Costruisci un Lead minimo dai dati membership.
  if (!leadRaw) {
    const stubLead: Lead = {
      id: member.id,
      ragione_sociale: member.ragione_sociale ?? "—",
      piva: member.piva ?? "",
      tipo_servizio: "Dual (Ele+Gas)",
      status: "chiuso_vinto",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      survey_token: "",
      survey_status: "completed",
      id_arera: null,
      categoria: null,
      commodity: null,
      servizio_tutela: null,
      in_gruppo: null,
      macroarea: null,
      completezza_contatti: null,
      comune: null,
      provincia: null,
      indirizzo: null,
      dominio: null,
      sito_web: null,
      email_info: null,
      email_commerciale: null,
      telefoni: null,
      email: null,
      whatsapp: member.phone,
      telefono: null,
      gruppo: null,
      natura_giuridica: null,
      settori: null,
      latitude: null,
      longitude: null,
      owner_id: null,
      contacts_enriched_at: null,
      contacts_error: null,
      survey_sent_at: null,
      survey_completed_at: null,
      survey_last_step_at: null,
      network_status: member.revoked_at ? null : "member",
    } as Lead;
    return (
      <LeadProfileV2
        lead={stubLead}
        membership={membership}
        backHref="/dashboard-v2/network/membri"
        backLabel="Torna ai membri"
      />
    );
  }

  const [docsRes, notesRes, activityRes, contactsRes, surveyRes] = await Promise.all([
    supabase.from("lead_documents").select("id").eq("lead_id", leadRaw.id),
    supabase
      .from("notes")
      .select("*")
      .eq("lead_id", leadRaw.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("activity_log")
      .select("*")
      .eq("lead_id", leadRaw.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("lead_contacts")
      .select("*")
      .eq("lead_id", leadRaw.id)
      .order("created_at", { ascending: true }),
    supabase
      .from("survey_responses")
      .select("*")
      .eq("lead_id", leadRaw.id)
      .maybeSingle(),
  ]);

  const lead: Lead = {
    ...(leadRaw as Lead),
    network_status: member.revoked_at ? null : "member",
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
      backHref="/dashboard-v2/network/membri"
      backLabel="Torna ai membri"
    />
  );
}
