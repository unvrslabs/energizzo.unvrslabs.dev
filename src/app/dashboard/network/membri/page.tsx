import Link from "next/link";
import { Users2, Building2, CheckCircle2, Ban } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { MemberActions } from "@/components/network-admin/member-actions";

export const dynamic = "force-dynamic";

type NetworkMemberRow = {
  id: string;
  phone: string;
  ragione_sociale: string;
  piva: string;
  referente: string;
  approved_at: string | null;
  last_login_at: string | null;
  revoked_at: string | null;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function toWhatsappLink(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : "#";
}

export default async function NetworkMembersPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("network_members")
    .select("id, phone, ragione_sociale, piva, referente, approved_at, last_login_at, revoked_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Errore caricamento membri: {error.message}
      </div>
    );
  }

  const members = (data ?? []) as NetworkMemberRow[];
  if (members.length === 0) {
    return <Empty />;
  }

  return (
    <div className="space-y-3">
      {members.map((m) => {
        const revoked = !!m.revoked_at;
        return (
          <article
            key={m.id}
            className={`rounded-2xl border backdrop-blur-sm p-4 md:p-5 ${revoked ? "border-red-500/20 bg-red-500/5" : "border-white/10 bg-white/[0.03]"}`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <Link
                    href={`/dashboard/network/membri/${m.id}`}
                    className="text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors truncate"
                  >
                    {m.ragione_sociale}
                  </Link>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                    {m.piva}
                  </span>
                  {revoked ? (
                    <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      <Ban className="h-3 w-3" />
                      Revocato
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      <CheckCircle2 className="h-3 w-3" />
                      Attivo
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="text-foreground/70 font-medium">{m.referente}</span>
                  <a
                    href={toWhatsappLink(m.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {m.phone}
                  </a>
                  <span>Ammesso {formatDate(m.approved_at)}</span>
                  <span>
                    Ultimo accesso:{" "}
                    <span className="text-foreground/70">
                      {m.last_login_at ? formatDate(m.last_login_at) : "mai"}
                    </span>
                  </span>
                </div>
              </div>

              <MemberActions id={m.id} revoked={revoked} />
            </div>
          </article>
        );
      })}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-10 text-center">
      <Users2 className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
      <h3 className="text-base font-bold text-foreground mb-1">
        Nessun membro
      </h3>
      <p className="text-sm text-muted-foreground">
        Approva una richiesta dalla tab <strong>Richieste</strong> per aggiungere
        il primo membro.
      </p>
    </div>
  );
}
