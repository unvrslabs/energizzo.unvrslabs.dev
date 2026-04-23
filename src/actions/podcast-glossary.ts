"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/session";
import { GLOSSARY_CATEGORIES } from "@/lib/podcast-config";

const catEnum = z.enum(GLOSSARY_CATEGORIES as unknown as [string, ...string[]]);

const UpsertSchema = z.object({
  term: z.string().min(1),
  category: catEnum,
  definition: z.string().min(1),
});

export async function upsertTerm(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = UpsertSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_glossary")
    .upsert(parsed, { onConflict: "term" });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/glossario");
  return { ok: true as const };
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    term: z.string().min(1).optional(),
    category: catEnum.optional(),
    definition: z.string().min(1).optional(),
  }),
});

export async function updateTerm(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = UpdateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_glossary")
    .update(parsed.patch)
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/glossario");
  return { ok: true as const };
}

const DeleteSchema = z.object({ id: z.string().uuid() });

export async function deleteTerm(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = DeleteSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_glossary").delete().eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/glossario");
  return { ok: true as const };
}
