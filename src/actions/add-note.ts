"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminMember } from "@/lib/admin/session";

const NoteSchema = z.object({
  lead_id: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export async function addNote(input: unknown) {
  const parsed = NoteSchema.parse(input);
  const admin = await getAdminMember();
  if (!admin) return { ok: false as const, error: "Non autenticato" };

  const supabase = createAdminClient();
  const { error } = await supabase.from("notes").insert({
    lead_id: parsed.lead_id,
    body: parsed.body,
    author_id: admin.id,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}
