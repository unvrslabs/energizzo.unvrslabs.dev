import { Inbox, Building2, Check, X, Clock } from "lucide-react";
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

function StatusPill({ status }: { status: string | null }) {
  if (status === "approved") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        <Check className="h-3 w-3" />
        Approvata
      </span>
    );
  }
  if (status === "rejected") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        <X className="h-3 w-3" />
        Rifiutata
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
      <Clock className="h-3 w-3" />
      Pending
    </span>
  );
}

export default async function NetworkRequestsPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("network_join_requests")
    .select(
      "id, ragione_sociale, piva, referente, whatsapp, note, source, status, created_at",
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Errore caricamento richieste: {error.message}
      </div>
    );
  }

  const requests = (data ?? []) as JoinRequest[];
  if (requests.length === 0) return <Empty />;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <Th>Azienda</Th>
              <Th>P.IVA</Th>
              <Th>Referente</Th>
              <Th>WhatsApp</Th>
              <Th>Ricevuta</Th>
              <Th>Origine</Th>
              <Th>Stato</Th>
              <Th className="text-right">Azioni</Th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r, i) => (
              <tr
                key={r.id}
                className={`border-b border-white/5 last:border-b-0 hover:bg-white/[0.02] transition-colors ${i % 2 === 1 ? "bg-white/[0.01]" : ""}`}
              >
                <Td>
                  <div className="flex items-center gap-2 min-w-0">
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="font-semibold text-foreground truncate">
                      {r.ragione_sociale}
                    </span>
                  </div>
                  {r.note && (
                    <p className="mt-1 pl-6 text-[11px] text-muted-foreground/80 leading-snug line-clamp-2">
                      {r.note}
                    </p>
                  )}
                </Td>
                <Td>
                  <span className="font-mono text-xs text-muted-foreground">
                    {r.piva}
                  </span>
                </Td>
                <Td>
                  <span className="text-foreground/90">{r.referente}</span>
                </Td>
                <Td>
                  <a
                    href={toWhatsappLink(r.whatsapp)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 transition-colors"
                  >
                    {r.whatsapp}
                  </a>
                </Td>
                <Td>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDate(r.created_at)}
                  </span>
                </Td>
                <Td>
                  <span className="text-[11px] text-muted-foreground/70 font-mono">
                    {r.source ?? "—"}
                  </span>
                </Td>
                <Td>
                  <StatusPill status={r.status} />
                </Td>
                <Td className="text-right">
                  <div className="inline-flex">
                    <RequestActions id={r.id} status={r.status} />
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`text-left px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-top ${className}`}>{children}</td>;
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
