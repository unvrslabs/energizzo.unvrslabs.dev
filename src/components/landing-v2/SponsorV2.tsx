import { ArrowUpRight } from "lucide-react";

export function SponsorV2() {
  return (
    <section className="lv2-section" style={{ paddingTop: 60, paddingBottom: 60 }}>
      <div className="lv2-container">
        <div
          className="lv2-card lv2-card--emerald"
          style={{ padding: "clamp(28px, 5vw, 48px)" }}
        >
          <div className="grid gap-8 md:grid-cols-[auto_1fr_auto] md:items-center">
            <div className="flex flex-col gap-2">
              <span
                className="lv2-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "hsl(var(--lv2-accent))",
                }}
              >
                100% gratuito
              </span>
              <div
                className="lv2-serif flex items-baseline gap-1"
                style={{
                  fontStyle: "italic",
                  fontWeight: 300,
                  fontSize: "clamp(2.6rem, 5vw, 4rem)",
                  color: "hsl(var(--lv2-text))",
                  letterSpacing: "-0.02em",
                  lineHeight: 1,
                }}
              >
                €0
                <span
                  className="lv2-mono not-italic"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "hsl(var(--lv2-text-mute))",
                    fontWeight: 600,
                  }}
                >
                  · per sempre
                </span>
              </div>
            </div>

            <div className="md:px-6 md:border-l md:border-r md:border-[hsl(var(--lv2-border))]">
              <h3
                className="text-xl md:text-2xl font-bold tracking-tight mb-3"
                style={{ color: "hsl(var(--lv2-text))", letterSpacing: "-0.02em" }}
              >
                Il network è completamente gratuito. Ora e sempre.
              </h3>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "hsl(var(--lv2-text-dim))", maxWidth: 520 }}
              >
                Nessuna quota, nessun abbonamento, nessun costo nascosto. I
                costi operativi sono coperti da Energizzo: la redazione, i
                contenuti e la community restano indipendenti.
              </p>
            </div>

            <div className="flex flex-col gap-2 md:items-end">
              <span
                className="lv2-mono"
                style={{
                  fontSize: "10px",
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "hsl(var(--lv2-text-mute))",
                }}
              >
                Sponsor ufficiale
              </span>
              <a
                href="https://www.energizzo.it"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-baseline gap-1.5 transition-opacity hover:opacity-90"
              >
                <span
                  style={{
                    fontSize: "clamp(1.8rem, 3.2vw, 2.4rem)",
                    fontWeight: 900,
                    color: "hsl(var(--lv2-accent))",
                    letterSpacing: "-0.03em",
                    lineHeight: 1,
                  }}
                >
                  energizzo
                </span>
                <ArrowUpRight
                  className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                  style={{ color: "hsl(var(--lv2-accent))" }}
                />
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
