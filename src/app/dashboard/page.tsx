import { DashboardView } from "@/components/dashboard-view";

type SearchParams = { q?: string; status?: string; tipo?: string; prov?: string };

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  return <DashboardView searchParams={await searchParams} initialLeadId={null} />;
}
