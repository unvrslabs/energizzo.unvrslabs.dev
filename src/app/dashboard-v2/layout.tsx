import { redirect } from "next/navigation";
import { getAdminMember } from "@/lib/admin/session";
import { AdminV2Sidebar } from "@/components/admin-v2/sidebar";

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

  return (
    <div className="v2">
      <AdminV2Sidebar admin={{ nome: admin.nome, role: admin.role }} />
      <div className="v2-main">
        <div className="v2-content">{children}</div>
      </div>
    </div>
  );
}
