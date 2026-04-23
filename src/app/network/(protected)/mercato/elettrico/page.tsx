import { Zap, Info } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Mercato elettrico · Terminal",
};

export default function MercatoElettricoPage() {
  return (
    <div className="v2-card p-10 text-center flex flex-col items-center gap-4">
      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-xl"
        style={{
          background: "hsl(var(--v2-accent) / 0.1)",
          border: "1px solid hsl(var(--v2-accent) / 0.28)",
          color: "hsl(var(--v2-accent))",
        }}
      >
        <Zap className="w-7 h-7" />
      </div>
      <div className="max-w-md">
        <h2
          className="text-lg font-semibold"
          style={{ color: "hsl(var(--v2-text))" }}
        >
          Dati mercato elettrico in arrivo
        </h2>
        <p
          className="text-[13.5px] leading-relaxed mt-2"
          style={{ color: "hsl(var(--v2-text-dim))" }}
        >
          Stiamo attivando l&apos;accesso ENTSO-E Transparency Platform per integrare il
          <strong style={{ color: "hsl(var(--v2-text))" }}> PUN stimato, i prezzi delle 6 zone italiane </strong>
          (Nord, Centro-Nord, Centro-Sud, Sud, Sicilia, Sardegna) e la generazione per
          fonte. La pipeline va in produzione appena ENTSO-E approva la richiesta API
          (tipicamente 3 giorni lavorativi).
        </p>
      </div>
      <div
        className="inline-flex items-center gap-2 text-[11.5px]"
        style={{ color: "hsl(var(--v2-text-mute))" }}
      >
        <Info className="w-3.5 h-3.5" />
        Fonte prevista: ENTSO-E Transparency Platform · day-ahead zonal prices
      </div>
    </div>
  );
}
