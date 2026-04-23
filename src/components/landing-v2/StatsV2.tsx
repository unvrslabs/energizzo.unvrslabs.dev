const STATS = [
  {
    value: "100",
    suffix: "/100",
    label: "posti · primo giro",
    hint: "Selezione iniziale · in futuro aumenteremo",
  },
  {
    value: "23",
    suffix: null as string | null,
    label: "domande · 2 min",
    hint: "Il survey editoriale che attiva l'accesso al cockpit",
  },
  {
    value: "10",
    suffix: null as string | null,
    label: "episodi a stagione",
    hint: "Il Reseller · interviste video 1 a 1 di 20 minuti",
  },
  {
    value: "€0",
    suffix: null as string | null,
    label: "per sempre",
    hint: "Sponsorizzato da Energizzo, indipendente nei contenuti",
  },
];

export function StatsV2() {
  return (
    <section className="lv2-section" style={{ paddingTop: 40, paddingBottom: 40 }}>
      <div className="lv2-container">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="lv2-stat">
              <div className="lv2-stat-value">
                {s.value}
                {s.suffix && (
                  <span
                    className="lv2-serif"
                    style={{
                      fontStyle: "italic",
                      fontWeight: 300,
                      color: "hsl(var(--lv2-text-mute))",
                      fontSize: "0.7em",
                      marginLeft: 2,
                    }}
                  >
                    {s.suffix}
                  </span>
                )}
              </div>
              <div className="lv2-stat-label">{s.label}</div>
              <div className="lv2-stat-hint">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
