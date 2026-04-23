import { DashboardView } from "@/components/dashboard-view";

type SearchParams = { q?: string; status?: string; tipo?: string; categoria?: string; prov?: string; network?: string };

export default async function LeadV2DeepLinkPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<SearchParams>;
}) {
  const { id } = await params;
  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          CRM · Pipeline reseller
        </p>
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
          Lead
        </h1>
      </header>
      <DashboardView searchParams={await searchParams} initialLeadId={id} />
    </div>
  );
}
