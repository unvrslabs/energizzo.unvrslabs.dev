import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import {
  FileText,
  Gauge,
  Mic,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Il Dispaccio · Il network dei reseller energia in Italia",
  description:
    "Delibere ARERA, tariffe di mercato, podcast, eventi privati e un report indipendente sul mercato reseller. Entra nel network.",
};

const SECTIONS = [
  {
    icon: FileText,
    title: "Delibere ARERA",
    desc: "Ogni settimana selezioniamo, commentiamo e rendiamo operativa ogni delibera che tocca il tuo lavoro.",
    badge: "Aggiornamenti settimanali",
  },
  {
    icon: Gauge,
    title: "Tariffe di mercato",
    desc: "Confronto in tempo reale delle offerte energia e gas per reseller. Pricing, margini, trend.",
    badge: "Benchmark live",
  },
  {
    icon: Mic,
    title: "Podcast Il Reseller",
    desc: "Conversazioni con chi fa il mercato: manager, esperti, reseller operativi. 10 episodi a stagione.",
    badge: "Nuovo episodio ogni lunedì",
  },
  {
    icon: Calendar,
    title: "Eventi privati",
    desc: "Incontri off-the-record, networking verticale, tavole tecniche ARERA e roadmap di settore.",
    badge: "Solo per membri",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32">
          <div className="flex items-center gap-3 mb-8">
            <Image
              src="/logo-energizzo.png"
              alt="Il Dispaccio"
              width={44}
              height={44}
              className="rounded-xl"
              priority
            />
            <span className="font-display text-sm font-bold tracking-[0.25em] uppercase text-muted-foreground">
              Il Dispaccio
            </span>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full liquid-glass px-3 py-1 mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[10px] font-semibold text-primary tracking-[0.2em] uppercase">
              Network dei reseller energia
            </span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl">
            Il punto di riferimento del{" "}
            <span className="gradient-text">reseller energia</span> in Italia.
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
            Delibere ARERA decifrate, tariffe benchmark, podcast operativo,
            eventi privati e un report indipendente sullo stato del mercato.
            Tutto in un unico posto.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="#iscrizione"
              className="btn-premium inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Entra nel network <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#sezioni"
              className="btn-ghost inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm"
            >
              Scopri le sezioni
            </Link>
          </div>
        </div>
      </header>

      <section id="sezioni" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
        <div className="mb-12 max-w-2xl">
          <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary mb-3">
            <Sparkles className="h-3.5 w-3.5" /> Cosa troverai
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Quattro sezioni operative, un unico network.
          </h2>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {SECTIONS.map((s) => (
            <article
              key={s.title}
              className="liquid-glass-card p-7 hover:liquid-glass-hover transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-muted-foreground">
                  {s.badge}
                </span>
              </div>
              <h3 className="font-display text-xl font-bold tracking-tight mb-2">
                {s.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {s.desc}
              </p>
              <div className="mt-5 text-xs text-muted-foreground/60 italic">
                In allestimento
              </div>
            </article>
          ))}
        </div>
      </section>

      <section
        id="iscrizione"
        className="mx-auto max-w-4xl px-6 py-20 sm:py-28"
      >
        <div className="liquid-glass-card p-10 sm:p-14 text-center space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 text-primary px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-bold">
            🏆 Accesso su invito
          </div>
          <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight">
            Entra nel network.
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Per entrare ti chiediamo di compilare un breve survey: 24 domande,
            3-5 minuti. Contribuirai al primo{" "}
            <strong className="text-foreground">
              report indipendente sullo stato del reseller energia in Italia
            </strong>
            , e riceverai il posizionamento della tua azienda.
          </p>
          <div className="pt-4">
            <a
              href="mailto:emanuele@unvrslabs.dev?subject=Richiesta%20accesso%20Il%20Dispaccio"
              className="btn-premium inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-sm"
            >
              Richiedi il tuo invito <ArrowRight className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Form di iscrizione diretta in arrivo.
          </p>
        </div>
      </section>

      <footer className="border-t border-border/40 py-12 text-center text-xs text-muted-foreground">
        <p>
          © {new Date().getFullYear()} Il Dispaccio ·{" "}
          <Link
            href="https://dash.ildispaccio.energy"
            className="hover:text-foreground transition-colors"
          >
            Area riservata
          </Link>
        </p>
      </footer>
    </main>
  );
}
