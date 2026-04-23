import { PreviewPlaceholder } from "@/components/admin-v2/preview-placeholder";

export const metadata = { title: "Podcast · Admin v2" };
export const dynamic = "force-dynamic";

export default function PodcastV2Placeholder() {
  return (
    <PreviewPlaceholder
      kicker="Content · Podcast admin"
      title="Episodi · Ospiti · Knowledge"
      description="Editor episodi, gestione ospiti, glossario, domande pronte, temi caldi e knowledge base"
      currentHref="/dashboard/podcast"
      currentLabel="Apri versione attuale"
      accent="warn"
      features={[
        {
          title: "Editor episodio full",
          body: "Pagina episodio con metadata, timeline argomenti, domande preparate, trascrizione highlightable e link YouTube.",
        },
        {
          title: "Rubrica ospiti",
          body: "Directory ospiti con bio, speciality, link social, storico interviste. Quick-add da WhatsApp number.",
        },
        {
          title: "Knowledge base searchable",
          body: "Sigle, definizioni, glossario regulatory con ricerca full-text e cross-linking agli episodi che ne parlano.",
        },
      ]}
    />
  );
}
