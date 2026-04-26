import Link from "next/link";
import { ArrowUpRight, ExternalLink, Flame, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatMonthLabel } from "@/lib/remo/queries";
import {
  PriceEngineOverview,
  type PriceEngineOverviewData,
} from "@/components/admin-v2/price-engine/price-engine-overview";

export const dynamic = "force-dynamic";
export const metadata = { title: "Price Engine · Admin v2" };

type ReportRow = {
  id: string;
  month: string;
  category: "luce" | "gas";
  pdf_url: string | null;
  published_at: string | null;
  sections_count: number;
};

async function loadReports(): Promise<ReportRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("remo_reports")
    .select("id, month, category, pdf_url, published_at, remo_sections(count)")
    .order("month", { ascending: false });
  return (data ?? []).map((r) => ({
    id: r.id,
    month: r.month,
    category: r.category as "luce" | "gas",
    pdf_url: r.pdf_url,
    published_at: r.published_at,
    sections_count: r.remo_sections?.[0]?.count ?? 0,
  }));
}

const MONTHS_IT = ["gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic"];

function fmtPublished(iso: string | null) {
  if (!iso) return "Bozza";
  const d = new Date(iso);
  return `Pubblicato ${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

export default async function PriceEngineV2Page() {
  const reports = await loadReports();
  const luce = reports.filter((r) => r.category === "luce");
  const gas = reports.filter((r) => r.category === "gas");
  const published = reports.filter((r) => r.published_at);
  const draft = reports.length - published.length;

  // Sparkline 12 mesi: published_at per mese
  const monthBuckets: number[] = new Array(12).fill(0);
  const now = new Date();
  for (const r of published) {
    if (!r.published_at) continue;
    const d = new Date(r.published_at);
    const monthsDiff =
      (now.getFullYear() - d.getFullYear()) * 12 +
      (now.getMonth() - d.getMonth());
    const idx = 11 - monthsDiff;
    if (idx >= 0 && idx < 12) monthBuckets[idx]++;
  }

  const overviewData: PriceEngineOverviewData = {
    total: reports.length,
    luce: luce.length,
    gas: gas.length,
    published: published.length,
    draft,
    publishedSpark12m: monthBuckets,
  };

  return (
    <div className="flex flex-col gap-5">
      <header>
        <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Admin · Price Engine
        </p>
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
          Report mensili operatori
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
          {reports.length} report · {luce.length} luce · {gas.length} gas
        </p>
      </header>

      <PriceEngineOverview data={overviewData} />

      <div className="v2-card overflow-hidden">
        <div
          className="grid gap-3 px-4 py-3 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
          style={{
            gridTemplateColumns: "auto minmax(0, 1fr) 110px 90px 220px auto",
            color: "hsl(var(--v2-text-mute))",
            borderBottom: "1px solid hsl(var(--v2-border))",
          }}
        >
          <span>Tipo</span>
          <span>Mese</span>
          <span>Sezioni</span>
          <span>PDF</span>
          <span>Pubblicazione</span>
          <span className="text-right">Azioni</span>
        </div>

        <ul>
          {reports.length === 0 ? (
            <li className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessun report creato.
            </li>
          ) : (
            reports.map((r) => {
              const tint = r.category === "luce" ? "hsl(38 92% 62%)" : "hsl(200 70% 62%)";
              const Icon = r.category === "luce" ? Zap : Flame;
              const label = r.category === "luce" ? "Energia elettrica" : "Gas naturale";
              return (
                <li
                  key={r.id}
                  className="grid gap-3 px-4 py-3 items-center"
                  style={{
                    gridTemplateColumns: "auto minmax(0, 1fr) 110px 90px 220px auto",
                    borderBottom: "1px solid hsl(var(--v2-border))",
                  }}
                >
                  <span
                    className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5"
                    style={{
                      background: "hsl(var(--v2-bg-elev))",
                      border: `1px solid ${tint}44`,
                      color: tint,
                    }}
                  >
                    <Icon className="w-3 h-3" />
                    {label}
                  </span>

                  <span className="text-[13px] font-medium" style={{ color: "hsl(var(--v2-text))" }}>
                    {formatMonthLabel(r.month)}
                  </span>

                  <span className="v2-mono text-[12px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                    {r.sections_count} sez.
                  </span>

                  {r.pdf_url ? (
                    <Link href={r.pdf_url} target="_blank" className="v2-mono text-[11px] inline-flex items-center gap-1" style={{ color: "hsl(var(--v2-accent))" }}>
                      <ExternalLink className="w-3 h-3" />
                      PDF
                    </Link>
                  ) : (
                    <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>—</span>
                  )}

                  <span
                    className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
                    style={{
                      background: r.published_at ? "hsl(var(--v2-accent) / 0.12)" : "hsl(var(--v2-warn) / 0.12)",
                      color: r.published_at ? "hsl(var(--v2-accent))" : "hsl(var(--v2-warn))",
                    }}
                  >
                    {fmtPublished(r.published_at)}
                  </span>

                  <div className="flex justify-end gap-2">
                    <Link
                      href={`/dashboard/price-engine/${r.id}`}
                      className="v2-btn"
                      style={{ padding: "4px 10px", fontSize: "11.5px" }}
                    >
                      Modifica sezioni
                      <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}

