"use client";

import { useMemo } from "react";
import { ArrowRight, BarChart3, Lock, Sparkles } from "lucide-react";
import type { LeadForSurvey } from "@/lib/survey/survey-client";

const EMOJI = ["🎉", "🎊", "🏆", "✨", "📊", "⭐", "🎈", "🥳"];

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
            {/* confetti layer */}
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
                <strong>{lead.ragione_sociale}</strong> è stata selezionata per entrare nel
                primo <span className="text-primary font-semibold">report indipendente</span>{" "}
                sullo stato del reseller energia in Italia.
              </p>
              <p className="text-sm text-muted-foreground">
                Grazie per aver scansionato la card di invito.
              </p>
            </div>
          </header>

          <section className="liquid-glass-card p-6 sm:p-7 space-y-3">
            <h2 className="font-display text-xl tracking-wide">Di cosa si tratta</h2>
            <p className="text-sm leading-relaxed">
              Compilando <strong>24 domande in 3-5 minuti</strong> contribuisci al primo
              benchmark operativo del settore reseller energia. In cambio riceverai entro 60
              giorni un <strong>report privato</strong> con il posizionamento della tua
              azienda confrontata in anonimato con i peer della tua fascia dimensionale.
            </p>
            <p className="text-sm leading-relaxed">
              Tutte le risposte sono <strong>aggregate</strong>. Nessun dato individuale
              sarà mai pubblicato o associato al nome della tua azienda.
            </p>
          </section>

          <div className="grid sm:grid-cols-3 gap-3">
            <Feature
              icon={BarChart3}
              title="Benchmark privato"
              body="Confronta la tua azienda in anonimato con i peer."
            />
            <Feature
              icon={Lock}
              title="Dati aggregati"
              body="Nessun dato individuale associato al nome azienda."
            />
            <Feature
              icon={Sparkles}
              title="3–5 minuti"
              body="24 domande. Benchmark entro 60 giorni."
            />
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
            <button
              onClick={onStart}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-semibold h-12 px-7 text-base shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-shadow"
            >
              Inizia ora <ArrowRight className="h-4 w-4" />
            </button>
            <p className="text-xs text-muted-foreground">
              Il progresso viene salvato automaticamente: puoi riprendere in ogni momento.
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
