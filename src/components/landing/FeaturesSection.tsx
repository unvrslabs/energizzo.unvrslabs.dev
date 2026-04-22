import {
  FileText,
  Gauge,
  Mic,
  Calendar,
  FileBarChart,
  Users,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  Icon: LucideIcon;
  title: string;
  badge: string;
  desc: string;
}

const FEATURES: Feature[] = [
  {
    Icon: FileText,
    title: "Delibere ARERA decifrate",
    badge: "Aggiornamenti settimanali",
    desc: "Ogni delibera ARERA commentata e resa operativa. Punti salienti, impatti pratici, template conformi. Niente più 80 pagine di tecnicalia.",
  },
  {
    Icon: Gauge,
    title: "Benchmark tariffario live",
    badge: "Dati aggiornati",
    desc: "Confronto in tempo reale delle offerte energia e gas. Vedi dove ti posizioni rispetto ai peer della tua fascia dimensionale.",
  },
  {
    Icon: Mic,
    title: 'Podcast "Il Reseller"',
    badge: "Ogni lunedì",
    desc: "10 episodi a stagione con manager e reseller operativi. STG, aste, M&A, AI, recupero crediti, CER. Conversazioni 1-a-1 senza script.",
  },
  {
    Icon: Calendar,
    title: "Eventi privati",
    badge: "Solo membri",
    desc: "Incontri off-the-record, tavole tecniche ARERA, networking verticale. Sei nella stanza giusta.",
  },
  {
    Icon: FileBarChart,
    title: "Report indipendente",
    badge: "Benchmark annuale",
    desc: "Il primo report del settore reseller energia italiano. 24 domande anonime → benchmark privato per la tua azienda entro 60 giorni.",
  },
  {
    Icon: Users,
    title: "Community privata",
    badge: "Peer-to-peer",
    desc: "Gruppo chiuso per CEO e COO di aziende reseller. Domande, casi pratici, best practice condivise. Zero spam, zero fornitori.",
  },
];

export function FeaturesSection() {
  return (
    <section id="sezioni" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="mb-12 max-w-3xl">
        <div className="text-xs font-semibold uppercase tracking-[0.25em] text-primary mb-3 font-mono">
          // Sezioni
        </div>
        <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-[1.1]">
          Tutto quello che serve per navigare il mercato{" "}
          <span className="gradient-text">reseller</span>
        </h2>
        <p className="mt-4 text-base sm:text-lg text-muted-foreground">
          6 aree operative. Un unico network. Aggiornamenti continui.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f) => (
          <article
            key={f.title}
            className="liquid-glass-card liquid-glass-hover p-7 group"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary transition-transform duration-300 group-hover:scale-110">
                <f.Icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                {f.badge}
              </span>
            </div>
            <h3 className="font-display text-xl font-bold tracking-tight mb-2">
              {f.title}
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {f.desc}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
