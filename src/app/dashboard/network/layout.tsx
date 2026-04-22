import { createAdminClient } from "@/lib/supabase/admin";
import { NetworkAdminTabs } from "@/components/network-admin/tabs";
import { NetworkOverviewStats } from "@/components/network-admin/overview-stats";

export const dynamic = "force-dynamic";

export default async function NetworkAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createAdminClient();

  const [
    { count: pendingCount },
    { count: invitedCount },
    { count: inProgressCount },
    { count: completedCount },
    { count: membersCount },
  ] = await Promise.all([
    supabase
      .from("network_join_requests")
      .select("id", { count: "exact", head: true })
      .or("status.eq.pending,status.is.null"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .not("survey_sent_at", "is", null)
      .neq("survey_status", "completed"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("survey_status", "partial"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .eq("survey_status", "completed"),
    supabase
      .from("network_members")
      .select("id", { count: "exact", head: true })
      .is("revoked_at", null),
  ]);

  const invitedTotal = (invitedCount ?? 0) + (completedCount ?? 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network</h1>
        <p className="text-sm text-muted-foreground">
          Gestisci le richieste di adesione e i membri del network Il
          Dispaccio.
        </p>
      </div>

      <NetworkOverviewStats
        data={{
          pendingRequests: pendingCount ?? 0,
          invited: invitedTotal,
          inProgress: inProgressCount ?? 0,
          completed: completedCount ?? 0,
          activeMembers: membersCount ?? 0,
        }}
      />

      <NetworkAdminTabs
        pendingCount={pendingCount ?? 0}
        invitedCount={invitedCount ?? 0}
        membersCount={membersCount ?? 0}
      />

      <div>{children}</div>
    </div>
  );
}
