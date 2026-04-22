"use client";

import { useMemo } from "react";
import {
  ArrowRight,
  BookOpen,
  Gift,
  Mic,
  Sparkles,
  Users2,
} from "lucide-react";
import type { LeadForSurvey } from "@/lib/survey/survey-client";

const EMOJI = ["🎉", "🎊", "🏆", "✨", "⚡", "⭐", "🎈", "🥳"];

export function SurveyWelcome({
  lead,
  onStart,
}: {
  lead: LeadForSurvey;
  onStart: () => void;
}) {
  const confetti = useMemo(
    () =>
      Array.from({ length: 14 }).map((_, i) => {
        const seed = ((i * 2654435761) % 1000) / 1000;
        const seed2 = ((i * 1597 + 31) % 1000) / 1000;
        const seed3 = ((i * 7919 + 13) % 1000) / 1000;
        return {
          emoji: EMOJI[i % EMOJI.length],
          left: `${5 + seed * 90}%`,
          top: `${5 + seed2 * 80}%`,
          delay: `${-(seed3 * 2).toFixed(2)}s`,
          rotate: `${(seed3 - 0.5) * 60}deg`,
          size: 0.8 + seed * 0.6,
        };
      }),
    [],
  );

  return (
    <div className="fixed inset-0 overflow-y-auto">
      <div className="min-h-full px-6 py-16 sm:py-20 flex items-center">
        <div className="mx-auto max-w-3xl w-full animate-fade-in-up space-y-8">
          <header className="relative liquid-glass-card p-8 sm:p-10 text-center space-y-4 overflow-hidden">
            <div aria-hidden className="absolute inset-0 pointer-events-none">
              {confetti.map((c, i) => (
                <span
                  key={i}
                  className="absolute animate-bounce opacity-50"
                  style={{
                    left: c.left,
                    top: c.top,
                    animationDelay: c.delay,
                    animationDuration: "2.4s",
                    transform: `rotate(${c.rotate}) scale(${c.size})`,
                    fontSize: "1.25rem",
                  }}
                >
                  {c.emoji}
                </span>
              ))}
            </div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 text-primary px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-bold">
                🏆 Azienda selezionata
              </div>
              <h1 className="font-display text-3xl sm:text-5xl tracking-tight">
                Complimenti! 🎉
              </h1>
              <p className="text-base sm:text-lg">
                <strong>{lead.ragione_sociale}</strong> è stata selezionata per
                entrare nel primo network italiano dei reseller energia:{" "}
                <span className="text-primary font-semibold">Il Dispaccio</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Hai accesso riservato. Attivalo compilando il questionario qui
                sotto.
              </p>
            </div>
          </header>

          <section className="liquid-glass-card p-6 sm:p-7 space-y-3">
            <h2 className="font-display text-xl tracking-wide">
              Cosa trovi nel network
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Il Dispaccio è lo spazio di lavoro comune dei reseller energia
              italiani. Un luogo indipendente dove comprendere il mercato,
              confrontarsi tra pari e anticipare le decisioni dei regolatori.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 pt-2">
              <Feature
                icon={BookOpen}
                title="Delibere intelligenti"
                body="Ogni delibera ARERA analizzata dall'AI con impatto operativo sul tuo business."
              />
              <Feature
                icon={Sparkles}
                title="Report mensile"
                body="Benchmark indipendente del mercato reseller Italia, aggiornato ogni mese."
              />
              <Feature
                icon={Mic}
                title="Il Reseller · Podcast"
                body="Conversazioni con i CEO/COO del settore. Accesso in anteprima agli episodi."
              />
              <Feature
                icon={Users2}
                title="Community riservata"
                body="Spazio di confronto tra reseller ammessi. Zero fornitori, zero consulenti, zero spam."
              />
            </div>
          </section>

          <section className="relative overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/[0.12] via-primary/[0.04] to-transparent backdrop-blur-sm p-6 sm:p-7">
            <div className="flex items-start gap-4">
              <div className="shrink-0 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/20 border border-primary/40">
                <Gift className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-display text-xl tracking-wide mb-1">
                  100% gratuito. Per sempre.
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  L&apos;iscrizione al network è gratuita e tutte le
                  funzionalità lo resteranno. Non ci sarà{" "}
                  <strong className="text-foreground">mai</strong> alcun costo
                  per la tua azienda: niente fee di ingresso, niente
                  abbonamento, niente upgrade a pagamento.
                </p>
              </div>
            </div>
          </section>

          <section className="liquid-glass-card p-6 sm:p-7 space-y-2">
            <h2 className="font-display text-xl tracking-wide">
              Come attivi l&apos;accesso
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Compila il questionario di ingresso (
              <strong className="text-foreground">24 domande, 3–5 minuti</strong>
              ). Il questionario serve a capire come sei posizionato nel mercato
              e a calibrare i contenuti del network.
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Alla fine lasci il tuo WhatsApp e{" "}
              <strong className="text-foreground">
                accedi subito alla piattaforma
              </strong>
              : zero attese, zero approvazioni manuali.
            </p>
          </section>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold h-12 px-7 text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
            >
              Attiva il mio accesso <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-muted-foreground">
              Il progresso viene salvato: puoi riprendere in qualsiasi momento.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Feature({
  icon: Icon,
  title,
  body,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
}) {
  return (
    <div className="liquid-glass-hover rounded-[1.25rem] p-4">
      <div
        className="inline-flex h-9 w-9 items-center justify-center rounded-xl"
        style={{
          background:
            "linear-gradient(135deg, hsl(158 64% 42% / 0.25), hsl(160 70% 36% / 0.15))",
          border: "1px solid hsl(158 64% 42% / 0.3)",
        }}
      >
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <h3 className="mt-3 font-display text-sm font-semibold">{title}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
