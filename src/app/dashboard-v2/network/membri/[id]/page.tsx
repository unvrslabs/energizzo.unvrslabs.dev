import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Building2, Clock, MessageCircle, UserCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { maskPhone } from "@/lib/network/phone";
import { SURVEY_QUESTION_LABELS, SURVEY_QUESTION_ORDER } from "@/lib/survey-questions";
import { MemberActionsV2 } from "@/components/admin-v2/member-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dettaglio membro · Admin v2" };

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function onlyDigits(s: string | null): string {
  return (s ?? "").replace(/\D/g, "");
}

function formatAnswer(qid: string, value: string | string[] | null): string {
  if (value === null || value === undefined) return "—";
  if (qid === "Q25_whatsapp" && typeof value === "string") return maskPhone(value);
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: member } = await supabase
    .from("network_members")
    .select("id, phone, ragione_sociale, piva, referente, approved_at, last_login_at, revoked_at, notes")
    .eq("id", id)
    .maybeSingle();

  if (!member) notFound();

  type SurveyData = {
    answers: Record<string, string | string[] | null>;
    completed: boolean;
    completed_at: string | null;
    current_step: number;
  };
  let survey: SurveyData | null = null;

  if (member.piva) {
    const { data: leadRow } = await supabase
      .from("leads")
      .select("id")
      .eq("piva", member.piva)
      .maybeSingle();

    if (leadRow?.id) {
      const { data: sr } = await supabase
        .from("survey_responses")
        .select("answers, completed, completed_at, current_step")
        .eq("lead_id", leadRow.id)
        .maybeSingle();
      if (sr) {
        survey = sr as unknown as SurveyData;
      }
    }
  }

  const revoked = !!member.revoked_at;

  return (
    <div className="flex flex-col gap-5">
      <Link href="/dashboard-v2/network/membri" className="v2-btn v2-btn--ghost w-fit">
        <ArrowLeft className="w-3.5 h-3.5" />
        Torna ai membri
      </Link>

      {/* Profile card */}
      <div className="v2-card p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3 min-w-0">
            <div
              className="w-12 h-12 rounded-xl grid place-items-center shrink-0"
              style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
            >
              <Building2 className="w-6 h-6" style={{ color: "hsl(var(--v2-accent))" }} />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl md:text-2xl font-semibold tracking-tight truncate" style={{ color: "hsl(var(--v2-text))" }}>
                {member.ragione_sociale}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className="v2-mono text-[10.5px] px-2 py-0.5 rounded"
                  style={{ background: "hsl(var(--v2-bg-elev))", color: "hsl(var(--v2-text-dim))", border: "1px solid hsl(var(--v2-border))" }}
                >
                  {member.piva ?? "—"}
                </span>
                <span
                  className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded"
                  style={{
                    background: revoked ? "hsl(var(--v2-danger) / 0.14)" : "hsl(var(--v2-accent) / 0.14)",
                    color: revoked ? "hsl(var(--v2-danger))" : "hsl(var(--v2-accent))",
                  }}
                >
                  {revoked ? "Revocato" : "Attivo"}
                </span>
              </div>
            </div>
          </div>
          <MemberActionsV2 id={member.id} revoked={revoked} />
        </div>

        {/* Profile grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <ProfileField label="Referente" value={member.referente ?? "—"} icon={<UserCheck className="w-3 h-3" />} />
          <ProfileField
            label="WhatsApp"
            value={member.phone}
            mono
            link={member.phone ? `https://wa.me/${onlyDigits(member.phone)}` : undefined}
            icon={<MessageCircle className="w-3 h-3" />}
          />
          <ProfileField label="Ammesso" value={fmtDate(member.approved_at)} mono />
          <ProfileField
            label="Ultimo accesso"
            value={member.last_login_at ? fmtDate(member.last_login_at) : "mai"}
            mono
            icon={<Clock className="w-3 h-3" />}
          />
        </div>

        {member.notes && (
          <div
            className="mt-5 p-3 rounded-lg text-[12.5px] leading-relaxed"
            style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))", color: "hsl(var(--v2-text-dim))" }}
          >
            <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] mb-1.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Note admin
            </div>
            {member.notes}
          </div>
        )}
      </div>

      {/* Survey */}
      <div className="v2-card overflow-hidden">
        <div className="v2-card-head flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="v2-card-title">Questionario di ingresso</span>
          </div>
          {survey && (
            <span
              className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded"
              style={{
                background: survey.completed ? "hsl(var(--v2-accent) / 0.14)" : "hsl(var(--v2-warn) / 0.14)",
                color: survey.completed ? "hsl(var(--v2-accent))" : "hsl(var(--v2-warn))",
              }}
            >
              {survey.completed ? `Completato · ${fmtDate(survey.completed_at)}` : `In corso · step ${survey.current_step}`}
            </span>
          )}
        </div>

        {!survey ? (
          <div className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Nessuna survey compilata.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 p-4 gap-2">
            {SURVEY_QUESTION_ORDER.map((qid) => {
              const label = SURVEY_QUESTION_LABELS[qid] ?? qid;
              const ans = formatAnswer(qid, survey.answers[qid] ?? null);
              return (
                <div
                  key={qid}
                  className="p-3 rounded-lg"
                  style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="v2-mono text-[10px] font-bold" style={{ color: "hsl(var(--v2-accent))" }}>{qid}</span>
                    <span className="text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>{label}</span>
                  </div>
                  <div className="text-[13px]" style={{ color: "hsl(var(--v2-text))" }}>{ans}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function ProfileField({
  label,
  value,
  icon,
  mono,
  link,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  mono?: boolean;
  link?: string;
}) {
  const valueEl = mono ? (
    <span className="v2-mono text-[13px]">{value}</span>
  ) : (
    <span className="text-[13px]">{value}</span>
  );
  return (
    <div>
      <div className="flex items-center gap-1.5 v2-mono text-[9.5px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
        {icon}
        {label}
      </div>
      <div className="mt-1 truncate" style={{ color: "hsl(var(--v2-text))" }}>
        {link ? (
          <Link href={link} target="_blank" className="hover:underline" style={{ color: "hsl(var(--v2-accent))" }}>
            {valueEl}
          </Link>
        ) : (
          valueEl
        )}
      </div>
    </div>
  );
}
