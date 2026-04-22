import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyPage } from "@/components/survey/survey-page";
import { AnimatedBackground } from "@/components/landing/AnimatedBackground";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Invito al network · Il Dispaccio",
  description:
    "Sei stato selezionato per accedere al network Il Dispaccio. Completa il questionario per attivare il tuo accesso gratuito.",
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
    <main className="relative min-h-screen">
      <AnimatedBackground />
      <SurveyPage token={codice} />
    </main>
  );
}
