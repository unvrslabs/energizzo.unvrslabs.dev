import { PreviewPlaceholder } from "@/components/admin-v2/preview-placeholder";

export const metadata = { title: "Network · Admin v2" };
export const dynamic = "force-dynamic";

export default function NetworkV2Placeholder() {
  return (
    <PreviewPlaceholder
      kicker="CRM · Network reseller"
      title="Richieste · Invitati · Membri"
      description="Gestione network con KPI overview, datagrid richieste e pagina dettaglio membro"
      currentHref="/dashboard/network"
      currentLabel="Apri versione attuale"
      features={[
        {
          title: "KPI overview cockpit",
          body: "Tickerone in alto con richieste pending, invitati aperti, membri attivi, tasso risposta. Sparkline sui 14 giorni.",
        },
        {
          title: "Datagrid dense",
          body: "Lista richieste/invitati/membri in tabelle compatte con filtri pill, azioni inline (approva/rifiuta) e scroll virtualizzato.",
        },
        {
          title: "Detail member",
          body: "Pagina dettaglio membro con profilo + timeline risposte questionario + metriche utilizzo area riservata.",
        },
      ]}
    />
  );
}
