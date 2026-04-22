import { createClient } from "@/lib/supabase/server";
import type {
  RemoCategory,
  RemoReport,
  RemoReportMeta,
  RemoSection,
} from "./types";

export async function listReportsMeta(): Promise<RemoReportMeta[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("remo_reports")
    .select("month, category")
    .order("month", { ascending: false });
  if (error) throw error;
  return (data ?? []) as RemoReportMeta[];
}

export async function getReport(
  month: string,
  category: RemoCategory,
): Promise<RemoReport | null> {
  const supabase = await createClient();
  const { data: report, error: reportErr } = await supabase
    .from("remo_reports")
    .select("id, month, category, pdf_url, published_at")
    .eq("month", month)
    .eq("category", category)
    .maybeSingle();
  if (reportErr) throw reportErr;
  if (!report) return null;

  const { data: sections, error: sectionsErr } = await supabase
    .from("remo_sections")
    .select(
      "id, order_index, slug, group_slug, group_label, type, title, subtitle, description, columns, rows, footnote",
    )
    .eq("report_id", report.id)
    .order("order_index", { ascending: true });
  if (sectionsErr) throw sectionsErr;

  return {
    ...report,
    sections: (sections ?? []) as RemoSection[],
  } as RemoReport;
}

export function formatMonthLabel(month: string): string {
  const d = new Date(month + "T00:00:00Z");
  const names = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];
  return `${names[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function formatCategoryLabel(c: RemoCategory): string {
  return c === "luce" ? "Energia elettrica" : "Gas naturale";
}
