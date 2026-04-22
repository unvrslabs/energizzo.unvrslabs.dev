import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { StatCounter } from "./StatCounter";
import { BadgeMarquee } from "./BadgeMarquee";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,hsl(var(--primary)/0.15),transparent_60%)] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6 pt-16 pb-20 sm:pt-24 sm:pb-28">
        <div className="inline-flex items-center gap-2 rounded-full liquid-glass px-3 py-1 mb-6 animate-pulse-glow">
          <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] sm:text-xs font-semibold text-primary tracking-[0.2em] uppercase">
            Network dei reseller energia in Italia
          </span>
        </div>

        <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.05] max-w-4xl animate-fade-in-up">
          Il punto di riferimento del{" "}
          <span className="gradient-text">reseller energia</span> in Italia.
        </h1>

        <p className="mt-6 text-base sm:text-xl text-muted-foreground max-w-2xl leading-relaxed">
          Delibere ARERA decifrate, tariffe benchmark, podcast operativo,
          eventi privati e un report indipendente sullo stato del mercato.
          Tutto in un unico posto.
        </p>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="#iscrizione"
            className="btn-premium px-6 py-3 rounded-full font-semibold text-sm"
          >
            Entra nel network <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="#sezioni"
            className="btn-ghost"
          >
            Scopri le sezioni
          </Link>
        </div>

        <div className="mt-14 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCounter
            value={819}
            label="venditori attivi in Italia 2024. Erano 806 nel 2022."
          />
          <StatCounter
            value={25}
            suffix="%"
            label="tasso di switching 2024. 1 cliente su 4 ha cambiato fornitore."
          />
          <StatCounter
            value={37}
            suffix="M"
            label="punti di prelievo domestici nel mercato italiano."
          />
          <StatCounter
            value={108}
            prefix="€"
            suffix="/MWh"
            label="PUN medio 2024. Francia: 58. Spagna: 63."
          />
        </div>

        <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted-foreground/60">
          Fonte: ARERA — Relazione Annuale 2025
        </p>

        <div className="mt-14">
          <BadgeMarquee />
        </div>
      </div>
    </section>
  );
}
