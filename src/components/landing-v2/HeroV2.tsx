import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

function CockpitPreview() {
  return (
    <div className="lv2-preview">
      <div className="lv2-preview-chrome">
        <span className="lv2-preview-dot" />
        <span className="lv2-preview-dot" />
        <span className="lv2-preview-dot" />
        <span className="lv2-preview-title">ildispaccio.energy / network</span>
      </div>
      <div className="lv2-preview-body">
        <div className="flex items-center justify-between mb-3">
          <span
            className="lv2-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "hsl(var(--lv2-text-mute))",
            }}
          >
            // cockpit reseller · live
          </span>
          <span
            className="lv2-mono"
            style={{
              fontSize: "10px",
              letterSpacing: "0.14em",
              color: "hsl(var(--lv2-accent))",
            }}
          >
            ● 23 apr · 2026
          </span>
        </div>

        <div className="lv2-preview-kpi">
          <div className="lv2-preview-kpi-cell">
            <span className="lv2-preview-kpi-label">PUN</span>
            <span className="lv2-preview-kpi-value">143,40</span>
            <span className="lv2-preview-kpi-delta">+25,3%</span>
          </div>
          <div className="lv2-preview-kpi-cell">
            <span className="lv2-preview-kpi-label">PSV</span>
            <span className="lv2-preview-kpi-value">0,5577</span>
            <span className="lv2-preview-kpi-delta">+48,0%</span>
          </div>
          <div className="lv2-preview-kpi-cell">
            <span className="lv2-preview-kpi-label">TTF</span>
            <span className="lv2-preview-kpi-value">14,74</span>
            <span className="lv2-preview-kpi-delta">+4,1%</span>
          </div>
        </div>

        <span
          className="lv2-mono"
          style={{
            fontSize: "10px",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "hsl(var(--lv2-text-mute))",
            display: "block",
            margin: "14px 0 8px",
          }}
        >
          Ultime delibere ARERA
        </span>

        <div className="lv2-preview-row">
          <div>
            <div className="lv2-preview-row-title">
              548/2025/R/eel — Revisione TRAS
            </div>
            <div className="lv2-preview-row-meta">22 apr · Operativa</div>
          </div>
          <span className="lv2-preview-row-meta">Impatto alto</span>
          <span className="lv2-preview-row-pill">AI</span>
        </div>
        <div className="lv2-preview-row">
          <div>
            <div className="lv2-preview-row-title">
              532/2025/R/gas — Oneri sistema gas
            </div>
            <div className="lv2-preview-row-meta">18 apr · Consultazione</div>
          </div>
          <span className="lv2-preview-row-meta">Impatto medio</span>
          <span className="lv2-preview-row-pill">AI</span>
        </div>
      </div>
    </div>
  );
}

export function HeroV2() {
  return (
    <section className="lv2-section" style={{ paddingTop: 140 }}>
      <div className="lv2-container">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:gap-16 items-center">
          <div>
            <div className="lv2-kicker mb-6">// Il network dei reseller energia</div>

            <h1 className="lv2-h1 mb-6">
              Il primo <em>network</em> dei reseller energia in Italia.
            </h1>

            <p className="lv2-lede mb-3">
              Delibere ARERA decifrate in bullet point, benchmark tariffario
              live, podcast editoriale &ldquo;Il Reseller&rdquo;, report
              indipendente annuale e cockpit riservato.
            </p>
            <p className="lv2-lede mb-9">
              Accesso gratuito su invito. 100 posti disponibili per il primo
              giro di selezioni.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <a href="#richiedi" className="lv2-btn-primary">
                Richiedi l&apos;invito
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link href="/network/login" className="lv2-btn-ghost">
                Accedi al cockpit
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4" style={{ color: "hsl(var(--lv2-accent))" }} />
                <span
                  className="lv2-mono"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                    color: "hsl(var(--lv2-text-dim))",
                  }}
                >
                  €0 · per sempre
                </span>
              </div>
              <span className="lv2-mono" style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "hsl(var(--lv2-text-mute))" }}>
                · sponsorizzato da energizzo
              </span>
            </div>
          </div>

          <CockpitPreview />
        </div>
      </div>
    </section>
  );
}
