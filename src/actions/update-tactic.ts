"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const Schema = z.object({
  id: z.string().min(1),
  status: z.enum(["da_fare", "in_corso", "fatto", "archiviato"]).optional(),
  notes: z.string().max(20000).nullable().optional(),
});

export async function updateTactic(input: unknown) {
  const parsed = Schema.parse(input);
  const supabase = await createClient();
  const patch: Record<string, string | null> = {};
  if (parsed.status !== undefined) patch.status = parsed.status;
  if (parsed.notes !== undefined) patch.notes = parsed.notes;
  if (Object.keys(patch).length === 0) return { ok: true as const };

  const { error } = await supabase
    .from("strategy_tactics")
    .upsert({ id: parsed.id, ...patch }, { onConflict: "id" });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/strategia");
  return { ok: true as const };
}
