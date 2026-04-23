"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAdminMember } from "@/lib/admin/session";

type ActionResult<T = undefined> = T extends undefined
  ? { ok: true } | { ok: false; error: string }
  : { ok: true; data: T } | { ok: false; error: string };

const CreateReportSchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}(-01)?$/),
  category: z.enum(["luce", "gas"]),
});

function normalizeMonth(month: string): string {
  return /-01$/.test(month) ? month : `${month}-01`;
}

export async function createRemoReport(
  input: unknown,
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  const parsed = CreateReportSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Dati non validi" };

  const month = normalizeMonth(parsed.data.month);
  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("remo_reports")
    .select("id")
    .eq("month", month)
    .eq("category", parsed.data.category)
    .maybeSingle();

  if (existing) {
    return { ok: false, error: "Report già esistente per questo mese e categoria" };
  }

  const { data, error } = await supabase
    .from("remo_reports")
    .insert({ month, category: parsed.data.category })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Errore creazione" };
  }

  revalidatePath("/dashboard/price-engine");
  return { ok: true, data: { id: data.id } };
}

export async function deleteRemoReport(
  id: string,
): Promise<ActionResult> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  const supabase = await createClient();
  const { error } = await supabase.from("remo_reports").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/price-engine");
  return { ok: true };
}

const SectionSchema = z.object({
  order_index: z.number().int(),
  slug: z.string().min(1),
  group_slug: z.string().min(1),
  group_label: z.string().min(1),
  type: z.enum(["intro", "table", "text"]),
  title: z.string().min(1),
  subtitle: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  columns: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
  rows: z.array(z.record(z.string(), z.unknown())).nullable().optional(),
  footnote: z.string().nullable().optional(),
});

export async function replaceRemoSections(
  reportId: string,
  sectionsJson: string,
): Promise<ActionResult<{ count: number }>> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(sectionsJson);
  } catch {
    return { ok: false, error: "JSON non valido" };
  }

  const schema = z.array(SectionSchema);
  const parsed = schema.safeParse(parsedJson);
  if (!parsed.success) {
    return {
      ok: false,
      error: `Schema sezioni non valido: ${parsed.error.issues[0]?.message ?? "errore"}`,
    };
  }

  const supabase = await createClient();

  const { data: report } = await supabase
    .from("remo_reports")
    .select("id")
    .eq("id", reportId)
    .maybeSingle();
  if (!report) return { ok: false, error: "Report non trovato" };

  const { error: deleteErr } = await supabase
    .from("remo_sections")
    .delete()
    .eq("report_id", reportId);
  if (deleteErr) return { ok: false, error: deleteErr.message };

  if (parsed.data.length === 0) {
    revalidatePath("/dashboard/price-engine");
    return { ok: true, data: { count: 0 } };
  }

  const rows = parsed.data.map((s) => ({
    report_id: reportId,
    order_index: s.order_index,
    slug: s.slug,
    group_slug: s.group_slug,
    group_label: s.group_label,
    type: s.type,
    title: s.title,
    subtitle: s.subtitle ?? null,
    description: s.description ?? null,
    // JSONB columns: il DB accetta Json (oggetto/array/primitivo), ma Zod infers
    // Record<string, unknown>[] che TypeScript non considera compatibile.
    // Cast pragmatico: i dati sono validati da Zod e fix-shape upstream.
    columns: (s.columns ?? null) as unknown as never,
    rows: (s.rows ?? null) as unknown as never,
    footnote: s.footnote ?? null,
  }));

  const { error: insertErr } = await supabase.from("remo_sections").insert(rows);
  if (insertErr) return { ok: false, error: insertErr.message };

  revalidatePath("/dashboard/price-engine");
  revalidatePath(`/dashboard/price-engine/${reportId}`);
  return { ok: true, data: { count: rows.length } };
}

export async function createRemoReportAndRedirect(formData: FormData) {
  "use server";
  const res = await createRemoReport({
    month: String(formData.get("month") ?? ""),
    category: String(formData.get("category") ?? ""),
  });
  if (!res.ok) {
    redirect(`/dashboard/price-engine?error=${encodeURIComponent(res.error)}`);
  }
  redirect(`/dashboard/price-engine/${res.data.id}`);
}
