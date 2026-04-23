import { Check, HelpCircle, MessageCircle, Send } from "lucide-react";
import {
  PODCAST_COMMUNITY_QUESTIONS,
  PODCAST_EPISODES,
} from "@/lib/podcast/mock";
import { formatDateShortIt as formatDateIt } from "@/lib/date-utils";

export function PodcastQuestions() {
  return (
    <section className="grid gap-5 lg:grid-cols-[1fr,340px]">
      <div className="dispaccio-card rounded-[1.75rem] p-5 md:p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2.5">
            <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary border border-primary/30">
              <MessageCircle className="h-4 w-4" />
            </div>
            <h2 className="text-lg font-bold tracking-tight">
              Domande dalla community
            </h2>
          </div>
          <span className="text-[11px] text-muted-foreground">
            {PODCAST_COMMUNITY_QUESTIONS.length} domande
          </span>
        </div>

        <ul className="divide-y divide-white/5 -mx-1">
          {PODCAST_COMMUNITY_QUESTIONS.map((q) => {
            const linkedEpisode = q.answered_in_episode_slug
              ? PODCAST_EPISODES.find(
                  (e) => e.slug === q.answered_in_episode_slug,
                )
              : null;
            return (
              <li key={q.id} className="py-3 px-1 flex gap-3">
                <div className="pt-0.5">
                  {linkedEpisode ? (
                    <div
                      className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"
                      title="Risposta in episodio"
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-white/5 text-muted-foreground border border-white/10">
                      <HelpCircle className="h-3.5 w-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground leading-snug">
                    {q.question}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-muted-foreground flex-wrap">
                    <span className="font-semibold">{q.author}</span>
                    <span>· {q.company}</span>
                    <span>· {formatDateIt(q.submitted_at)}</span>
                    {linkedEpisode && (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-200">
                        Risposta EP {String(linkedEpisode.number).padStart(2, "0")}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      <aside className="dispaccio-card rounded-[1.75rem] p-5 md:p-6 space-y-3 bg-gradient-to-br from-primary/10 via-emerald-500/5 to-transparent">
        <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/20 text-primary border border-primary/30">
          <Send className="h-4 w-4" />
        </div>
        <h3 className="text-base font-bold tracking-tight">
          Hai una domanda?
        </h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Inviala ora e potrebbe diventare una puntata del podcast. Rispondiamo
          a ogni domanda via WhatsApp entro 48h.
        </p>
        <button
          type="button"
          disabled
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-br from-primary to-emerald-600 px-4 py-2 text-xs font-bold text-primary-foreground shadow-md shadow-primary/30 opacity-70 cursor-not-allowed w-full justify-center"
        >
          <Send className="h-3.5 w-3.5" />
          Invia una domanda
        </button>
        <p className="text-[10px] text-muted-foreground/70 text-center">
          Form in arrivo
        </p>
      </aside>
    </section>
  );
}
