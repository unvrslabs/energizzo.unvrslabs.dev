import { Activity, Calculator, Gauge, Layers, Sparkles } from "lucide-react";
import { V2TickerRow } from "@/components/network-v2/ticker-row";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Price Engine · Terminal",
};

export default function PriceEngineV2Page() {
  return (
    <div className="flex flex-col gap-5">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Mercato · Price Engine
          </p>
          <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            Motore di pricing cliente finale
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Calcolo trasparente da spot a bolletta · confronto scenari · impatto delibere in tempo reale
          </p>
        </div>
        <span
          className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.16em] px-3 py-1.5 rounded"
          style={{
            color: "hsl(var(--v2-warn))",
            background: "hsl(var(--v2-warn) / 0.1)",
            border: "1px solid hsl(var(--v2-warn) / 0.25)",
          }}
        >
          Beta · disponibile Q2 2026
        </span>
      </header>

      <section>
        <V2TickerRow />
      </section>

      <section className="v2-bento">
        <StepCard
          colSpan={4}
          index="01"
          title="Spot inputs"
          icon={<Activity />}
          body="Pull automatico da GME (PUN Index, MGP), PSV, TTF. Cache 5 min, storico 180 giorni."
        />
        <StepCard
          colSpan={4}
          index="02"
          title="Oneri & accise"
          icon={<Layers />}
          body="Componenti TRAS, DIS, MIS aggiornate con ogni delibera. Rivalutazione automatica quando pubblichiamo l'atto."
        />
        <StepCard
          colSpan={4}
          index="03"
          title="Spread commerciale"
          icon={<Gauge />}
          body="Imposti tu il margine per cluster cliente (domestico, BT altri usi, MT). Output €/kWh finale."
        />
      </section>

      <section className="v2-card p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center">
        <div
          className="shrink-0 w-24 h-24 rounded-xl grid place-items-center"
          style={{
            background: "linear-gradient(135deg, hsl(var(--v2-accent) / 0.2), hsl(var(--v2-accent) / 0.05))",
            border: "1px solid hsl(var(--v2-accent) / 0.3)",
          }}
        >
          <Calculator className="w-10 h-10" style={{ color: "hsl(var(--v2-accent))" }} />
        </div>
        <div className="flex-1">
          <div className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: "hsl(var(--v2-accent))" }}>
            <Sparkles className="inline w-3.5 h-3.5 mr-1" />
            In costruzione
          </div>
          <h3 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
            Stiamo cablando il motore sui dati GME in produzione
          </h3>
          <p className="text-[14px] leading-relaxed mt-2" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Il Price Engine è un modulo in lavorazione — il primo che darà prezzo finale cliente senza fogli Excel e senza sbagliare componenti ARERA. La beta chiusa parte con i 10 reseller più attivi del network ad aprile 2026. Se vuoi essere nel primo gruppo, scrivi a <strong style={{ color: "hsl(var(--v2-text))" }}>network@ildispaccio.energy</strong>.
          </p>
          <div className="flex items-center gap-2 mt-4 flex-wrap">
            <button type="button" className="v2-btn v2-btn--primary">
              Richiedi accesso beta
            </button>
            <button type="button" className="v2-btn">
              Vedi demo video (2 min)
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({
  colSpan,
  index,
  title,
  icon,
  body,
}: {
  colSpan: number;
  index: string;
  title: string;
  icon: React.ReactNode;
  body: string;
}) {
  return (
    <div className={`v2-card p-5 v2-col-${colSpan} flex flex-col gap-3`}>
      <div className="flex items-center justify-between">
        <span className="v2-mono text-[11px] font-bold" style={{ color: "hsl(var(--v2-accent))" }}>
          {index}
        </span>
        <span style={{ color: "hsl(var(--v2-text-dim))" }}>{icon}</span>
      </div>
      <h3 className="text-[15px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
        {title}
      </h3>
      <p className="text-[12.5px] leading-relaxed" style={{ color: "hsl(var(--v2-text-dim))" }}>
        {body}
      </p>
    </div>
  );
}
