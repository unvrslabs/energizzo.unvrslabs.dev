import { Users } from "lucide-react";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Membri · Terminal",
};

export default function MembriV2Page() {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Network
        </p>
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
          Directory membri
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
          L'elenco dei reseller del network arriva col prossimo rilascio
        </p>
      </header>

      <div
        className="v2-card p-10 md:p-14 flex flex-col items-center text-center gap-4"
        style={{ borderStyle: "dashed" }}
      >
        <div
          className="w-16 h-16 rounded-xl grid place-items-center"
          style={{
            background: "hsl(var(--v2-accent) / 0.1)",
            border: "1px solid hsl(var(--v2-accent) / 0.25)",
          }}
        >
          <Users className="w-8 h-8" style={{ color: "hsl(var(--v2-accent))" }} />
        </div>
        <h2 className="text-xl font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
          In lavorazione
        </h2>
        <p className="text-sm max-w-md" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Stiamo raccogliendo le autorizzazioni dai 100 reseller selezionati prima di aprire la directory. Arriverà con funzione di contatto diretto B2B e scambio portafogli.
        </p>
      </div>
    </div>
  );
}
