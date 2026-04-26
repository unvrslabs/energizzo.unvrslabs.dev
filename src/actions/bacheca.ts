"use server";

import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";
import { getNetworkMember } from "@/lib/network/session";
import type { ReactionKind } from "@/lib/network/bacheca";

const POST_LIMIT = 4000;
const COMMENT_LIMIT = 2000;

export async function createPost(body: string): Promise<{ ok: boolean; error?: string }> {
  const member = await getNetworkMember();
  if (!member) return { ok: false, error: "Non autorizzato." };

  const text = body.trim();
  if (text.length === 0) return { ok: false, error: "Post vuoto." };
  if (text.length > POST_LIMIT)
    return { ok: false, error: `Massimo ${POST_LIMIT} caratteri.` };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("network_posts")
    .insert({ member_id: member.id, body: text });
  if (error) {
    console.error("createPost failed", error);
    return { ok: false, error: "Errore salvataggio." };
  }
  revalidatePath("/network/bacheca");
  return { ok: true };
}

export async function deletePost(postId: string): Promise<{ ok: boolean; error?: string }> {
  const member = await getNetworkMember();
  if (!member) return { ok: false, error: "Non autorizzato." };

  const supabase = createAdminClient();
  const { data: post } = await supabase
    .from("network_posts")
    .select("member_id")
    .eq("id", postId)
    .maybeSingle();
  if (!post) return { ok: false, error: "Post non trovato." };
  if (post.member_id !== member.id) {
    return { ok: false, error: "Solo l'autore può eliminare il post." };
  }

  const { error } = await supabase
    .from("network_posts")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", postId);
  if (error) {
    console.error("deletePost failed", error);
    return { ok: false, error: "Errore eliminazione." };
  }
  revalidatePath("/network/bacheca");
  return { ok: true };
}

export async function createComment(
  postId: string,
  body: string,
): Promise<{ ok: boolean; error?: string }> {
  const member = await getNetworkMember();
  if (!member) return { ok: false, error: "Non autorizzato." };

  const text = body.trim();
  if (text.length === 0) return { ok: false, error: "Commento vuoto." };
  if (text.length > COMMENT_LIMIT)
    return { ok: false, error: `Massimo ${COMMENT_LIMIT} caratteri.` };

  const supabase = createAdminClient();

  // Verifica post esiste e non eliminato
  const { data: post } = await supabase
    .from("network_posts")
    .select("id, member_id, deleted_at")
    .eq("id", postId)
    .maybeSingle();
  if (!post || post.deleted_at)
    return { ok: false, error: "Post non disponibile." };

  const { error } = await supabase
    .from("network_post_comments")
    .insert({ post_id: postId, member_id: member.id, body: text });
  if (error) {
    console.error("createComment failed", error);
    return { ok: false, error: "Errore salvataggio." };
  }
  revalidatePath("/network/bacheca");
  return { ok: true };
}

export async function deleteComment(
  commentId: string,
): Promise<{ ok: boolean; error?: string }> {
  const member = await getNetworkMember();
  if (!member) return { ok: false, error: "Non autorizzato." };

  const supabase = createAdminClient();
  const { data: c } = await supabase
    .from("network_post_comments")
    .select("member_id")
    .eq("id", commentId)
    .maybeSingle();
  if (!c) return { ok: false, error: "Commento non trovato." };
  if (c.member_id !== member.id) {
    return { ok: false, error: "Solo l'autore può eliminare." };
  }

  const { error } = await supabase
    .from("network_post_comments")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", commentId);
  if (error) {
    console.error("deleteComment failed", error);
    return { ok: false, error: "Errore eliminazione." };
  }
  revalidatePath("/network/bacheca");
  return { ok: true };
}

export async function toggleReaction(
  postId: string,
  kind: ReactionKind,
): Promise<{ ok: boolean; error?: string; on?: boolean }> {
  const member = await getNetworkMember();
  if (!member) return { ok: false, error: "Non autorizzato." };

  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("network_post_reactions")
    .select("id")
    .eq("post_id", postId)
    .eq("member_id", member.id)
    .eq("kind", kind)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from("network_post_reactions")
      .delete()
      .eq("id", existing.id);
    if (error) {
      console.error("toggleReaction delete failed", error);
      return { ok: false, error: "Errore." };
    }
    revalidatePath("/network/bacheca");
    return { ok: true, on: false };
  }

  const { error } = await supabase
    .from("network_post_reactions")
    .insert({ post_id: postId, member_id: member.id, kind });
  if (error) {
    console.error("toggleReaction insert failed", error);
    return { ok: false, error: "Errore." };
  }
  revalidatePath("/network/bacheca");
  return { ok: true, on: true };
}
