import { UserPlus, ClipboardList, Sparkles } from "lucide-react";
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
    Icon: UserPlus,
    title: "Candidati",
    desc: "Richiedi l'invito lasciando ragione sociale, P.IVA e referente. Valutiamo profili: tutti i reseller operativi del mercato italiano sono benvenuti.",
  },
  {
    num: "02",
    Icon: ClipboardList,
    title: "Compila il survey",
    desc: "24 domande in 3-5 minuti: costi, switching, AI, morosità, compliance. Contribuisci al report indipendente del settore e riceverai il posizionamento della tua azienda.",
  },
  {
    num: "03",
    Icon: Sparkles,
    title: "Accesso completo",
    desc: "Sei dentro. Delibere, tariffe, podcast, eventi privati, community. Il report privato della tua azienda arriva entro 60 giorni.",
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
        <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
          In tre passi sei dentro
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          Nessuna quota. Nessuna burocrazia. L&apos;accesso dipende dal valore
          che porti al network.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.num}
            className="liquid-glass-card liquid-glass-hover p-8 flex flex-col relative overflow-hidden"
          >
            <span
              className="font-display font-black leading-none gradient-text select-none"
              style={{ fontSize: "6rem" }}
              aria-hidden
            >
              {s.num}
            </span>
            <div className="mt-2 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <s.Icon className="h-5 w-5" />
            </div>
            <h3 className="mt-4 font-display text-2xl font-bold tracking-tight">
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
