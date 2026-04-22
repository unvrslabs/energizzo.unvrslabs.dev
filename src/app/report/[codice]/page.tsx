import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SurveyPage } from "@/components/survey/survey-page";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Report Reseller Italia · Il Dispaccio",
  description:
    "Compila la survey del primo report indipendente sui benchmark operativi del reseller energia italiano. 24 domande, 3-5 minuti, benchmark privato entro 60 giorni.",
  robots: { index: false, follow: false },
};

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function ReportSurveyPage({
  params,
}: {
  params: Promise<{ codice: string }>;
}) {
  const { codice } = await params;
  if (!UUID_REGEX.test(codice)) {
    notFound();
  }

  return <SurveyPage token={codice} />;
}
