import { PreviewPlaceholder } from "@/components/admin-v2/preview-placeholder";

export const metadata = { title: "Price Engine · Admin v2" };
export const dynamic = "force-dynamic";

export default function PriceEngineV2Placeholder() {
  return (
    <PreviewPlaceholder
      kicker="Admin · Price Engine"
      title="Motore prezzi cliente finale"
      description="Versione admin del motore: configurazione componenti, override per cluster, scenari batch"
      currentHref="/dashboard/price-engine"
      currentLabel="Apri versione attuale"
      features={[
        {
          title: "Componenti tariffarie",
          body: "Gestione TRAS / DIS / MIS / accise / oneri con storico per delibera di riferimento e activation date.",
        },
        {
          title: "Scenari batch",
          body: "Calcolo massivo su migliaia di cluster cliente. Confronto pre/post delibera con export CSV per reseller.",
        },
        {
          title: "Spread per partner",
          body: "Configurazione margine per ogni reseller del network con override per macroarea e categoria cliente.",
        },
      ]}
    />
  );
}
