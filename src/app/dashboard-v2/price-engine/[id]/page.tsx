import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ExternalLink, Flame, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatMonthLabel } from "@/lib/remo/queries";
import type { RemoSection } from "@/lib/remo/types";
import { deleteRemoReport } from "@/actions/remo";
import { SectionsEditor } from "@/app/dashboard/price-engine/[id]/sections-editor";

export const dynamic = "force-dynamic";
export const metadata = { title: "Editor Price Engine · Admin v2" };

export default async function PriceEngineEditorV2({
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
  const tint = report.category === "luce" ? "hsl(38 92% 62%)" : "hsl(200 70% 62%)";
  const label = report.category === "luce" ? "Energia elettrica" : "Gas naturale";

  async function handleDelete() {
    "use server";
    await deleteRemoReport(id);
    redirect("/dashboard-v2/price-engine");
  }

  return (
    <div className="flex flex-col gap-5">
      <Link href="/dashboard-v2/price-engine" className="v2-btn v2-btn--ghost w-fit">
        <ArrowLeft className="w-3.5 h-3.5" /> Tutti i report
      </Link>

      <header className="v2-card p-5 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl grid place-items-center"
            style={{ background: "hsl(var(--v2-bg-elev))", border: `1px solid ${tint}44` }}
          >
            <Icon className="w-5 h-5" style={{ color: tint }} />
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
              {label}
            </h1>
            <p className="v2-mono text-[11px] mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
              {formatMonthLabel(report.month)} · {(sections ?? []).length} sezioni
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`https://ildispaccio.energy/network/price-engine?cat=${report.category}&month=${report.month}`}
            target="_blank"
            className="v2-btn"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Anteprima pubblica
          </Link>
          <form action={handleDelete}>
            <button
              type="submit"
              className="v2-btn"
              style={{ color: "hsl(var(--v2-danger))", borderColor: "hsl(var(--v2-danger) / 0.3)" }}
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
