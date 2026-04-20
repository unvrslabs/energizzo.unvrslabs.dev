import { DashboardView } from "@/components/dashboard-view";

type SearchParams = { q?: string; status?: string; tipo?: string; prov?: string };

export default async function LeadDeepLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  return <DashboardView searchParams={await searchParams} initialLeadId={id} />;
}
