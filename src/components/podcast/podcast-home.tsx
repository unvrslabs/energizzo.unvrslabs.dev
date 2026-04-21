"use client";

import Link from "next/link";
import {
  Users2,
  MailCheck,
  CalendarCheck2,
  Podcast,
  ArrowRight,
  Flame,
  Mic,
  BookOpen,
  HelpCircle,
} from "lucide-react";
import type { PodcastGuest, PodcastHotTopic, PodcastGuestQuestion } from "@/lib/types";

type Stats = { total: number; invited: number; confirmed: number; published: number };

export function PodcastHome({
  stats,
  nextGuest,
  nextQuestions,
  hotTopics,
}: {
  stats: Stats;
  nextGuest: PodcastGuest | null;
  nextQuestions: PodcastGuestQuestion[];
  hotTopics: PodcastHotTopic[];
}) {
  const items = [
    { label: "Totale ospiti", value: stats.total, icon: Users2 },
    { label: "Invitati", value: stats.invited, icon: MailCheck },
    { label: "Confermati", value: stats.confirmed, icon: CalendarCheck2 },
    { label: "Pubblicati", value: stats.published, icon: Podcast },
  ];

  const nextName =
    nextGuest?.lead?.ragione_sociale ??
    nextGuest?.external_company ??
    nextGuest?.external_name ??
    null;

  const quickLinks = [
    { href: "/dashboard/podcast/ospiti", label: "Pipeline ospiti", icon: Users2 },
    { href: "/dashboard/podcast/domande", label: "Banca domande", icon: HelpCircle },
    { href: "/dashboard/podcast/temi-caldi", label: "Temi caldi", icon: Flame },
    { href: "/dashboard/podcast/glossario", label: "Glossario", icon: Mic },
    { href: "/dashboard/podcast/knowledge", label: "Knowledge", icon: BookOpen },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {items.map((it) => (
          <div
            key={it.label}
            className="liquid-glass rounded-[1.5rem] p-5 relative overflow-hidden"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
                  {it.label}
                </p>
                <p className="mt-1.5 text-4xl font-black tabular-nums">{it.value}</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 border border-white/10">
                <it.icon className="h-4 w-4" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {quickLinks.map((q) => (
          <Link
            key={q.href}
            href={q.href}
            className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-white/5 hover:bg-white/10 transition-colors"
          >
            <q.icon className="h-4 w-4" /> {q.label}
          </Link>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="liquid-glass rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Prossima intervista
          </h2>
          {nextGuest ? (
            <div className="mt-2">
              <div className="font-display text-xl">{nextName ?? "—"}</div>
              {nextGuest.recorded_at && (
                <div className="text-sm text-muted-foreground mt-1">
                  {new Date(nextGuest.recorded_at).toLocaleString("it-IT", {
                    dateStyle: "full",
                    timeStyle: "short",
                  })}
                </div>
              )}
              <Link
                href={`/dashboard/podcast/ospiti/${nextGuest.id}`}
                className="inline-flex items-center gap-1 text-sm text-primary mt-3"
              >
                Apri briefing <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mt-2">
              Nessun ospite confermato con data registrazione futura.
            </p>
          )}
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-400" /> Temi bollenti
          </h2>
          {hotTopics.length === 0 ? (
            <p className="text-sm text-muted-foreground mt-2">Nessun tema bollente attivo.</p>
          ) : (
            <div className="mt-2 space-y-2">
              {hotTopics.map((t) => (
                <Link
                  key={t.id}
                  href="/dashboard/podcast/temi-caldi"
                  className="block rounded-lg px-3 py-2 hover:bg-white/5"
                >
                  <div className="text-sm font-semibold">{t.title}</div>
                  {t.body && (
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                      {t.body}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {nextGuest && nextQuestions.length > 0 && (
        <div className="liquid-glass rounded-2xl p-5">
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
            Briefing domande · {nextQuestions.filter((q) => q.asked).length}/
            {nextQuestions.length} asked
          </h2>
          <div className="mt-3 space-y-1">
            {nextQuestions.map((gq) => (
              <div key={gq.question_id} className="flex items-start gap-2 text-sm">
                <span className={gq.asked ? "text-emerald-400" : "text-muted-foreground"}>
                  {gq.asked ? "✓" : "•"}
                </span>
                <span className={gq.asked ? "line-through text-muted-foreground" : ""}>
                  {gq.question?.body}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
