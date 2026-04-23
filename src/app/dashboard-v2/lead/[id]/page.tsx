import { LeadV2Content } from "../page";

type SearchParams = {
  q?: string;
  status?: string;
  tipo?: string;
  categoria?: string;
  prov?: string;
  network?: string;
};

export const dynamic = "force-dynamic";
export const metadata = { title: "Lead · Admin v2" };

export default async function LeadV2DeepLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  return <LeadV2Content sp={sp} initialLeadId={id} />;
}
