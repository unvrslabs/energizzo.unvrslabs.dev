import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Ban,
  Phone,
  FileText,
} from "lucide-react";
import { createAdminClient } from "@/lib/supabase/admin";
import { maskPhone } from "@/lib/network/phone";
import {
  SURVEY_QUESTION_LABELS,
  SURVEY_QUESTION_ORDER,
} from "@/lib/survey-questions";
import { MemberActions } from "@/components/network-admin/member-actions";

export const dynamic = "force-dynamic";

type Member = {
  id: string;
  phone: string;
  ragione_sociale: string;
  piva: string;
  referente: string;
  approved_at: string | null;
  last_login_at: string | null;
  revoked_at: string | null;
  notes: string | null;
};

type SurveyResponseRow = {
  answers: Record<string, string | string[] | null>;
  completed: boolean | null;
  completed_at: string | null;
  current_step: number | null;
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

function renderAnswer(value: string | string[] | null): string {
  if (value === null || value === undefined) return "—";
  if (Array.isArray(value)) return value.length ? value.join(" · ") : "—";
  return value.toString().trim() || "—";
}

export default async function MemberDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_REGEX.test(id)) notFound();

  const supabase = createAdminClient();

  const { data: memberData } = await supabase
    .from("network_members")
    .select(
      "id, phone, ragione_sociale, piva, referente, approved_at, last_login_at, revoked_at, notes",
    )
    .eq("id", id)
    .maybeSingle();

  if (!memberData) notFound();
  const member = memberData as Member;

  const { data: leadRow } = await supabase
    .from("leads")
    .select("id")
    .eq("piva", member.piva)
    .maybeSingle();

  let survey: SurveyResponseRow | null = null;
  if (leadRow?.id) {
    const { data: surveyRow } = await supabase
      .from("survey_responses")
      .select("answers, completed, completed_at, current_step")
      .eq("lead_id", leadRow.id)
      .maybeSingle();
    survey = (surveyRow as SurveyResponseRow | null) ?? null;
  }

  const answers = survey?.answers ?? {};
  const answered = SURVEY_QUESTION_ORDER.filter((qid) => {
    const v = answers[qid];
    return v !== undefined && v !== null && v !== "" && !(Array.isArray(v) && v.length === 0);
  });

  const revoked = !!member.revoked_at;

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/network/membri"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Torna ai membri
      </Link>

      <section
        className={`rounded-2xl border backdrop-blur-sm p-6 md:p-8 ${revoked ? "border-red-500/20 bg-red-500/5" : "border-primary/20 bg-gradient-to-br from-primary/[0.06] via-white/[0.02] to-transparent"}`}
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Building2 className="h-5 w-5 text-primary shrink-0" />
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                {member.ragione_sociale}
              </h1>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono uppercase text-muted-foreground">
                {member.piva}
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
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2 text-sm">
              <Row label="Referente" value={member.referente} />
              <Row
                label="WhatsApp"
                value={
                  <a
                    href={toWhatsappLink(member.phone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors"
                  >
                    <Phone className="h-3 w-3" />
                    {member.phone}
                  </a>
                }
              />
              <Row label="Ammesso" value={formatDate(member.approved_at)} />
              <Row
                label="Ultimo accesso"
                value={
                  member.last_login_at ? formatDate(member.last_login_at) : "Mai"
                }
              />
            </div>
            {member.notes && (
              <p className="text-xs text-muted-foreground pt-2">
                <span className="uppercase tracking-widest font-semibold">
                  Note:
                </span>{" "}
                {member.notes}
              </p>
            )}
          </div>

          <MemberActions id={member.id} revoked={revoked} />
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm p-6 md:p-8 space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-primary">
            Questionario di ingresso
          </h2>
          {survey?.completed && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 text-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              <CheckCircle2 className="h-3 w-3" />
              Completato {formatDate(survey.completed_at)}
            </span>
          )}
          {survey && !survey.completed && (
            <span className="inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
              In corso · step {survey.current_step ?? 0}
            </span>
          )}
        </div>

        {answered.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Nessuna risposta registrata per questo membro.
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-3">
            {answered.map((qid) => {
              const label = SURVEY_QUESTION_LABELS[qid] ?? qid;
              return (
                <div
                  key={qid}
                  className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    <span className="font-mono text-primary">{qid}</span> ·{" "}
                    {label}
                  </p>
                  <p className="mt-1 text-sm text-foreground leading-relaxed">
                    {qid === "Q25_whatsapp"
                      ? maskPhone(renderAnswer(answers[qid]))
                      : renderAnswer(answers[qid])}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-0.5">
        {label}
      </dt>
      <dd className="text-sm text-foreground">{value}</dd>
    </div>
  );
}
