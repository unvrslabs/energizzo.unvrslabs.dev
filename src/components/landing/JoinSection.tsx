import { Check, ArrowRight } from "lucide-react";

const CORE_FEATURES = [
  "Delibere decifrate",
  "Benchmark tariffario",
  "Podcast",
  "Eventi privati",
  "Report privato",
  "Community CEO",
];

export function JoinSection() {
  return (
    <section id="iscrizione" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-14 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3 font-mono">
          // Chi può entrare
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
          Il network è aperto ai reseller operativi del{" "}
          <span className="gradient-text">mercato italiano</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Nessuna quota. L&apos;ingresso è su invito e dipende dal profilo.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
        {/* LEFT */}
        <article className="liquid-glass-card liquid-glass-hover p-8 flex flex-col">
          <h3 className="text-xl font-bold tracking-tight">
            Venditori energia
          </h3>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">
            Società di vendita con contratti attivi sul mercato libero
            italiano. Elettrico, gas o entrambi. Da 100 a 500.000 clienti
            finali.
          </p>
        </article>

        {/* CENTER (highlighted) */}
        <div className="relative md:scale-[1.03]">
          <span className="absolute -top-3 left-1/2 -translate-x-1/2 z-10 inline-flex items-center px-3 py-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-[0.2em] shadow-lg shadow-primary/40">
            Accesso completo
          </span>
          <article
            className="liquid-glass-card p-8 flex flex-col h-full border border-primary/40"
            style={{
              boxShadow:
                "0 0 0 1px hsl(158 64% 42% / 0.25), 0 20px 60px hsl(158 64% 42% / 0.2)",
            }}
          >
            <h3 className="text-2xl font-bold tracking-tight">Network Core</h3>
            <p className="mt-4 text-sm text-muted-foreground leading-relaxed">
              Tutte le sezioni: delibere, tariffe, podcast, eventi, report
              privato, community CEO. Su invito, post survey.
            </p>

            <ul className="mt-6 space-y-2.5 flex-1">
              {CORE_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary flex-shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <a
              href="mailto:emanuele@unvrslabs.dev?subject=Richiesta%20accesso%20Il%20Dispaccio"
              className="btn-premium mt-8 px-6 py-3 rounded-full font-semibold text-sm w-full"
            >
              Richiedi invito <ArrowRight className="h-4 w-4" />
            </a>
          </article>
        </div>

        {/* RIGHT */}
        <article className="liquid-glass-card liquid-glass-hover p-8 flex flex-col">
          <h3 className="text-xl font-bold tracking-tight">
            Consulenti e analisti
          </h3>
          <p className="mt-4 text-sm text-muted-foreground leading-relaxed flex-1">
            Professionisti che lavorano con operatori energia: advisor, studi
            legali, società tech. Accesso limitato a contenuti pubblici +
            podcast.
          </p>
        </article>
      </div>
    </section>
  );
}
