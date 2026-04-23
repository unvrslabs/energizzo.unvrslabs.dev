import Link from "next/link";
import { Flame, Mic, Radio, UserCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { GUEST_STATUS_CONFIG, type GuestStatus } from "@/lib/podcast-config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Home podcast · Admin v2" };

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function PodcastHomeV2() {
  const supabase = await createClient();
  const [guestsAll, hotTopicsRes, nextGuestRes, guestQuestionsRes] = await Promise.all([
    supabase.from("podcast_guests").select("id, status").order("updated_at", { ascending: false }),
    supabase
      .from("podcast_hot_topics")
      .select("id, title, intensity, body, active")
      .eq("active", true)
      .order("created_at", { ascending: false })
      .limit(6),
    supabase
      .from("podcast_guests")
      .select("id, external_name, external_company, recorded_at, lead:leads(ragione_sociale)")
      .eq("status", "confirmed")
      .not("recorded_at", "is", null)
      .order("recorded_at", { ascending: true })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("podcast_guest_questions")
      .select("question:podcast_questions(body, theme)")
      .limit(6),
  ]);

  const guests = (guestsAll.data ?? []) as { id: string; status: GuestStatus }[];
  const stats = {
    total: guests.length,
    invited: guests.filter((g) => g.status === "invited").length,
    confirmed: guests.filter((g) => g.status === "confirmed").length,
    published: guests.filter((g) => g.status === "published").length,
    target: guests.filter((g) => g.status === "target").length,
    recorded: guests.filter((g) => g.status === "recorded").length,
  };

  const hotTopics = hotTopicsRes.data ?? [];
  const nextGuest = nextGuestRes.data as
    | {
        id: string;
        external_name: string | null;
        external_company: string | null;
        recorded_at: string | null;
        lead: { ragione_sociale: string | null } | null;
      }
    | null;
  const briefingQuestions = ((guestQuestionsRes.data ?? []) as unknown as {
    question: { body: string; theme: string } | { body: string; theme: string }[] | null;
  }[])
    .map((r) => (Array.isArray(r.question) ? r.question[0] : r.question))
    .filter((q): q is { body: string; theme: string } => !!q);

  return (
    <div className="flex flex-col gap-5">
      {/* Stats ticker */}
      <div className="v2-ticker-row">
        <StatCell code="TARGET" label="In target" value={stats.target} icon={<Users />} tint="info" />
        <StatCell code="CONFIRMED" label="Confermati" value={stats.confirmed} icon={<UserCheck />} tint="accent" />
        <StatCell code="PUBLISHED" label="Pubblicati" value={stats.published} icon={<Radio />} tint="accent" />
      </div>

      <div className="v2-bento">
        {/* Next guest card */}
        <div className="v2-card v2-col-6 p-5">
          <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Prossimo ospite in arrivo
          </div>
          {nextGuest ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl grid place-items-center shrink-0" style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}>
                  <Mic className="w-6 h-6" style={{ color: "hsl(var(--v2-accent))" }} />
                </div>
                <div className="min-w-0">
                  <div className="text-[15px] font-semibold truncate" style={{ color: "hsl(var(--v2-text))" }}>
                    {nextGuest.lead?.ragione_sociale ?? nextGuest.external_name ?? "—"}
                  </div>
                  <div className="text-[12px] truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                    {nextGuest.external_company ?? "Ospite da CRM"}
                  </div>
                </div>
              </div>
              <div className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                Registrazione prevista · {fmtDate(nextGuest.recorded_at)}
              </div>
              <Link href={`/dashboard/podcast/ospiti`} className="v2-btn v2-btn--primary w-fit">
                Apri scheda ospite
              </Link>
            </div>
          ) : (
            <p className="text-[13px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessuna registrazione in agenda.
            </p>
          )}
        </div>

        {/* Hot topics */}
        <div className="v2-card v2-col-6">
          <div className="v2-card-head flex items-center gap-2">
            <Flame className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-danger))" }} />
            <span className="v2-card-title">Temi caldi · bollente</span>
          </div>
          {hotTopics.length === 0 ? (
            <div className="p-4 text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessun tema attivo.
            </div>
          ) : (
            <ul className="p-2.5 flex flex-col gap-1">
              {hotTopics.map((t) => (
                <li key={t.id} className="px-3 py-2 rounded-lg hover:bg-white/[0.02]">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px]">
                      {t.intensity === "bollente" ? "🔥" : t.intensity === "medio" ? "🌡️" : "❄️"}
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: "hsl(var(--v2-text))" }}>
                      {t.title}
                    </span>
                  </div>
                  {t.body && (
                    <p className="text-[11.5px] mt-1 line-clamp-2" style={{ color: "hsl(var(--v2-text-dim))" }}>
                      {t.body}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Briefing questions */}
        <div className="v2-card v2-col-12">
          <div className="v2-card-head flex items-center gap-2">
            <span className="v2-card-title">Anteprima domande briefing ospiti</span>
          </div>
          {briefingQuestions.length === 0 ? (
            <div className="p-5 text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessuna domanda agganciata agli ospiti.
            </div>
          ) : (
            <ul className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
              {briefingQuestions.map((q, i) => (
                <li
                  key={i}
                  className="p-3 rounded-lg"
                  style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
                >
                  <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em] mb-1" style={{ color: "hsl(var(--v2-accent))" }}>
                    {q.theme.replace(/_/g, " ")}
                  </div>
                  <p className="text-[12.5px] leading-relaxed" style={{ color: "hsl(var(--v2-text))" }}>
                    {q.body}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Status breakdown */}
        <div className="v2-card v2-col-12">
          <div className="v2-card-head flex items-center gap-2">
            <span className="v2-card-title">Pipeline ospiti per status</span>
          </div>
          <div className="p-4 grid grid-cols-2 md:grid-cols-6 gap-2">
            {Object.entries(stats).filter(([k]) => k !== "total" && k !== "invited").map(([k, v]) => {
              const cfg = GUEST_STATUS_CONFIG[k as GuestStatus];
              return (
                <div
                  key={k}
                  className="p-3 rounded-lg text-center"
                  style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
                >
                  <div className="v2-mono text-[24px] font-bold" style={{ color: cfg?.color ?? "hsl(var(--v2-text))" }}>
                    {v}
                  </div>
                  <div className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em] mt-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {cfg?.label ?? k}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  code,
  label,
  value,
  icon,
  tint,
}: {
  code: string;
  label: string;
  value: number;
  icon: React.ReactNode;
  tint: "accent" | "warn" | "info";
}) {
  const color =
    tint === "warn" ? "hsl(var(--v2-warn))" : tint === "info" ? "hsl(var(--v2-info))" : "hsl(var(--v2-accent))";
  return (
    <div className="v2-ticker-cell">
      <div className="v2-ticker-head">
        <span className="v2-ticker-code">{code}</span>
        <span style={{ color }}>{icon}</span>
      </div>
      <span className="v2-ticker-value" style={{ color }}>{value}</span>
      <span className="v2-ticker-label">{label}</span>
    </div>
  );
}
