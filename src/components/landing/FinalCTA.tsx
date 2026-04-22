import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 py-14 sm:py-20 md:py-24">
      <div
        className="dispaccio-card p-6 sm:p-10 md:p-16 text-center"
        style={{
          borderColor: "hsl(158 64% 42% / 0.3)",
          boxShadow:
            "0 0 0 1px hsl(158 64% 42% / 0.15), 0 24px 80px hsl(158 64% 42% / 0.15)",
        }}
      >
        <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.05]">
          Pronto a entrare{" "}
          <span className="gradient-text">nel network?</span>
        </h2>

        <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Compila il form di richiesta in cima alla pagina. La tua candidatura
          verrà analizzata dal team: se rispetti i requisiti ti ricontattiamo e
          ti spieghiamo la procedura di ammissione.
        </p>

        <a
          href="#iscrizione"
          className="btn-premium mt-6 sm:mt-10 px-6 sm:px-8 py-3 sm:py-4 rounded-full font-semibold text-sm sm:text-base"
        >
          Richiedi il tuo invito <ArrowRight className="h-4 w-4" />
        </a>

        <p className="mt-4 sm:mt-6 text-[11px] sm:text-xs text-muted-foreground/70">
          Nessuna quota · Accesso 100% gratuito · Su invito
        </p>
      </div>
    </section>
  );
}
