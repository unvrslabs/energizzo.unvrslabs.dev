import { redirect } from "next/navigation";
import { getAdminMember } from "@/lib/admin/session";
import { AdminV2Sidebar } from "@/components/admin-v2/sidebar";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Terminal · Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function DashboardV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getAdminMember();
  if (!admin) {
    redirect("/login");
  }

  const supabase = await createClient();
  const [leadsCount, networkPendingCount, guestsTargetCount] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase
      .from("network_join_requests")
      .select("*", { count: "exact", head: true })
      .or("status.eq.pending,status.is.null"),
    supabase
      .from("podcast_guests")
      .select("*", { count: "exact", head: true })
      .eq("status", "target"),
  ]);

  return (
    <div className="v2">
      <AdminV2Sidebar
        admin={{ nome: admin.nome, role: admin.role }}
        counts={{
          leads: leadsCount.count ?? 0,
          networkPending: networkPendingCount.count ?? 0,
          guestsTarget: guestsTargetCount.count ?? 0,
        }}
      />
      <div className="v2-main">
        <div className="v2-content">{children}</div>
      </div>
    </div>
  );
}
