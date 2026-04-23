"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/session";

const Schema = z.object({
  id: z.string().min(1),
  status: z.enum(["da_fare", "in_corso", "fatto", "archiviato"]).optional(),
  notes: z.string().max(20000).nullable().optional(),
});

export async function updateTactic(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = Schema.parse(input);
  const supabase = await createClient();
  const patch: {
    status?: "da_fare" | "in_corso" | "fatto" | "archiviato";
    notes?: string | null;
  } = {};
  if (parsed.status !== undefined) patch.status = parsed.status;
  if (parsed.notes !== undefined) patch.notes = parsed.notes;
  if (Object.keys(patch).length === 0) return { ok: true as const };

  // UPDATE esplicito (non upsert) per evitare la creazione di record ghost con
  // colonne NOT NULL mancanti se il client passa un id sconosciuto.
  const { data, error } = await supabase
    .from("strategy_tactics")
    .update(patch)
    .eq("id", parsed.id)
    .select("id");
  if (error) return { ok: false as const, error: error.message };
  if (!data || data.length === 0) {
    return { ok: false as const, error: "Tattica non trovata" };
  }
  revalidatePath("/dashboard/strategia");
  return { ok: true as const };
}
