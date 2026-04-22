import { redirect } from "next/navigation";
import { getNetworkMember } from "@/lib/network/session";
import { maskPhone } from "@/lib/network/phone";
import { NetworkNavbar } from "@/components/network/navbar";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

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
    <div className="relative min-h-screen">
      <AnimatedBackground variant="calm" />
      <NetworkNavbar
        member={{
          referente: member.referente,
          ragione_sociale: member.ragione_sociale,
          piva: member.piva,
          phone_masked: maskPhone(member.phone),
        }}
      />
      <main className="mx-auto max-w-6xl px-4 md:px-6 pt-28 md:pt-24 pb-10 sm:pb-12">
        {children}
      </main>
    </div>
  );
}
