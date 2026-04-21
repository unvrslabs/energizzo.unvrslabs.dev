"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { HOT_TOPIC_INTENSITIES } from "@/lib/podcast-config";

const intensityEnum = z.enum(HOT_TOPIC_INTENSITIES as unknown as [string, ...string[]]);

const CreateSchema = z.object({
  title: z.string().min(1),
  body: z.string().nullable().optional(),
  intensity: intensityEnum.default("medio"),
  suggested_questions: z.array(z.string()).default([]),
});

export async function createHotTopic(input: unknown) {
  const parsed = CreateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_hot_topics").insert(parsed);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/temi-caldi");
  return { ok: true as const };
}

const UpdateSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    title: z.string().min(1).optional(),
    body: z.string().nullable().optional(),
    intensity: intensityEnum.optional(),
    suggested_questions: z.array(z.string()).optional(),
    active: z.boolean().optional(),
  }),
});

export async function updateHotTopic(input: unknown) {
  const parsed = UpdateSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_hot_topics")
    .update(parsed.patch)
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/temi-caldi");
  return { ok: true as const };
}
