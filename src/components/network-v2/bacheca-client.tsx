"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import {
  Crown,
  Loader2,
  MessageCircle,
  MoreHorizontal,
  Send,
  Sparkles,
  ThumbsUp,
  Trash2,
  Users,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";
import {
  createComment,
  createPost,
  deleteComment,
  deletePost,
  toggleReaction,
} from "@/actions/bacheca";
import {
  type BachecaComment,
  type BachecaPost,
  type ReactionKind,
  tierLabelFromInvite,
} from "@/lib/network/bacheca";

const MONTHS_IT = [
  "gen","feb","mar","apr","mag","giu","lug","ago","set","ott","nov","dic",
];

function relativeTime(iso: string): string {
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "ora";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m fa`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h fa`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}g fa`;
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]}`;
}

function initials(s: string): string {
  const parts = (s ?? "").split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

const TIER_COLOR: Record<string, string> = {
  Founder: "hsl(var(--v2-accent))",
  Pioneer: "hsl(var(--v2-info))",
  Early: "hsl(var(--v2-warn))",
  Member: "hsl(var(--v2-text-dim))",
};

function TierBadge({ inviteNumber }: { inviteNumber: number | null }) {
  const tier = tierLabelFromInvite(inviteNumber);
  const color = TIER_COLOR[tier] ?? "hsl(var(--v2-text-dim))";
  const Icon = tier === "Founder" ? Crown : tier === "Pioneer" ? Sparkles : tier === "Early" ? Users : UserCheck;
  return (
    <span
      className="v2-mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.16em",
        textTransform: "uppercase",
        color,
        background: "hsl(var(--v2-card-hover))",
        padding: "2px 6px",
        borderRadius: 3,
        border: `1px solid ${color}`,
      }}
      title={`Tier ${tier}${inviteNumber !== null ? ` · #${String(inviteNumber).padStart(3, "0")}` : ""}`}
    >
      <Icon className="w-2.5 h-2.5" />
      {tier}
    </span>
  );
}

function Avatar({
  name,
  inviteNumber,
  size = 40,
}: {
  name: string;
  inviteNumber: number | null;
  size?: number;
}) {
  const tier = tierLabelFromInvite(inviteNumber);
  const color = TIER_COLOR[tier] ?? "hsl(var(--v2-text-dim))";
  const fontSize = Math.max(10, Math.round(size * 0.32));
  return (
    <span
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        display: "grid",
        placeItems: "center",
        background: "hsl(var(--v2-card-hover))",
        border: `1px solid ${color}`,
        color,
        fontFamily: "var(--font-mono), monospace",
        fontSize,
        fontWeight: 800,
        letterSpacing: "0.04em",
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </span>
  );
}

