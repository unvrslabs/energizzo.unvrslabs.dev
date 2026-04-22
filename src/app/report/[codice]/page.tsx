import { permanentRedirect } from "next/navigation";

export default async function ReportLegacyRedirect({
  params,
}: {
  params: Promise<{ codice: string }>;
}) {
  const { codice } = await params;
  permanentRedirect(`/invito-network/${codice}`);
}
