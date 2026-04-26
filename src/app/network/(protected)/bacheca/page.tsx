import { redirect } from "next/navigation";
import { getNetworkMember } from "@/lib/network/session";
import { getMemberInviteNumber } from "@/lib/network/invite";
import { listPosts } from "@/lib/network/bacheca";
import { BachecaClient } from "@/components/network-v2/bacheca-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bacheca · Il Dispaccio" };

export default async function BachecaPage() {
  const member = await getNetworkMember();
  if (!member) redirect("/network/login");

  const [posts, inviteNumber] = await Promise.all([
    listPosts(member.id),
    getMemberInviteNumber(member.piva),
  ]);

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p
          className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          Network · Conversazioni tra reseller
        </p>
        <h1
          className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1"
          style={{ color: "hsl(var(--v2-text))" }}
        >
          Bacheca
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Domande, esperienze, alert su delibere. Visibile solo ai membri del network.
        </p>
      </header>

      <BachecaClient
        viewerMemberId={member.id}
        viewerName={member.ragione_sociale}
        viewerInviteNumber={inviteNumber}
        initialPosts={posts}
      />
    </div>
  );
}
