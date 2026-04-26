import { createAdminClient } from "@/lib/supabase/admin";

export type ReactionKind = "utile" | "approfondire";

export type BachecaPost = {
  id: string;
  member_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
  // join member
  author_ragione_sociale: string;
  author_referente: string;
  author_invite_number: number | null;
  // aggregati
  comments_count: number;
  reactions: Record<ReactionKind, { count: number; me: boolean }>;
};

export type BachecaComment = {
  id: string;
  post_id: string;
  member_id: string;
  body: string;
  created_at: string;
  deleted_at: string | null;
  author_ragione_sociale: string;
  author_referente: string;
  author_invite_number: number | null;
};

const PAGE_SIZE = 30;

/**
 * Lista posts non eliminati con autore + count commenti + reactions aggregati.
 */
export async function listPosts(
  viewerMemberId: string,
  limit = PAGE_SIZE,
): Promise<BachecaPost[]> {
  const supabase = createAdminClient();

  const { data: posts, error } = await supabase
    .from("network_posts")
    .select("id, member_id, body, created_at, deleted_at")
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !posts) {
    if (error) console.error("listPosts failed", error);
    return [];
  }
  if (posts.length === 0) return [];

  const memberIds = Array.from(new Set(posts.map((p) => p.member_id)));
  const postIds = posts.map((p) => p.id);

  const [
    { data: members },
    { data: leadsRows },
    { data: commentRows },
    { data: reactionRows },
  ] = await Promise.all([
    supabase
      .from("network_members")
      .select("id, ragione_sociale, referente, piva")
      .in("id", memberIds),
    // tier via leads.invite_number (match piva)
    supabase
      .from("network_members")
      .select("id, piva")
      .in("id", memberIds),
    supabase
      .from("network_post_comments")
      .select("post_id")
      .in("post_id", postIds)
      .is("deleted_at", null),
    supabase
      .from("network_post_reactions")
      .select("post_id, kind, member_id")
      .in("post_id", postIds),
  ]);

  // Member map
  const byMember = new Map<
    string,
    { ragione_sociale: string; referente: string; piva: string }
  >();
  for (const m of (members ?? []) as Array<{
    id: string;
    ragione_sociale: string;
    referente: string;
    piva: string;
  }>) {
    byMember.set(m.id, {
      ragione_sociale: m.ragione_sociale,
      referente: m.referente,
      piva: m.piva,
    });
  }

  // Invite number per member (via leads piva)
  const pivas = Array.from(
    new Set(
      ((leadsRows ?? []) as { piva: string | null }[])
        .map((r) => r.piva)
        .filter(Boolean) as string[],
    ),
  );
  const inviteByPiva = new Map<string, number | null>();
  if (pivas.length > 0) {
    const { data: leads } = await supabase
      .from("leads")
      .select("piva, invite_number")
      .in("piva", pivas);
    for (const l of (leads ?? []) as Array<{
      piva: string;
      invite_number: number | null;
    }>) {
      if (!inviteByPiva.has(l.piva)) inviteByPiva.set(l.piva, l.invite_number);
    }
  }

  // Comments count per post
  const commentCount = new Map<string, number>();
  for (const c of (commentRows ?? []) as { post_id: string }[]) {
    commentCount.set(c.post_id, (commentCount.get(c.post_id) ?? 0) + 1);
  }

  // Reactions aggregati per post
  const reactionsAgg = new Map<
    string,
    Record<ReactionKind, { count: number; me: boolean }>
  >();
  for (const r of (reactionRows ?? []) as Array<{
    post_id: string;
    kind: string;
    member_id: string;
  }>) {
    const kind = r.kind as ReactionKind;
    if (kind !== "utile" && kind !== "approfondire") continue;
    if (!reactionsAgg.has(r.post_id)) {
      reactionsAgg.set(r.post_id, {
        utile: { count: 0, me: false },
        approfondire: { count: 0, me: false },
      });
    }
    const agg = reactionsAgg.get(r.post_id)!;
    agg[kind].count++;
    if (r.member_id === viewerMemberId) agg[kind].me = true;
  }

  return posts.map((p) => {
    const m = byMember.get(p.member_id);
    const piva = m?.piva ?? "";
    return {
      id: p.id,
      member_id: p.member_id,
      body: p.body,
      created_at: p.created_at,
      deleted_at: p.deleted_at,
      author_ragione_sociale: m?.ragione_sociale ?? "Membro",
      author_referente: m?.referente ?? "",
      author_invite_number: inviteByPiva.get(piva) ?? null,
      comments_count: commentCount.get(p.id) ?? 0,
      reactions:
        reactionsAgg.get(p.id) ?? {
          utile: { count: 0, me: false },
          approfondire: { count: 0, me: false },
        },
    };
  });
}

/**
 * Lista commenti di un post (ascending) con autore.
 */
export async function listComments(postId: string): Promise<BachecaComment[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("network_post_comments")
    .select("id, post_id, member_id, body, created_at, deleted_at")
    .eq("post_id", postId)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) return [];

  const memberIds = Array.from(new Set(data.map((c) => c.member_id)));
  const { data: members } = await supabase
    .from("network_members")
    .select("id, ragione_sociale, referente, piva")
    .in("id", memberIds);

  const byMember = new Map<
    string,
    { ragione_sociale: string; referente: string; piva: string }
  >();
  for (const m of (members ?? []) as Array<{
    id: string;
    ragione_sociale: string;
    referente: string;
    piva: string;
  }>) {
    byMember.set(m.id, {
      ragione_sociale: m.ragione_sociale,
      referente: m.referente,
      piva: m.piva,
    });
  }

  const pivas = Array.from(
    new Set(Array.from(byMember.values()).map((v) => v.piva).filter(Boolean)),
  );
  const inviteByPiva = new Map<string, number | null>();
  if (pivas.length > 0) {
    const { data: leads } = await supabase
      .from("leads")
      .select("piva, invite_number")
      .in("piva", pivas);
    for (const l of (leads ?? []) as Array<{
      piva: string;
      invite_number: number | null;
    }>) {
      if (!inviteByPiva.has(l.piva)) inviteByPiva.set(l.piva, l.invite_number);
    }
  }

  return data.map((c) => {
    const m = byMember.get(c.member_id);
    return {
      id: c.id,
      post_id: c.post_id,
      member_id: c.member_id,
      body: c.body,
      created_at: c.created_at,
      deleted_at: c.deleted_at,
      author_ragione_sociale: m?.ragione_sociale ?? "Membro",
      author_referente: m?.referente ?? "",
      author_invite_number: inviteByPiva.get(m?.piva ?? "") ?? null,
    };
  });
}

export function tierLabelFromInvite(n: number | null): string {
  if (n === null) return "Member";
  if (n <= 10) return "Founder";
  if (n <= 30) return "Pioneer";
  if (n <= 60) return "Early";
  return "Member";
}
