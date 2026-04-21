"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { STATUSES_IN_ORDER } from "@/lib/status-config";

const statusEnum = z.enum(STATUSES_IN_ORDER as [string, ...string[]]);

const StatusSchema = z.object({
  id: z.string().uuid(),
  status: statusEnum,
});

export async function updateLeadStatus(input: unknown) {
  const parsed = StatusSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("leads")
    .update({ status: parsed.status })
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

const EmailSchema = z.object({
  id: z.string().uuid(),
  email: z.union([z.string().email(), z.literal("")]).nullable(),
});

export async function updateLeadEmail(input: unknown) {
  const parsed = EmailSchema.parse(input);
  const supabase = await createClient();
  const value = parsed.email === "" ? null : parsed.email;
  const { error } = await supabase
    .from("leads")
    .update({ email: value })
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}

const ContactsSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    telefono: z.string().nullable().optional(),
    whatsapp: z.string().nullable().optional(),
  }),
});

export async function updateLeadContacts(input: unknown) {
  const parsed = ContactsSchema.parse(input);
  const supabase = await createClient();
  const patch: Record<string, string | null> = {};
  if ("telefono" in parsed.patch) {
    const v = parsed.patch.telefono;
    patch.telefono = v && v.trim() ? v.trim() : null;
  }
  if ("whatsapp" in parsed.patch) {
    const v = parsed.patch.whatsapp;
    patch.whatsapp = v && v.trim() ? v.trim() : null;
  }
  const { error } = await supabase.from("leads").update(patch).eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard");
  return { ok: true as const };
}