export function BachecaClient({
  viewerMemberId,
  viewerName,
  viewerInviteNumber,
  initialPosts,
}: {
  viewerMemberId: string;
  viewerName: string;
  viewerInviteNumber: number | null;
  initialPosts: BachecaPost[];
}) {
  const [posts, setPosts] = useState<BachecaPost[]>(initialPosts);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleCreate() {
    const text = draft.trim();
    if (text.length === 0) return;
    setBusy(true);
    try {
      const res = await createPost(text);
      if (!res.ok) {
        toast.error(res.error ?? "Errore");
        return;
      }
      // Optimistic: prepend a fake post — server actions revalidatePath
      // forzerà un refresh del server component al prossimo render. Per evitare
      // di aspettare full reload, facciamo router.refresh().
      setDraft("");
      toast.success("Post pubblicato");
      // Forziamo reload dei posts via fetch dell'API list (più semplice)
      const r = await fetch("/api/network/bacheca/posts", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setPosts(data.items ?? []);
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleDeletePost(id: string) {
    if (!confirm("Eliminare questo post?")) return;
    const prev = posts;
    setPosts(posts.filter((p) => p.id !== id));
    const res = await deletePost(id);
    if (!res.ok) {
      setPosts(prev);
      toast.error(res.error ?? "Errore");
    } else {
      toast.success("Post eliminato");
    }
  }

  async function handleReaction(postId: string, kind: ReactionKind) {
    // Optimistic toggle
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const cur = p.reactions[kind];
        return {
          ...p,
          reactions: {
            ...p.reactions,
            [kind]: {
              count: cur.count + (cur.me ? -1 : 1),
              me: !cur.me,
            },
          },
        };
      }),
    );
    const res = await toggleReaction(postId, kind);
    if (!res.ok) {
      // Rollback fetching fresh
      const r = await fetch("/api/network/bacheca/posts", { cache: "no-store" });
      if (r.ok) {
        const data = await r.json();
        setPosts(data.items ?? []);
      }
      toast.error(res.error ?? "Errore");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Composer */}
      <Composer
        viewerName={viewerName}
        viewerInviteNumber={viewerInviteNumber}
        value={draft}
        onChange={setDraft}
        onSubmit={handleCreate}
        busy={busy}
      />

      {/* Feed */}
      {posts.length === 0 ? (
        <div className="v2-card p-10 text-center flex flex-col items-center gap-3">
          <div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl"
            style={{
              background: "hsl(var(--v2-accent) / 0.1)",
              border: "1px solid hsl(var(--v2-accent) / 0.28)",
              color: "hsl(var(--v2-accent))",
            }}
          >
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[15px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
              La bacheca è vuota
            </p>
            <p className="text-[13px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
              Sii il primo a pubblicare un post: una domanda, un'esperienza, un alert su una delibera.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((p) => (
            <PostCard
              key={p.id}
              post={p}
              isOwner={p.member_id === viewerMemberId}
              viewerMemberId={viewerMemberId}
              viewerName={viewerName}
              viewerInviteNumber={viewerInviteNumber}
              onReaction={(k) => handleReaction(p.id, k)}
              onDelete={() => handleDeletePost(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function Composer({
  viewerName,
  viewerInviteNumber,
  value,
  onChange,
  onSubmit,
  busy,
}: {
  viewerName: string;
  viewerInviteNumber: number | null;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  busy: boolean;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-grow textarea
  useEffect(() => {
    const ta = taRef.current;
    if (!ta) return;
    ta.style.height = "auto";
    ta.style.height = Math.min(220, ta.scrollHeight) + "px";
  }, [value]);

  return (
    <div
      className="v2-card"
      style={{ padding: 16, display: "flex", gap: 12 }}
    >
      <Avatar name={viewerName} inviteNumber={viewerInviteNumber} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
        <textarea
          ref={taRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Condividi una domanda, un'esperienza, un alert su una delibera…"
          className="v2-input"
          style={{
            width: "100%",
            minHeight: 56,
            resize: "none",
            padding: 12,
            fontSize: 13.5,
            lineHeight: 1.5,
            fontFamily: "inherit",
          }}
          disabled={busy}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              onSubmit();
            }
          }}
          maxLength={4000}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span
            className="v2-mono"
            style={{
              fontSize: 10.5,
              color: "hsl(var(--v2-text-mute))",
              letterSpacing: "0.06em",
            }}
          >
            {value.length} / 4000 · ⌘+Enter per pubblicare
          </span>
          <button
            type="button"
            className="v2-btn v2-btn--primary"
            onClick={onSubmit}
            disabled={busy || value.trim().length === 0}
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
            Pubblica
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function PostCard({
  post,
  isOwner,
  viewerMemberId,
  viewerName,
  viewerInviteNumber,
  onReaction,
  onDelete,
}: {
  post: BachecaPost;
  isOwner: boolean;
  viewerMemberId: string;
  viewerName: string;
  viewerInviteNumber: number | null;
  onReaction: (k: ReactionKind) => void;
  onDelete: () => void;
}) {
  const [commentsOpen, setCommentsOpen] = useState(false);

  return (
    <article
      className="v2-card"
      style={{ padding: 18, display: "flex", flexDirection: "column", gap: 12 }}
    >
      {/* Header: avatar + nome + tier + date + menu */}
      <header style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Avatar
          name={post.author_ragione_sociale}
          inviteNumber={post.author_invite_number}
        />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 13.5,
                fontWeight: 700,
                color: "hsl(var(--v2-text))",
              }}
            >
              {post.author_ragione_sociale}
            </span>
            <TierBadge inviteNumber={post.author_invite_number} />
          </div>
          <div
            className="v2-mono"
            style={{
              fontSize: 10.5,
              color: "hsl(var(--v2-text-mute))",
              marginTop: 2,
              letterSpacing: "0.04em",
            }}
          >
            {post.author_referente} · {relativeTime(post.created_at)}
          </div>
        </div>
        {isOwner && (
          <button
            type="button"
            onClick={onDelete}
            className="v2-btn v2-btn--ghost"
            style={{ padding: "6px 8px", color: "hsl(var(--v2-danger))" }}
            title="Elimina post"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}
      </header>

      {/* Body */}
      <div
        style={{
          fontSize: 14,
          lineHeight: 1.55,
          color: "hsl(var(--v2-text))",
          whiteSpace: "pre-wrap",
          wordBreak: "break-word",
        }}
      >
        {post.body}
      </div>

      {/* Reactions + comments toggle */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          paddingTop: 8,
          borderTop: "1px solid hsl(var(--v2-border))",
        }}
      >
        <ReactionButton
          icon={<ThumbsUp className="w-3.5 h-3.5" />}
          label="Utile"
          count={post.reactions.utile.count}
          active={post.reactions.utile.me}
          onClick={() => onReaction("utile")}
        />
        <ReactionButton
          icon={<MessageCircle className="w-3.5 h-3.5" />}
          label="Da approfondire"
          count={post.reactions.approfondire.count}
          active={post.reactions.approfondire.me}
          onClick={() => onReaction("approfondire")}
        />
        <div style={{ flex: 1 }} />
        <button
          type="button"
          onClick={() => setCommentsOpen((v) => !v)}
          className="v2-btn v2-btn--ghost"
          style={{ fontSize: 12 }}
        >
          <MessageCircle className="w-3.5 h-3.5" />
          {post.comments_count > 0
            ? `${post.comments_count} commenti`
            : "Commenta"}
        </button>
      </div>

      {commentsOpen && (
        <CommentsThread
          postId={post.id}
          viewerMemberId={viewerMemberId}
          viewerName={viewerName}
          viewerInviteNumber={viewerInviteNumber}
        />
      )}
    </article>
  );
}

function ReactionButton({
  icon,
  label,
  count,
  active,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="v2-btn v2-btn--ghost"
      style={{
        fontSize: 12,
        background: active ? "hsl(var(--v2-accent) / 0.14)" : undefined,
        borderColor: active ? "hsl(var(--v2-accent) / 0.4)" : undefined,
        color: active ? "hsl(var(--v2-accent))" : undefined,
      }}
      title={label}
    >
      {icon}
      <span>{label}</span>
      {count > 0 && (
        <span
          className="v2-mono"
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            marginLeft: 2,
            opacity: 0.85,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────

function CommentsThread({
  postId,
  viewerMemberId,
  viewerName,
  viewerInviteNumber,
}: {
  postId: string;
  viewerMemberId: string;
  viewerName: string;
  viewerInviteNumber: number | null;
}) {
  const [comments, setComments] = useState<BachecaComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetch(`/api/network/bacheca/comments?postId=${encodeURIComponent(postId)}`, {
      cache: "no-store",
    })
      .then((r) => r.json())
      .then((data) => {
        if (!alive) return;
        setComments(data.items ?? []);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [postId]);

  async function submit() {
    const text = draft.trim();
    if (text.length === 0) return;
    startTransition(async () => {
      const res = await createComment(postId, text);
      if (!res.ok) {
        toast.error(res.error ?? "Errore");
        return;
      }
      setDraft("");
      const r = await fetch(
        `/api/network/bacheca/comments?postId=${encodeURIComponent(postId)}`,
        { cache: "no-store" },
      );
      if (r.ok) {
        const data = await r.json();
        setComments(data.items ?? []);
      }
    });
  }

  async function remove(id: string) {
    if (!confirm("Eliminare il commento?")) return;
    const prev = comments;
    setComments(comments.filter((c) => c.id !== id));
    const res = await deleteComment(id);
    if (!res.ok) {
      setComments(prev);
      toast.error(res.error ?? "Errore");
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        paddingTop: 4,
      }}
    >
      {loading ? (
        <div
          className="v2-mono"
          style={{
            fontSize: 11,
            color: "hsl(var(--v2-text-mute))",
            textAlign: "center",
            padding: 8,
          }}
        >
          Caricamento commenti…
        </div>
      ) : (
        comments.map((c) => (
          <div key={c.id} style={{ display: "flex", gap: 10 }}>
            <Avatar
              name={c.author_ragione_sociale}
              inviteNumber={c.author_invite_number}
              size={32}
            />
            <div
              style={{
                flex: 1,
                background: "hsl(var(--v2-card-hover))",
                border: "1px solid hsl(var(--v2-border))",
                borderRadius: 10,
                padding: "8px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  marginBottom: 4,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 700,
                    color: "hsl(var(--v2-text))",
                  }}
                >
                  {c.author_ragione_sociale}
                </span>
                <TierBadge inviteNumber={c.author_invite_number} />
                <span
                  className="v2-mono"
                  style={{
                    fontSize: 10,
                    color: "hsl(var(--v2-text-mute))",
                    marginLeft: 2,
                  }}
                >
                  {relativeTime(c.created_at)}
                </span>
                {c.member_id === viewerMemberId && (
                  <button
                    type="button"
                    onClick={() => remove(c.id)}
                    style={{
                      marginLeft: "auto",
                      color: "hsl(var(--v2-text-mute))",
                      padding: 0,
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                    aria-label="Elimina commento"
                    title="Elimina"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div
                style={{
                  fontSize: 13,
                  lineHeight: 1.5,
                  color: "hsl(var(--v2-text))",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {c.body}
              </div>
            </div>
          </div>
        ))
      )}

      {/* New comment composer */}
      <div style={{ display: "flex", gap: 10 }}>
        <Avatar name={viewerName} inviteNumber={viewerInviteNumber} size={32} />
        <div
          style={{
            flex: 1,
            display: "flex",
            gap: 8,
            alignItems: "flex-end",
          }}
        >
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Scrivi un commento…"
            className="v2-input"
            style={{
              flex: 1,
              fontSize: 13,
              padding: "8px 12px",
              resize: "none",
              minHeight: 36,
              fontFamily: "inherit",
            }}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                e.preventDefault();
                submit();
              }
            }}
            maxLength={2000}
            disabled={pending}
          />
          <button
            type="button"
            className="v2-btn v2-btn--primary"
            onClick={submit}
            disabled={pending || draft.trim().length === 0}
            style={{ padding: "8px 12px" }}
          >
            {pending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </div>
  );
}
