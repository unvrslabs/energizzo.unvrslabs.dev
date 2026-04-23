"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/session";

const MarkSent = z.object({ lead_id: z.string().uuid() });

export async function markSurveySent(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = MarkSent.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "Invalid input" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("mark_survey_sent", {
    p_lead_id: parsed.data.lead_id,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}
