"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/admin/session";
import { GUEST_STATUSES, GUEST_CATEGORIES } from "@/lib/podcast-config";

const guestStatusEnum = z.enum(GUEST_STATUSES as unknown as [string, ...string[]]);
const guestCategoryEnum = z.enum(GUEST_CATEGORIES as unknown as [string, ...string[]]);

const CreateFromLeadSchema = z.object({
  lead_id: z.string().uuid(),
  tier: z.number().int().min(1).max(3).optional(),
  category: guestCategoryEnum.optional(),
  notes: z.string().optional(),
});

export async function createGuestFromLead(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = CreateFromLeadSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_guests")
    .insert({
      lead_id: parsed.lead_id,
      tier: parsed.tier ?? null,
      category: parsed.category ?? null,
      notes: parsed.notes ?? null,
      status: "target",
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  if (!data) return { ok: false as const, error: "Insert fallito: nessuna riga ritornata" };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const, id: data.id };
}

const CreateExternalSchema = z.object({
  external_name: z.string().min(1),
  external_company: z.string().optional(),
  external_role: z.string().optional(),
  external_email: z.union([z.string().email(), z.literal("")]).optional(),
  external_linkedin: z.string().url().optional(),
  tier: z.number().int().min(1).max(3).optional(),
  category: guestCategoryEnum.optional(),
  notes: z.string().optional(),
});

export async function createExternalGuest(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = CreateExternalSchema.parse(input);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("podcast_guests")
    .insert({
      external_name: parsed.external_name,
      external_company: parsed.external_company ?? null,
      external_role: parsed.external_role ?? null,
      external_email: parsed.external_email || null,
      external_linkedin: parsed.external_linkedin ?? null,
      tier: parsed.tier ?? null,
      category: parsed.category ?? null,
      notes: parsed.notes ?? null,
      status: "target",
    })
    .select("id")
    .maybeSingle();
  if (error) return { ok: false as const, error: error.message };
  if (!data) return { ok: false as const, error: "Insert fallito: nessuna riga ritornata" };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const, id: data.id };
}

const UpdateStatusSchema = z.object({
  id: z.string().uuid(),
  status: guestStatusEnum,
});

export async function updateGuestStatus(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = UpdateStatusSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guests")
    .update({ status: parsed.status })
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const };
}

const UpdateGuestSchema = z.object({
  id: z.string().uuid(),
  patch: z.object({
    tier: z.number().int().min(1).max(3).nullable().optional(),
    category: guestCategoryEnum.nullable().optional(),
    invited_at: z.string().datetime().nullable().optional(),
    recorded_at: z.string().datetime().nullable().optional(),
    published_at: z.string().datetime().nullable().optional(),
    episode_url: z.string().url().nullable().optional(),
    episode_title: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
    external_name: z.string().nullable().optional(),
    external_company: z.string().nullable().optional(),
    external_role: z.string().nullable().optional(),
    external_email: z.string().email().nullable().optional(),
    external_linkedin: z.string().url().nullable().optional(),
    selected_episode_slug: z.string().nullable().optional(),
  }),
});

export async function updateGuest(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = UpdateGuestSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase
    .from("podcast_guests")
    .update(parsed.patch)
    .eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath(`/dashboard/podcast/ospiti/${parsed.id}`);
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const };
}

const DeleteSchema = z.object({ id: z.string().uuid() });

export async function deleteGuest(input: unknown) {
  const auth = await requireAdmin();
  if (!auth.ok) return { ok: false as const, error: auth.error };
  const parsed = DeleteSchema.parse(input);
  const supabase = await createClient();
  const { error } = await supabase.from("podcast_guests").delete().eq("id", parsed.id);
  if (error) return { ok: false as const, error: error.message };
  revalidatePath("/dashboard/podcast/ospiti");
  return { ok: true as const };
}
