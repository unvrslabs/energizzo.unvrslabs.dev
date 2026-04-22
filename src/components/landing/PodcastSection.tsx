import { Play, Clock, ArrowRight, Video } from "lucide-react";

interface Episode {
  num: string;
  title: string;
  duration: string;
}

const FEATURED_EPISODE = {
  num: "01",
  title: "STG verso il libero",
  duration: "22 min",
  guest: "Marco Bianchi · Head of Trading, EnergyCo",
};

const UPCOMING: Episode[] = [
  { num: "02", title: "Aste STG aggressive", duration: "18 min" },
  { num: "03", title: "Concentrazione & M&A", duration: "24 min" },
  { num: "04", title: "Nuova bolletta 2025", duration: "21 min" },
];

export function PodcastSection() {
  return (
    <section id="podcast" className="mx-auto max-w-6xl px-4 sm:px-6 py-14 sm:py-20 md:py-24">
      <div className="dispaccio-card p-5 sm:p-8 md:p-12 lg:p-16">
        <div className="grid gap-8 sm:gap-10 lg:grid-cols-2 lg:gap-14 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/30 px-3 py-1 mb-4 sm:mb-6">
              <Video className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] sm:text-xs font-bold text-primary tracking-[0.15em] uppercase">
                Podcast video
              </span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-[1.05]">
              Il Reseller,{" "}
              <span className="gradient-text">voci dal mercato.</span>
            </h2>

            <p className="mt-4 sm:mt-5 text-sm sm:text-lg text-muted-foreground leading-relaxed">
              Interviste video 1 a 1 di 20 minuti con manager e operatori del
              settore reseller energia. STG, aste, M&amp;A, AI, recupero
              crediti, CER, telemarketing. Zero script, solo tecnicalia
              operativa.
            </p>

            <a
              href="#"
              className="btn-premium mt-6 sm:mt-8 px-6 py-3 rounded-full font-semibold text-sm"
            >
              Guarda gli episodi <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* Video card mockup */}
          <div className="space-y-4">
            <article
              className="group dispaccio-card aspect-video cursor-pointer rounded-3xl"
              style={{
                borderRadius: "1.5rem",
                overflow: "hidden",
                isolation: "isolate",
                transform: "translateZ(0)",
              }}
            >
              {/* Decorative bokeh */}
              <div
                aria-hidden
                className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-primary/20 blur-3xl"
              />
              <div
                aria-hidden
                className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-accent/15 blur-3xl"
              />

              {/* faux browser/camera chrome top */}
              <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-3 text-[10px] font-mono text-muted-foreground/70">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500/80" />
                  <span className="uppercase tracking-[0.2em] font-semibold">
                    REC
                  </span>
                </div>
                <span className="uppercase tracking-[0.2em]">
                  Ep.{FEATURED_EPISODE.num} · 4K · 1 a 1
                </span>
              </div>

              {/* Big play button */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-full bg-primary/30 blur-2xl animate-pulse"
                  />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/40 transition-transform duration-300 group-hover:scale-110">
                    <Play
                      className="w-8 h-8 text-primary-foreground translate-x-0.5"
                      fill="currentColor"
                    />
                  </div>
                </div>
              </div>

              {/* Info overlay bottom */}
              <div className="absolute bottom-0 inset-x-0 p-5 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
                <div className="flex items-end justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">
                      Episodio {FEATURED_EPISODE.num}
                    </p>
                    <h3 className="text-lg font-bold leading-tight truncate">
                      {FEATURED_EPISODE.title}
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground truncate">
                      {FEATURED_EPISODE.guest}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground/90 shrink-0">
                    <Clock className="w-3.5 h-3.5" />
                    {FEATURED_EPISODE.duration}
                  </div>
                </div>
              </div>
            </article>

            {/* Upcoming episodes compact list */}
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70 px-1">
                Prossimi episodi
              </p>
              {UPCOMING.map((e) => (
                <div
                  key={e.num}
                  className="dispaccio-card dispaccio-card-hover flex items-center gap-3 !rounded-xl px-3 py-2.5 text-sm cursor-pointer"
                >
                  <span className="text-xs font-mono text-muted-foreground/70 w-8">
                    {e.num}
                  </span>
                  <span className="flex-1 truncate font-medium">{e.title}</span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {e.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8 sm:mt-10 pt-6 sm:pt-8 border-t border-border/30 flex justify-center">
          <span className="inline-flex items-center gap-2 rounded-full liquid-glass px-3 sm:px-4 py-2 text-[11px] sm:text-xs font-semibold text-muted-foreground text-center">
            10 episodi a stagione · Interviste video in formato 1 a 1
          </span>
        </div>
      </div>
    </section>
  );
}
