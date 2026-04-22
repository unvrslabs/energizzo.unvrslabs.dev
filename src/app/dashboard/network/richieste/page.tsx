import { Inbox, Building2 } from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { RequestActions } from "@/components/network-admin/request-actions";

export const dynamic = "force-dynamic";

type JoinRequest = {
  id: string;
  ragione_sociale: string;
  piva: string;
  referente: string;
  whatsapp: string;
  note: string | null;
  source: string | null;
  status: string | null;
  created_at: string | null;
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

export default async function NetworkRequestsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("network_join_requests")
    .select("id, ragione_sociale, piva, referente, whatsapp, note, source, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Errore caricamento richieste: {error.message}
      </div>
    );
  }

  const requests = (data ?? []) as JoinRequest[];
  if (requests.length === 0) {
    return <Empty />;
  }

  return (
    <div className="space-y-3">
      {requests.map((r) => (
        <article
          key={r.id}
          className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 md:p-5"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-4 w-4 text-primary shrink-0" />
                <h3 className="text-base md:text-lg font-bold text-foreground truncate">
                  {r.ragione_sociale}
                </h3>
                <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                  {r.piva}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  <span className="text-foreground/70 font-medium">{r.referente}</span>
                </span>
                <a
                  href={toWhatsappLink(r.whatsapp)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  {r.whatsapp}
                </a>
                <span>{formatDate(r.created_at)}</span>
                {r.source && (
                  <span className="text-muted-foreground/60">via {r.source}</span>
                )}
              </div>
              {r.note && (
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                  {r.note}
                </p>
              )}
            </div>

            <RequestActions id={r.id} status={r.status} />
          </div>
        </article>
      ))}
    </div>
  );
}

function Empty() {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-10 text-center">
      <Inbox className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
      <h3 className="text-base font-bold text-foreground mb-1">
        Nessuna richiesta
      </h3>
      <p className="text-sm text-muted-foreground">
        Le candidature inviate dal form di Il Dispaccio appariranno qui.
      </p>
    </div>
  );
}
