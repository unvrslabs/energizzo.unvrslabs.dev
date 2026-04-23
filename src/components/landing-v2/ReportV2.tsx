import { Lock, BarChart3, CalendarCheck, ArrowRight } from "lucide-react";

const CARDS = [
  {
    Icon: Lock,
    title: "Dati aggregati",
    desc: "Tutte le risposte sono in anonimato. Nessun dato individuale sarà mai pubblicato o associato al nome dell'azienda.",
  },
  {
    Icon: BarChart3,
    title: "Benchmark privato",
    desc: "Ogni partecipante riceve il posizionamento della propria azienda confrontata con i peer della stessa fascia dimensionale.",
  },
  {
    Icon: CalendarCheck,
    title: "Prima edizione",
    desc: "Autunno 2026. Aggiornamento annuale basato sulla nuova raccolta dati del network.",
  },
];

export function ReportV2() {
  return (
    <section id="report" className="lv2-section">
      <div className="lv2-container">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 items-start">
          <div>
            <div className="lv2-kicker mb-5">// Report Reseller Italia</div>
            <h2 className="lv2-h2 mb-5">
              Il primo report <em>indipendente</em> del settore.
            </h2>
            <p className="lv2-lede mb-6">
              Monitoriamo costi operativi, margini, switching, impatto AI,
              recupero crediti. Dati raccolti direttamente dagli operatori,
              aggregati in anonimato, restituiti come benchmark privato a ogni
              partecipante.
            </p>
            <a
              href="#richiedi"
              className="inline-flex items-center gap-2 font-semibold text-sm group"
              style={{ color: "hsl(var(--lv2-accent))" }}
            >
              Partecipa al survey
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </a>
            <p
              className="lv2-mono mt-4"
              style={{
                fontSize: "10.5px",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "hsl(var(--lv2-text-mute))",
              }}
            >
              Dati ARERA + 100+ reseller italiani
            </p>
          </div>

          <div className="grid gap-3">
            {CARDS.map((c) => (
              <article key={c.title} className="lv2-card lv2-card--hover flex gap-4">
                <div
                  className="shrink-0 grid place-items-center"
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 10,
                    background: "hsl(var(--lv2-accent) / 0.14)",
                    color: "hsl(var(--lv2-accent))",
                  }}
                >
                  <c.Icon className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h3
                    className="text-base font-bold tracking-tight mb-1"
                    style={{ color: "hsl(var(--lv2-text))" }}
                  >
                    {c.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: "hsl(var(--lv2-text-dim))" }}
                  >
                    {c.desc}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
