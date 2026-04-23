import { Play, Clock, ArrowRight, Video } from "lucide-react";

const FEATURED = {
  num: "01",
  title: "STG verso il libero",
  guest: "Marco Bianchi · Head of Trading, EnergyCo",
  duration: "22 min",
};

const UPCOMING = [
  { num: "02", title: "Aste STG aggressive", duration: "18 min" },
  { num: "03", title: "Concentrazione & M&A", duration: "24 min" },
  { num: "04", title: "Nuova bolletta 2026", duration: "21 min" },
];

export function PodcastV2() {
  return (
    <section id="podcast" className="lv2-section">
      <div className="lv2-container">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16 items-center">
          <div>
            <div className="lv2-kicker mb-5">// Podcast editoriale</div>
            <h2 className="lv2-h2 mb-5">
              &ldquo;Il Reseller&rdquo;, <em>voci</em> dal mercato.
            </h2>
            <p className="lv2-lede mb-3">
              Interviste video 1 a 1 di 20 minuti con manager e operatori del
              settore reseller energia. STG, aste, M&amp;A, AI, recupero
              crediti, CER, telemarketing.
            </p>
            <p className="lv2-lede mb-8">
              Zero script, solo tecnicalia operativa. Ogni ospite riceve un
              invito editoriale dedicato, con briefing puntata e knowledge base.
            </p>
            <a href="#richiedi" className="lv2-btn-ghost">
              Guarda gli episodi
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          <div>
            <article
              className="lv2-preview relative group"
              style={{
                aspectRatio: "16 / 10",
                cursor: "pointer",
                overflow: "hidden",
              }}
            >
              <div className="lv2-preview-chrome">
                <span
                  className="lv2-mono flex items-center gap-1.5"
                  style={{ fontSize: "10px", letterSpacing: "0.2em", color: "hsl(0 72% 62%)" }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 999,
                      background: "hsl(0 72% 62%)",
                      display: "inline-block",
                    }}
                  />
                  REC
                </span>
                <span style={{ flex: 1 }} />
                <Video className="w-3.5 h-3.5" style={{ color: "hsl(var(--lv2-text-mute))" }} />
                <span className="lv2-preview-title" style={{ margin: 0 }}>
                  Ep.{FEATURED.num} · 4K · 1 a 1
                </span>
              </div>

              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  background:
                    "radial-gradient(circle at 50% 50%, hsl(var(--lv2-accent) / 0.14), transparent 60%)",
                }}
              >
                <div
                  style={{
                    width: 84,
                    height: 84,
                    borderRadius: 999,
                    background:
                      "linear-gradient(135deg, hsl(var(--lv2-accent)), hsl(var(--lv2-accent-soft)))",
                    display: "grid",
                    placeItems: "center",
                    color: "hsl(215 30% 10%)",
                    boxShadow: "0 16px 40px hsl(var(--lv2-accent) / 0.35)",
                    transition: "transform 200ms ease",
                  }}
                  className="group-hover:scale-105"
                >
                  <Play className="w-8 h-8" fill="currentColor" />
                </div>
              </div>

              <div
                className="absolute bottom-0 inset-x-0 p-4"
                style={{
                  background:
                    "linear-gradient(to top, hsl(215 24% 5% / 0.92), hsl(215 24% 5% / 0.4), transparent)",
                }}
              >
                <div className="flex items-end justify-between gap-3">
                  <div className="min-w-0">
                    <span
                      className="lv2-mono"
                      style={{
                        fontSize: "10px",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "hsl(var(--lv2-accent))",
                      }}
                    >
                      Episodio {FEATURED.num}
                    </span>
                    <h3
                      className="font-bold truncate"
                      style={{
                        fontSize: 17,
                        marginTop: 4,
                        color: "hsl(var(--lv2-text))",
                        letterSpacing: "-0.015em",
                      }}
                    >
                      {FEATURED.title}
                    </h3>
                    <p
                      className="truncate"
                      style={{
                        fontSize: 12,
                        color: "hsl(var(--lv2-text-dim))",
                        marginTop: 2,
                      }}
                    >
                      {FEATURED.guest}
                    </p>
                  </div>
                  <div
                    className="lv2-mono shrink-0 flex items-center gap-1.5"
                    style={{
                      fontSize: 11,
                      color: "hsl(var(--lv2-text))",
                      fontWeight: 600,
                    }}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {FEATURED.duration}
                  </div>
                </div>
              </div>
            </article>

            <div className="mt-4 space-y-2">
              <span
                className="lv2-mono block"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "hsl(var(--lv2-text-mute))",
                  paddingLeft: 8,
                }}
              >
                Prossimi episodi
              </span>
              {UPCOMING.map((e) => (
                <div
                  key={e.num}
                  className="lv2-card lv2-card--hover flex items-center gap-3"
                  style={{ padding: "10px 14px", borderRadius: 10 }}
                >
                  <span
                    className="lv2-mono"
                    style={{
                      fontSize: 11,
                      color: "hsl(var(--lv2-text-mute))",
                      width: 22,
                    }}
                  >
                    {e.num}
                  </span>
                  <span
                    className="flex-1 truncate"
                    style={{ fontSize: 13.5, fontWeight: 500 }}
                  >
                    {e.title}
                  </span>
                  <span
                    className="lv2-mono"
                    style={{
                      fontSize: 11,
                      color: "hsl(var(--lv2-text-mute))",
                    }}
                  >
                    {e.duration}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
