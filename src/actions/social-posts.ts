"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getAdminMember } from "@/lib/admin/session";
import {
  generateAndInsert,
  type GenerateInput,
  type SocialPostTipo,
} from "@/lib/social/generator";

// ───────── TYPES ─────────

export type { SocialPostTipo } from "@/lib/social/generator";

export type SocialPostStatus =
  | "bozza"
  | "approvato"
  | "schedulato"
  | "pubblicato"
  | "skip";

export type SocialPost = {
  id: string;
  tipo: SocialPostTipo;
  fonte_kind: string | null;
  fonte_id: string | null;
  fonte_meta: Record<string, unknown>;
  hook: string | null;
  copy_linkedin: string;
  copy_x: string;
  hashtags: string[];
  image_strategy: Record<string, unknown>;
  image_template: string | null;
  image_data: Record<string, unknown>;
  image_ai_prompt: string | null;
  image_url: string | null;
  scheduled_at: string | null;
  scheduled_lane: "linkedin" | "x" | "both";
  status: SocialPostStatus;
  published_linkedin_at: string | null;
  published_x_at: string | null;
  ai_model: string | null;
  ai_prompt_version: string | null;
  notes: string | null;
  generated_by: "manual" | "auto";
  created_at: string;
  updated_at: string;
};

// ───────── ACTIONS ─────────

export async function generateSocialPost(input: GenerateInput) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  const inserted = await generateAndInsert(supabase, input, {
    generatedBy: "manual",
  });

  revalidatePath("/dashboard/social");
  return inserted as SocialPost;
}

export async function listSocialPosts(opts?: {
  status?: SocialPostStatus | SocialPostStatus[];
  from?: string;
  to?: string;
  tipo?: SocialPostTipo;
  limit?: number;
}) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  let query = supabase.from("social_posts").select("*");

  if (opts?.status) {
    const statuses = Array.isArray(opts.status) ? opts.status : [opts.status];
    query = query.in("status", statuses);
  }
  if (opts?.tipo) query = query.eq("tipo", opts.tipo);
  if (opts?.from) query = query.gte("scheduled_at", opts.from);
  if (opts?.to) query = query.lt("scheduled_at", opts.to);

  query = query.order("scheduled_at", { ascending: true, nullsFirst: false });
  query = query.order("created_at", { ascending: false });
  if (opts?.limit) query = query.limit(opts.limit);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SocialPost[];
}

export async function updateSocialPost(
  id: string,
  patch: Partial<
    Pick<
      SocialPost,
      | "copy_linkedin"
      | "copy_x"
      | "hashtags"
      | "scheduled_at"
      | "scheduled_lane"
      | "status"
      | "notes"
      | "image_template"
      | "image_data"
    >
  >,
) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("social_posts")
    .update(patch as never)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;

  revalidatePath("/dashboard/social");
  return data as SocialPost;
}

export async function markPublished(id: string, lane: "linkedin" | "x" | "both") {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  const now = new Date().toISOString();
  const { data: existing } = await supabase
    .from("social_posts")
    .select("published_linkedin_at,published_x_at")
    .eq("id", id)
    .single();

  const patch: Record<string, string | SocialPostStatus> = { status: "pubblicato" };
  if (lane === "linkedin" || lane === "both") patch.published_linkedin_at = now;
  if (lane === "x" || lane === "both") patch.published_x_at = now;
  if (lane === "linkedin" && existing?.published_x_at == null) {
    delete patch.status;
  }
  if (lane === "x" && existing?.published_linkedin_at == null) {
    delete patch.status;
  }

  const { error } = await supabase.from("social_posts").update(patch as never).eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/social");
}

export async function deleteSocialPost(id: string) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");

  const supabase = await createClient();
  const { error } = await supabase.from("social_posts").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/dashboard/social");
}

export async function listTodayPosts() {
  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
  const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1).toISOString();
  return listSocialPosts({
    from: start,
    to: end,
    status: ["approvato", "schedulato"],
  });
}

export async function listRecentDelibereForPicker(limit = 30) {
  const admin = await getAdminMember();
  if (!admin) throw new Error("Unauthorized");
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("delibere_cache")
    .select("id,numero,titolo,settore,data_pubblicazione,ai_importanza,ai_summary")
    .not("ai_summary", "is", null)
    .order("data_pubblicazione", { ascending: false, nullsFirst: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
