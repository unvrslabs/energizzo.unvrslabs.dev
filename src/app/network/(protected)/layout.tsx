import { redirect } from "next/navigation";
import { getNetworkMember } from "@/lib/network/session";
import { V2Sidebar } from "@/components/network-v2/sidebar";
import { createClient } from "@/lib/supabase/server";
import { DELIBERE_DEADLINES } from "@/lib/delibere/mock";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Terminal · Il Dispaccio",
  robots: { index: false, follow: false },
};

export default async function NetworkProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const member = await getNetworkMember();
  if (!member) {
    redirect("/network/login");
  }

  const supabase = await createClient();
  // Conta solo delibere pertinenti per reseller energia (suffisso eel/gas/com).
  // numero_suffix è una generated column = 4° segmento del numero ARERA.
  const { count: delibereCount } = await supabase
    .from("delibere_cache")
    .select("*", { count: "exact", head: true })
    .in("numero_suffix", ["eel", "gas", "com"]);

  const now = Date.now();
  const scadenzeCount = DELIBERE_DEADLINES.filter(
    (d) => new Date(d.date).getTime() >= now,
  ).length;

  return (
    <div className="v2">
      <V2Sidebar
        member={{
          referente: member.referente,
          ragione_sociale: member.ragione_sociale,
        }}
        counts={{
          delibere: delibereCount ?? 0,
          scadenze: scadenzeCount,
        }}
      />
      <div className="v2-main">
        <div className="v2-content">{children}</div>
      </div>
    </div>
  );
}
