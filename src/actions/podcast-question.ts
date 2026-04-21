"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { QUESTION_THEMES, QUESTION_PHASES } from "@/lib/podcast-config";

const themeEnum = z.enum(QUESTION_THEMES as unknown as [string, ...string[]]);
const phaseEnum = z.enum(QUESTION_PHASES as unknown as [string, ...string[]]);

const CreateSchema = z.object({
  theme: themeEnum,
  phase: phaseEnum,
  body: z.string().min(1),
});

export async function createQuestion(input: unknown) {
  const parsed = CreateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_questions").insert(parsed);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/domande");
  return { ok: true as const };
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    body: z.string().min(1).optional(),
    theme: themeEnum.optional(),
    phase: phaseEnum.optional(),
    archived: z.boolean().optional(),
  }),
});

export async function updateQuestion(input: unknown) {
  const parsed = UpdateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_questions")
    .update(parsed.patch)
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/domande");
  return { ok: true as const };
}

const AttachSchema = z.object({
  guest_id: z.string().uuid(),
  question_ids: z.array(z.string().uuid()).min(1),
});

export async function attachQuestionsToGuest(input: unknown) {
  const parsed = AttachSchema.parse(input);
  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("podcast_guest_questions")
    .select("order_idx")
    .eq("guest_id", parsed.guest_id)
    .order("order_idx", { ascending: false })
    .limit(1);
  let start = existing?.[0]?.order_idx ?? -1;
  const rows = parsed.question_ids.map((qid) => ({
    guest_id: parsed.guest_id,
    question_id: qid,
    order_idx: ++start,
  }));
  const { error } = await supabase.from("podcast_guest_questions").upsert(rows, {
    onConflict: "guest_id,question_id",
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}

const DetachSchema = z.object({
  guest_id: z.string().uuid(),
  question_id: z.string().uuid(),
});

export async function detachQuestion(input: unknown) {
  const parsed = DetachSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guest_questions")
    .delete()
    .eq("guest_id", parsed.guest_id)
    .eq("question_id", parsed.question_id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}

const ToggleAskedSchema = z.object({
  guest_id: z.string().uuid(),
  question_id: z.string().uuid(),
  asked: z.boolean(),
});

export async function toggleAsked(input: unknown) {
  const parsed = ToggleAskedSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guest_questions")
    .update({ asked: parsed.asked })
    .eq("guest_id", parsed.guest_id)
    .eq("question_id", parsed.question_id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}
