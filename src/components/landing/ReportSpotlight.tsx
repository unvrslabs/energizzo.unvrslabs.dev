import Link from "next/link";
import { ArrowRight, Lock, BarChart3, CalendarCheck } from "lucide-react";

const MINI_CARDS = [
  {
    Icon: Lock,
    title: "Dati aggregati",
    desc: "Tutte le risposte sono aggregate. Nessun dato individuale sarà mai pubblicato o associato al nome dell'azienda.",
  },
  {
    Icon: BarChart3,
    title: "Benchmark privato",
    desc: "Ogni partecipante riceve un report privato con il posizionamento della propria azienda confrontata in anonimato con i peer.",
  },
  {
    Icon: CalendarCheck,
    title: "Pubblicato ogni anno",
    desc: "Prima edizione pubblicata autunno 2026. Aggiornamento annuale basato sulla nuova raccolta dati.",
  },
];

export function ReportSpotlight() {
  return (
    <section id="report" className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 md:py-24">
      <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14 items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 mb-4 sm:mb-6">
            <span className="text-[10px] sm:text-xs font-bold text-primary tracking-[0.15em] uppercase">
              Report Reseller Italia 2026
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.1]">
            Il primo report indipendente{" "}
            <span className="gradient-text">del settore.</span>
          </h2>

          <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-muted-foreground leading-relaxed">
            Monitoriamo costi operativi, margini, switching, impatto AI,
            recupero crediti. Dati raccolti direttamente dagli operatori,
            aggregati in anonimato, restituiti come benchmark privato a ogni
            partecipante.
          </p>

          <Link
            href="#iscrizione"
            className="mt-6 sm:mt-8 inline-flex items-center gap-2 text-primary font-semibold text-sm group"
          >
            Compila il survey
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>

          <p className="mt-3 sm:mt-4 text-[10px] sm:text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
            Dati ARERA + 100+ reseller italiani
          </p>
        </div>

        <div className="grid gap-3 sm:gap-4">
          {MINI_CARDS.map((c) => (
            <article
              key={c.title}
              className="dispaccio-card dispaccio-card-hover p-4 sm:p-6 flex gap-3 sm:gap-4"
            >
              <div className="inline-flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <c.Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base sm:text-lg font-bold tracking-tight mb-1">
                  {c.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {c.desc}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
