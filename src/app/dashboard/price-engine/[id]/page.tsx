import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Flame, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatMonthLabel } from "@/lib/remo/queries";
import type { RemoSection } from "@/lib/remo/types";
import { deleteRemoReport } from "@/actions/remo";
import { SectionsEditor } from "./sections-editor";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Editor Price Engine — Dashboard",
  robots: { index: false, follow: false },
};

export default async function PriceEngineEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: report } = await supabase
    .from("remo_reports")
    .select("id, month, category, pdf_url, published_at")
    .eq("id", id)
    .maybeSingle();

  if (!report) notFound();

  const { data: sections } = await supabase
    .from("remo_sections")
    .select(
      "id, order_index, slug, group_slug, group_label, type, title, subtitle, description, columns, rows, footnote",
    )
    .eq("report_id", id)
    .order("order_index", { ascending: true });

  const editorInitialJson = JSON.stringify(
    (sections ?? []).map((s) => ({
      order_index: s.order_index,
      slug: s.slug,
      group_slug: s.group_slug,
      group_label: s.group_label,
      type: s.type,
      title: s.title,
      subtitle: s.subtitle,
      description: s.description,
      columns: s.columns,
      rows: s.rows,
      footnote: s.footnote,
    })),
    null,
    2,
  );

  const Icon = report.category === "luce" ? Zap : Flame;
  const color = report.category === "luce" ? "text-amber-300" : "text-sky-300";
  const label =
    report.category === "luce" ? "Energia elettrica" : "Gas naturale";

  async function handleDelete() {
    "use server";
    await deleteRemoReport(id);
    redirect("/dashboard/price-engine");
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <Link
        href="/dashboard/price-engine"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Tutti i report
      </Link>

      <header className="dispaccio-card rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-white/5 border border-white/10">
            <Icon className={cn("h-5 w-5", color)} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">{label}</h1>
            <p className="text-xs text-muted-foreground">
              {formatMonthLabel(report.month)} ·{" "}
              {(sections ?? []).length} sezioni
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`https://ildispaccio.energy/network/price-engine?cat=${report.category}&month=${report.month}`}
            target="_blank"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-semibold text-foreground/85 hover:text-foreground hover:border-primary/30 transition-colors"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Anteprima
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-1.5 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-colors"
            >
              Elimina report
            </button>
          </form>
        </div>
      </header>

      <SectionsEditor
        reportId={id}
        initialJson={editorInitialJson}
        sectionsPreview={(sections ?? []) as RemoSection[]}
      />
    </div>
  );
}
