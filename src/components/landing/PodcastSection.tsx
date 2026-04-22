import { Radio, ArrowRight } from "lucide-react";

interface Episode {
  num: string;
  title: string;
  duration: string;
}

const EPISODES: Episode[] = [
  { num: "01", title: "STG verso il libero", duration: "22 min" },
  { num: "02", title: "Aste STG aggressive", duration: "18 min" },
  { num: "03", title: "Concentrazione & M&A", duration: "24 min" },
  { num: "04", title: "Nuova bolletta 2025", duration: "21 min" },
];

export function PodcastSection() {
  return (
    <section id="podcast" className="mx-auto max-w-6xl px-6 py-20 sm:py-24">
      <div className="liquid-glass-card p-8 sm:p-12 lg:p-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 mb-6">
              <span className="text-xs font-bold text-primary tracking-[0.15em] uppercase">
                Podcast settimanale
              </span>
            </div>

            <h2 className="font-display text-3xl sm:text-5xl font-black tracking-tight leading-[1.05]">
              Il Reseller —{" "}
              <span className="gradient-text">voci dal mercato.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
              Conversazioni 1-a-1 di 20 minuti con manager e operatori del
              settore reseller energia. STG, aste, M&amp;A, AI, recupero
              crediti, CER, telemarketing. Zero script, solo tecnicalia
              operativa.
            </p>

            <a
              href="#"
              className="btn-premium mt-8 px-6 py-3 rounded-full font-semibold text-sm"
            >
              Ascolta gli episodi <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {EPISODES.map((e) => (
              <article
                key={e.num}
                className="liquid-glass-card liquid-glass-hover p-5"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Radio className="h-4 w-4" />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-[0.15em] text-muted-foreground">
                    {e.duration}
                  </span>
                </div>
                <h3 className="font-display text-sm font-bold leading-snug">
                  <span className="text-muted-foreground">{e.num} · </span>
                  {e.title}
                </h3>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-border/30 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full liquid-glass px-4 py-2 text-xs font-semibold text-muted-foreground">
            10 episodi a stagione · Nuova puntata ogni lunedì
          </span>
        </div>
      </div>
    </section>
  );
}
