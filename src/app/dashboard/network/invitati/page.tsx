import Link from "next/link";
import {
  Building2,
  Send,
  ExternalLink,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { getSurveyUrl } from "@/lib/public-urls";

export const dynamic = "force-dynamic";

type InvitedLead = {
  id: string;
  ragione_sociale: string;
  piva: string;
  whatsapp: string | null;
  telefono: string | null;
  survey_token: string;
  survey_status: string | null;
  survey_sent_at: string | null;
  survey_last_step_at: string | null;
  survey_completed_at: string | null;
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

function toWhatsappLink(raw: string | null): string | null {
  if (!raw) return null;
  const digits = raw.replace(/\D/g, "");
  return digits ? `https://wa.me/${digits}` : null;
}

function statusBadge(status: string | null) {
  if (status === "completed") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        <CheckCircle2 className="h-3 w-3" />
        Completato
      </span>
    );
  }
  if (status === "partial") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
        <Clock className="h-3 w-3" />
        In corso
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
      <Send className="h-3 w-3" />
      Invitato
    </span>
  );
}

export default async function NetworkInvitedPage() {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select(
      "id, ragione_sociale, piva, whatsapp, telefono, survey_token, survey_status, survey_sent_at, survey_last_step_at, survey_completed_at",
    )
    .not("survey_sent_at", "is", null)
    .neq("survey_status", "completed")
    .order("survey_sent_at", { ascending: false });

  if (error) {
    return (
      <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
        Errore caricamento invitati: {error.message}
      </div>
    );
  }

  const leads = (data ?? []) as InvitedLead[];
  if (leads.length === 0) {
    return <Empty />;
  }

  return (
    <div className="space-y-3">
      {leads.map((l) => {
        const phone = l.whatsapp ?? l.telefono;
        const waLink = toWhatsappLink(phone);
        return (
          <article
            key={l.id}
            className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-4 md:p-5"
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Building2 className="h-4 w-4 text-primary shrink-0" />
                  <Link
                    href={`/dashboard?lead=${l.id}`}
                    className="text-base md:text-lg font-bold text-foreground hover:text-primary transition-colors truncate"
                  >
                    {l.ragione_sociale}
                  </Link>
                  <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                    {l.piva}
                  </span>
                  {statusBadge(l.survey_status)}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  {waLink ? (
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:text-primary/80 transition-colors"
                    >
                      {phone}
                    </a>
                  ) : (
                    <span className="text-muted-foreground/60">
                      Nessun contatto
                    </span>
                  )}
                  <span>
                    Invitato {formatDate(l.survey_sent_at)}
                  </span>
                  {l.survey_last_step_at &&
                    l.survey_status !== "completed" && (
                      <span>
                        Ultima attività {formatDate(l.survey_last_step_at)}
                      </span>
                    )}
                  {l.survey_completed_at && (
                    <span className="text-primary">
                      Completato {formatDate(l.survey_completed_at)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={getSurveyUrl(l.survey_token)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Link invito
                </a>
                <Link
                  href={`/dashboard?lead=${l.id}`}
                  className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 px-3 h-8 text-xs font-semibold transition-colors"
                >
                  Apri lead
                </Link>
              </div>
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
      <Send className="h-8 w-8 mx-auto text-muted-foreground/40 mb-3" />
      <h3 className="text-base font-bold text-foreground mb-1">
        Nessun lead invitato
      </h3>
      <p className="text-sm text-muted-foreground">
        Apri un lead e clicca <strong>Segna come invitato</strong> per
        aggiungerlo a questa lista.
      </p>
    </div>
  );
}
