import { ClipboardList, Search, MessageCircle } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Step {
  num: string;
  Icon: LucideIcon;
  title: string;
  desc: string;
}

const STEPS: Step[] = [
  {
    num: "01",
    Icon: ClipboardList,
    title: "Compila il form",
    desc: "Lascia ragione sociale, P.IVA, referente e contatto WhatsApp. Servono solo poche informazioni per presentarti.",
  },
  {
    num: "02",
    Icon: Search,
    title: "Analisi del profilo",
    desc: "La tua richiesta viene presa in carico e analizzata dal team per verificare che la tua azienda rispetti i requisiti di ammissione al network.",
  },
  {
    num: "03",
    Icon: MessageCircle,
    title: "Contatto e ammissione",
    desc: "Ti ricontattiamo con l'esito della valutazione. Se accettato, ti spieghiamo la procedura di ammissione e come iniziare a usare il network.",
  },
];

export function HowItWorks() {
  return (
    <section
      id="come-funziona"
      className="mx-auto max-w-6xl px-6 py-20 sm:py-24"
    >
      <div className="mb-14 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3 font-mono">
          // Come entri nel network
        </div>
        <h2 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
          In tre passi sei dentro
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          L&apos;accesso è su invito. Ogni candidatura viene valutata
          individualmente per garantire la qualità del network.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className="dispaccio-card dispaccio-card-hover p-8 flex flex-col relative overflow-hidden"
          >
            <span
              className="font-black leading-none gradient-text select-none"
              style={{ fontSize: "6rem" }}
              aria-hidden
            >
              {s.num}
            </span>
            <div className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <s.Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-2xl font-bold tracking-tight">
              {s.title}
            </h3>
            <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
