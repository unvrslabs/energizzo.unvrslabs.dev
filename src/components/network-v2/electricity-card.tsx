import { Zap, ArrowRight, Info } from "lucide-react";

export function ElectricityCard() {
  return (
    <div className="v2-card v2-col-6 flex flex-col">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-warn))" }} />
          <span className="v2-card-title">Mercato elettrico</span>
        </div>
        <span
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
          style={{
            color: "hsl(var(--v2-warn))",
            background: "hsl(var(--v2-warn) / 0.1)",
            border: "1px solid hsl(var(--v2-warn) / 0.28)",
          }}
        >
          in arrivo
        </span>
      </div>

      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* Big placeholder gauge (mimica layout gas) */}
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="flex items-baseline gap-2">
            <span
              className="v2-mono"
              style={{
                fontSize: 46,
                fontWeight: 700,
                lineHeight: 1,
                color: "hsl(var(--v2-text-mute))",
                letterSpacing: "-0.02em",
              }}
            >
              —
            </span>
            <span
              className="v2-mono"
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "hsl(var(--v2-text-mute))",
              }}
            >
              €/MWh · PUN
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="v2-mono inline-flex items-center gap-1 text-[11.5px] font-semibold px-2 py-1 rounded"
              style={{
                color: "hsl(var(--v2-text-mute))",
                background: "hsl(var(--v2-bg-elev))",
                border: "1px solid hsl(var(--v2-border))",
              }}
            >
              <Info className="w-3 h-3" />
              dati non disponibili
            </span>
          </div>
        </div>

        {/* Empty bar */}
        <div
          className="w-full h-1.5 rounded-full overflow-hidden"
          style={{
            background: "hsl(var(--v2-bg-elev))",
            border: "1px solid hsl(var(--v2-border))",
          }}
        />

        {/* Empty KPI row */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Zona Nord", unit: "€/MWh" },
            { label: "Spread N/S", unit: "€/MWh" },
            { label: "Mix rinnovabili", unit: "%" },
          ].map((k) => (
            <div
              key={k.label}
              className="rounded-lg p-2.5"
              style={{
                background: "hsl(var(--v2-bg-elev))",
                border: "1px solid hsl(var(--v2-border))",
              }}
            >
              <div
                className="v2-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] mb-1"
                style={{ color: "hsl(var(--v2-text-mute))" }}
              >
                {k.label}
              </div>
              <div className="flex items-baseline gap-1.5">
                <span
                  className="v2-mono"
                  style={{
                    fontSize: 18,
                    fontWeight: 700,
                    color: "hsl(var(--v2-text-mute))",
                    letterSpacing: "-0.01em",
                  }}
                >
                  —
                </span>
                <span
                  className="v2-mono"
                  style={{ fontSize: 10, color: "hsl(var(--v2-text-mute))" }}
                >
                  {k.unit}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div
          className="mt-auto rounded-lg p-3 flex items-start gap-2.5"
          style={{
            background: "hsl(var(--v2-accent) / 0.06)",
            border: "1px solid hsl(var(--v2-accent) / 0.2)",
          }}
        >
          <ArrowRight
            className="w-3.5 h-3.5 shrink-0 mt-0.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          />
          <div>
            <p
              className="text-[12.5px] font-semibold"
              style={{ color: "hsl(var(--v2-text))" }}
            >
              PUN, prezzi zonali e mix rinnovabili in arrivo
            </p>
            <p
              className="text-[11.5px] leading-relaxed mt-0.5"
              style={{ color: "hsl(var(--v2-text-dim))" }}
            >
              Stiamo attivando ENTSO-E Transparency Platform. Dati reali appena
              ricevuto il token (3 giorni lavorativi).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
