"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/session";

const UpsertSchema = z.object({
  guest_id: z.string().uuid(),
  duration_min: z.number().int().nullable().optional(),
  key_insights: z.string().nullable().optional(),
  new_terms: z.array(z.string()).optional(),
  new_hot_topics: z.array(z.string()).optional(),
  referrals: z.string().nullable().optional(),
  quote_highlight: z.string().nullable().optional(),
  energizzo_opportunity: z.string().nullable().optional(),
});

export async function upsertSessionNotes(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = UpsertSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_session_notes").upsert(
    {
      guest_id: parsed.guest_id,
      duration_min: parsed.duration_min ?? null,
      key_insights: parsed.key_insights ?? null,
      new_terms: parsed.new_terms ?? [],
      new_hot_topics: parsed.new_hot_topics ?? [],
      referrals: parsed.referrals ?? null,
      quote_highlight: parsed.quote_highlight ?? null,
      energizzo_opportunity: parsed.energizzo_opportunity ?? null,
    },
    { onConflict: "guest_id" },
  );
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.guest_id}`);
  return { ok: true as const };
}
