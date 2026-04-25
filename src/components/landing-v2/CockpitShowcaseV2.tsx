"use client";

export function CockpitShowcaseV2() {
  return (
    <section className="lv2-section" style={{ paddingTop: "32px", paddingBottom: "32px" }}>
      <div className="lv2-container">
        <div className="cockpit-showcase-wrap">
          <div className="cockpit-showcase-inner">
            <div className="lv2-preview" style={{ width: "100%" }}>
              <div className="lv2-preview-chrome">
                <span className="lv2-preview-dot" />
                <span className="lv2-preview-dot" />
                <span className="lv2-preview-dot" />
                <span className="lv2-preview-title">ildispaccio.energy / network</span>
              </div>
              <div className="lv2-preview-body" style={{ padding: "28px 32px" }}>
                <div className="flex items-center justify-between mb-5">
                  <span
                    className="lv2-mono"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      color: "hsl(var(--lv2-text-mute))",
                    }}
                  >
                    // area riservata · live
                  </span>
                  <span
                    className="lv2-mono"
                    style={{
                      fontSize: "11px",
                      letterSpacing: "0.14em",
                      color: "hsl(var(--lv2-accent))",
                    }}
                  >
                    ● 25 apr · 2026
                  </span>
                </div>

                <div className="lv2-preview-kpi" style={{ gap: 18 }}>
                  <div className="lv2-preview-kpi-cell">
                    <span className="lv2-preview-kpi-label">PUN</span>
                    <span className="lv2-preview-kpi-value" style={{ fontSize: 32 }}>143,40</span>
                    <span className="lv2-preview-kpi-delta">+25,3%</span>
                  </div>
                  <div className="lv2-preview-kpi-cell">
                    <span className="lv2-preview-kpi-label">PSV</span>
                    <span className="lv2-preview-kpi-value" style={{ fontSize: 32 }}>0,5577</span>
                    <span className="lv2-preview-kpi-delta">+48,0%</span>
                  </div>
                  <div className="lv2-preview-kpi-cell">
                    <span className="lv2-preview-kpi-label">TTF</span>
                    <span className="lv2-preview-kpi-value" style={{ fontSize: 32 }}>14,74</span>
                    <span className="lv2-preview-kpi-delta">+4,1%</span>
                  </div>
                </div>

                <span
                  className="lv2-mono"
                  style={{
                    fontSize: "11px",
                    letterSpacing: "0.22em",
                    textTransform: "uppercase",
                    color: "hsl(var(--lv2-text-mute))",
                    display: "block",
                    margin: "22px 0 10px",
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
                <div className="lv2-preview-row">
                  <div>
                    <div className="lv2-preview-row-title">
                      511/2025/R/eel — Servizio default trasporto
                    </div>
                    <div className="lv2-preview-row-meta">12 apr · Operativa</div>
                  </div>
                  <span className="lv2-preview-row-meta">Impatto medio</span>
                  <span className="lv2-preview-row-pill">AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .cockpit-showcase-wrap {
          position: relative;
          display: flex;
          justify-content: center;
        }
        .cockpit-showcase-wrap::before {
          content: "";
          position: absolute;
          inset: -20px;
          background: radial-gradient(
            ellipse 60% 50% at 50% 50%,
            hsl(155 70% 45% / 0.12),
            transparent 70%
          );
          filter: blur(36px);
          pointer-events: none;
        }
        .cockpit-showcase-inner {
          position: relative;
          width: 100%;
          max-width: 880px;
        }
      `}</style>
    </section>
  );
}
