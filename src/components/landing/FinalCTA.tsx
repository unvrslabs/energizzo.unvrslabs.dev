import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
      <div
        className="liquid-glass-card p-10 sm:p-16 text-center"
        style={{
          borderColor: "hsl(158 64% 42% / 0.3)",
          boxShadow:
            "0 0 0 1px hsl(158 64% 42% / 0.15), 0 24px 80px hsl(158 64% 42% / 0.15)",
        }}
      >
        <h2 className="font-display text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
          Pronto a entrare{" "}
          <span className="gradient-text">nel network?</span>
        </h2>

        <p className="mt-5 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Compila il survey, ottieni il tuo benchmark privato, accedi a tutte
          le sezioni.
        </p>

        <a
          href="mailto:emanuele@unvrslabs.dev?subject=Richiesta%20accesso%20Il%20Dispaccio"
          className="btn-premium mt-10 px-8 py-4 rounded-full font-semibold text-sm sm:text-base"
        >
          Richiedi il tuo invito <ArrowRight className="h-4 w-4" />
        </a>

        <p className="mt-6 text-xs text-muted-foreground/70">
          Risposta entro 2 giorni lavorativi · Nessuna quota · Su invito
        </p>
      </div>
    </section>
  );
}
