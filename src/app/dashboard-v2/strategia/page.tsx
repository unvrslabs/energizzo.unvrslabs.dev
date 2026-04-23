import { PreviewPlaceholder } from "@/components/admin-v2/preview-placeholder";

export const metadata = { title: "Strategia · Admin v2" };
export const dynamic = "force-dynamic";

export default function StrategiaV2Placeholder() {
  return (
    <PreviewPlaceholder
      kicker="Strategy · Obiettivi & tattiche"
      title="Planning e OKR"
      description="Piano strategico Il Dispaccio: obiettivi trimestrali, tattiche, revisione settimanale"
      currentHref="/dashboard/strategia"
      currentLabel="Apri versione attuale"
      accent="info"
      features={[
        {
          title: "Board OKR",
          body: "Obiettivi per trimestre con KR quantitativi e progress bar cockpit. Aggiornamento settimanale con checklist.",
        },
        {
          title: "Timeline tattiche",
          body: "Gantt minimalista con tattiche attive, owner, deadline. Color-coded per area (growth/product/brand).",
        },
        {
          title: "Review automatica",
          body: "Snapshot settimanale con delta KPI rispetto al target e suggerimenti prioritari per la settimana successiva.",
        },
      ]}
    />
  );
}
