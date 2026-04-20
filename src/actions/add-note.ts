"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const NoteSchema = z.object({
  lead_id: z.string().uuid(),
  body: z.string().min(1).max(5000),
});

export async function addNote(input: unknown) {
  const parsed = NoteSchema.parse(input);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false as const, error: "Non autenticato" };

  const { error } = await supabase.from("notes").insert({
    lead_id: parsed.lead_id,
    body: parsed.body,
    author_id: user.id,
  });
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}
