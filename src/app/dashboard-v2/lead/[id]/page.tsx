import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Lead } from "@/lib/types";
import { LeadProfileV2 } from "@/components/admin-v2/lead/profile";

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

  // Calcola network_status e documents_count per i badge header
  const [memberRes, docsRes] = await Promise.all([
    leadRaw.piva
      ? supabase
          .from("network_members")
          .select("piva")
          .eq("piva", leadRaw.piva)
          .is("revoked_at", null)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    supabase.from("lead_documents").select("id").eq("lead_id", id),
  ]);

  const isMember = !!memberRes.data;
  const isInvited = !!leadRaw.survey_sent_at;
  const networkStatus: "member" | "invited" | null = isMember
    ? "member"
    : isInvited
    ? "invited"
    : null;

  const lead: Lead = {
    ...(leadRaw as Lead),
    network_status: networkStatus,
    documents_count: (docsRes.data ?? []).length,
  };

  return <LeadProfileV2 lead={lead} />;
}
