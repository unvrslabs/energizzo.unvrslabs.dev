import Link from "next/link";
import { ArrowRight, Flame, Plus, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatMonthLabel } from "@/lib/remo/queries";
import { createRemoReportAndRedirect } from "@/actions/remo";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Price Engine — Dashboard",
  robots: { index: false, follow: false },
};

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
  const { data, error } = await supabase
    .from("remo_reports")
    .select(
      "id, month, category, pdf_url, published_at, remo_sections(count)",
    )
    .order("month", { ascending: false });
  if (error) return [];
  return (data ?? []).map((r: {
    id: string;
    month: string;
    category: "luce" | "gas";
    pdf_url: string | null;
    published_at: string | null;
    remo_sections?: { count: number }[];
  }) => ({
    id: r.id,
    month: r.month,
    category: r.category,
    pdf_url: r.pdf_url,
    published_at: r.published_at,
    sections_count: r.remo_sections?.[0]?.count ?? 0,
  }));
}

export default async function PriceEngineAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const reports = await loadReports();

  const now = new Date();
  const defaultMonth = `${now.getUTCFullYear()}-${String(
    now.getUTCMonth() + 1,
  ).padStart(2, "0")}`;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Price Engine</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Report RE.M.O. mensili pubblicati ai membri del network.
          </p>
        </div>
      </header>

      {params.error && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {params.error}
        </div>
      )}

      <section className="dispaccio-card rounded-2xl p-5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">
          Nuovo report
        </h2>
        <form
          action={createRemoReportAndRedirect}
          className="flex items-end gap-3 flex-wrap"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Mese
            </label>
            <input
              type="month"
              name="month"
              defaultValue={defaultMonth}
              required
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-primary"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-muted-foreground">
              Categoria
            </label>
            <select
              name="category"
              required
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-sm outline-none focus:border-primary"
            >
              <option value="luce">Energia elettrica</option>
              <option value="gas">Gas naturale</option>
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-br from-primary to-emerald-600 px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md shadow-primary/30 hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Crea e modifica
          </button>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          Report esistenti ({reports.length})
        </h2>

        {reports.length === 0 ? (
          <div className="dispaccio-card rounded-2xl p-8 text-center text-sm text-muted-foreground">
            Nessun report ancora pubblicato.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {reports.map((r) => (
              <ReportTile key={r.id} report={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ReportTile({ report }: { report: ReportRow }) {
  const Icon = report.category === "luce" ? Zap : Flame;
  const color =
    report.category === "luce" ? "text-amber-300" : "text-sky-300";
  const label =
    report.category === "luce" ? "Energia elettrica" : "Gas naturale";

  return (
    <Link
      href={`/dashboard/price-engine/${report.id}`}
      className="dispaccio-card rounded-2xl p-4 flex items-center gap-3 hover:border-primary/40 transition-colors group"
    >
      <div
        className={cn(
          "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 border border-white/10",
        )}
      >
        <Icon className={cn("h-5 w-5", color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold truncate">{label}</p>
        <p className="text-xs text-muted-foreground">
          {formatMonthLabel(report.month)} · {report.sections_count} sezion
          {report.sections_count === 1 ? "e" : "i"}
        </p>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
    </Link>
  );
}
