"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminMember } from "@/lib/admin/session";
import { normalizePhoneE164 } from "@/lib/network/phone";

const IdSchema = z.object({ id: z.string().uuid() });

type ActionResult = { ok: true } | { ok: false; error: string };

export async function approveNetworkRequest(input: unknown): Promise<ActionResult> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "ID non valido" };

  const supabase = createAdminClient();

  const { data: request, error: reqErr } = await supabase
    .from("network_join_requests")
    .select("id, ragione_sociale, piva, referente, whatsapp, status")
    .eq("id", parsed.data.id)
    .maybeSingle();

  if (reqErr || !request) {
    return { ok: false, error: "Richiesta non trovata" };
  }
  if (request.status === "approved") {
    return { ok: false, error: "Richiesta già approvata" };
  }

  const phone = normalizePhoneE164(request.whatsapp);
  if (!phone) {
    return {
      ok: false,
      error: "Numero WhatsApp non normalizzabile. Modificalo a mano in Supabase prima di approvare.",
    };
  }

  const { data: existing } = await supabase
    .from("network_members")
    .select("id")
    .eq("phone", phone)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("network_join_requests")
      .update({ status: "approved" })
      .eq("id", request.id);
    revalidatePath("/dashboard/network", "layout");
    return { ok: false, error: "Un membro con questo numero esiste già. Richiesta marcata come approvata." };
  }

  const { error: insertErr } = await supabase.from("network_members").insert({
    phone,
    ragione_sociale: request.ragione_sociale,
    piva: request.piva,
    referente: request.referente,
    join_request_id: request.id,
  });

  if (insertErr) {
    return { ok: false, error: insertErr.message };
  }

  await supabase
    .from("network_join_requests")
    .update({ status: "approved" })
    .eq("id", request.id);

  revalidatePath("/dashboard/network", "layout");
  return { ok: true };
}

export async function rejectNetworkRequest(input: unknown): Promise<ActionResult> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "ID non valido" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("network_join_requests")
    .update({ status: "rejected" })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/network", "layout");
  return { ok: true };
}

export async function reopenNetworkRequest(input: unknown): Promise<ActionResult> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "ID non valido" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("network_join_requests")
    .update({ status: "pending" })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/network", "layout");
  return { ok: true };
}

export async function revokeNetworkMember(input: unknown): Promise<ActionResult> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "ID non valido" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("network_members")
    .update({ revoked_at: new Date().toISOString() })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  await supabase
    .from("network_sessions")
    .update({ revoked_at: new Date().toISOString() })
    .eq("member_id", parsed.data.id)
    .is("revoked_at", null);

  revalidatePath("/dashboard/network", "layout");
  return { ok: true };
}

export async function restoreNetworkMember(input: unknown): Promise<ActionResult> {
  const admin = await getAdminMember();
  if (!admin) return { ok: false, error: "Non autenticato" };

  const parsed = IdSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "ID non valido" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("network_members")
    .update({ revoked_at: null })
    .eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/dashboard/network", "layout");
  return { ok: true };
}
