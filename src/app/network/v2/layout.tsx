import { redirect } from "next/navigation";
import { getNetworkMember } from "@/lib/network/session";
import { V2Sidebar } from "@/components/network-v2/sidebar";
import { V2Topbar } from "@/components/network-v2/topbar";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terminal · Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function NetworkV2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await getNetworkMember();
  if (!member) {
    redirect("/network/login");
  }

  return (
    <div className="v2">
      <V2Sidebar
        member={{
          referente: member.referente,
          ragione_sociale: member.ragione_sociale,
        }}
      />
      <div className="v2-main">
        <V2Topbar />
        <div className="v2-content">{children}</div>
      </div>
    </div>
  );
}
