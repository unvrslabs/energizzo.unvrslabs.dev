import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyPage } from "@/components/survey/survey-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invito al network · Il Dispaccio",
  description:
    "Documento riservato. Invito nominale al network Il Dispaccio per il reseller selezionato.",
  robots: { index: false, follow: false },
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function InvitoNetworkPage({
  params,
}: {
  params: Promise<{ codice: string }>;
}) {
  const { codice } = await params;
  if (!UUID_REGEX.test(codice)) {
    notFound();
  }

  return (
    <>
      {/* Evita flash verde del body mesh-gradient durante il primo paint */}
      <style>{`
        body {
          background: hsl(210 18% 6%) !important;
          background-image: none !important;
        }
      `}</style>
      <main className="relative min-h-screen">
        <SurveyPage token={codice} />
      </main>
    </>
  );
}
