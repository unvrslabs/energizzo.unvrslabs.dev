import { createAdminClient } from "@/lib/supabase/admin";
import { NetworkAdminTabs } from "@/components/network-admin/tabs";

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
    { count: membersCount },
  ] = await Promise.all([
    supabase
      .from("network_join_requests")
      .select("id", { count: "exact", head: true })
      .or("status.eq.pending,status.is.null"),
    supabase
      .from("leads")
      .select("id", { count: "exact", head: true })
      .not("survey_sent_at", "is", null),
    supabase
      .from("network_members")
      .select("id", { count: "exact", head: true })
      .is("revoked_at", null),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Network</h1>
        <p className="text-sm text-muted-foreground">
          Gestisci le richieste di adesione e i membri del network Il
          Dispaccio.
        </p>
      </div>

      <NetworkAdminTabs
        pendingCount={pendingCount ?? 0}
        invitedCount={invitedCount ?? 0}
        membersCount={membersCount ?? 0}
      />

      <div>{children}</div>
    </div>
  );
}
