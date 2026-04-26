import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Recupera il numero di invito progressivo associato al membro.
 * Il match avviene su P.IVA (i lead invitati condividono la P.IVA col membro
 * creato dopo la compilazione del questionario).
 */
export async function getMemberInviteNumber(piva: string): Promise<number | null> {
  if (!piva) return null;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("leads")
    .select("invite_number")
    .eq("piva", piva)
    .not("invite_number", "is", null)
    .order("invite_number", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) {
    console.error("getMemberInviteNumber failed", error);
    return null;
  }
  return data?.invite_number ?? null;
}
