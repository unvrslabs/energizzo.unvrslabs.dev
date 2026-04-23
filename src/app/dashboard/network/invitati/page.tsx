import Link from "next/link";
import { Building2, ExternalLink, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getSurveyUrl } from "@/lib/public-urls";

export const dynamic = "force-dynamic";
export const metadata = { title: "Invitati · Admin v2" };

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function onlyDigits(s: string | null): string {
  return (s ?? "").replace(/\D/g, "");
}

const STATUS_CONFIG: Record<string, { label: string; bg: string; fg: string }> = {
  sent: { label: "Invitato", bg: "hsl(var(--v2-info) / 0.14)", fg: "hsl(var(--v2-info))" },
  partial: { label: "In corso", bg: "hsl(var(--v2-warn) / 0.14)", fg: "hsl(var(--v2-warn))" },
  completed: { label: "Completato", bg: "hsl(var(--v2-accent) / 0.14)", fg: "hsl(var(--v2-accent))" },
  not_sent: { label: "Non inviato", bg: "hsl(var(--v2-border))", fg: "hsl(var(--v2-text-mute))" },
};

export default async function InvitatiPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("leads")
    .select("id, ragione_sociale, piva, whatsapp, telefono, survey_token, survey_status, survey_sent_at, survey_last_step_at, survey_completed_at")
    .not("survey_sent_at", "is", null)
    .neq("survey_status", "completed")
    .order("survey_sent_at", { ascending: false });

  const rows = data ?? [];

  const GRID = "minmax(240px, 1.8fr) 150px 120px 170px 120px 130px 110px";

  return (
    <div className="v2-card overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: "1200px" }}>
          <div
            className="grid gap-3 px-4 py-3 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              gridTemplateColumns: GRID,
              color: "hsl(var(--v2-text-mute))",
              borderBottom: "1px solid hsl(var(--v2-border))",
            }}
          >
            <span>Azienda</span>
            <span>P.IVA</span>
            <span>Stato</span>
            <span>Contatto</span>
            <span>Invitato</span>
            <span>Ultima att.</span>
            <span className="text-right">Link</span>
          </div>

          <ul>
            {rows.length === 0 ? (
              <li className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Nessun lead invitato al network.
              </li>
            ) : (
              rows.map((l) => {
                const st = STATUS_CONFIG[l.survey_status ?? "sent"] ?? STATUS_CONFIG.not_sent;
                const contact = l.whatsapp ?? l.telefono;
                return (
                  <li
                    key={l.id}
                    className="grid gap-3 px-4 py-3 items-center"
                    style={{
                      gridTemplateColumns: GRID,
                      borderBottom: "1px solid hsl(var(--v2-border))",
                    }}
                  >
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--v2-text-mute))" }} />
                  <Link
                    href={`/dashboard?lead=${l.id}`}
                    className="text-[13px] font-medium truncate hover:underline"
                    style={{ color: "hsl(var(--v2-text))" }}
                  >
                    {l.ragione_sociale ?? "—"}
                  </Link>
                </div>

                <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {l.piva ?? "—"}
                </span>

                <span
                  className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
                  style={{ background: st.bg, color: st.fg }}
                >
                  {st.label}
                </span>

                {contact ? (
                  <Link
                    href={`https://wa.me/${onlyDigits(contact)}`}
                    target="_blank"
                    className="v2-mono text-[11px] inline-flex items-center gap-1 hover:underline"
                    style={{ color: "hsl(var(--v2-accent))" }}
                  >
                    <MessageCircle className="w-3 h-3" />
                    {contact}
                  </Link>
                ) : (
                  <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>—</span>
                )}

                <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {fmtDate(l.survey_sent_at)}
                </span>

                <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {fmtDate(l.survey_last_step_at)}
                </span>

                <div className="flex justify-end">
                  <Link
                    href={getSurveyUrl(l.survey_token)}
                    target="_blank"
                    className="v2-btn"
                    style={{ padding: "4px 10px", fontSize: "11px" }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Invito
                  </Link>
                </div>
              </li>
            );
          })
        )}
          </ul>
        </div>
      </div>
    </div>
  );
}
