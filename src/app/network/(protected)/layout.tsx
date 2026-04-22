import { redirect } from "next/navigation";
import { getNetworkMember } from "@/lib/network/session";
import { NetworkNavbar } from "@/components/network/navbar";

export const dynamic = "force-dynamic";

export default async function NetworkProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await getNetworkMember();
  if (!member) {
    redirect("/network/login");
  }

  return (
    <div className="mesh-gradient relative min-h-screen">
      <NetworkNavbar referente={member.referente} />
      <main className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-12">
        {children}
      </main>
    </div>
  );
}
