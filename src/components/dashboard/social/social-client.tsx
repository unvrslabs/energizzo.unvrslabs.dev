"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Download,
  Image as ImageIcon,
  Linkedin,
  Loader2,
  Plus,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { LinkedInPreview, XPreview } from "./previews";
import {
  deleteSocialPost,
  generateSocialPost,
  markPublished,
  updateSocialPost,
  type SocialPost,
  type SocialPostTipo,
} from "@/actions/social-posts";

type Delibera = {
  id: number;
  numero: string | null;
  titolo: string | null;
  settore: string | null;
  data_pubblicazione: string | null;
  ai_importanza: string | null;
  ai_summary: string | null;
};

const TIPO_OPTIONS: { value: SocialPostTipo; label: string; emoji: string }[] = [
  { value: "delibera", label: "Delibera", emoji: "📜" },
  { value: "market", label: "Market snapshot", emoji: "📊" },
  { value: "scadenza", label: "Scadenza alert", emoji: "⏳" },
  { value: "digest", label: "Digest settimanale", emoji: "🗞️" },
  { value: "educational", label: "Educational", emoji: "🎓" },
  { value: "podcast", label: "Teaser podcast", emoji: "🎙️" },
  { value: "libero", label: "Libero", emoji: "✍️" },
];

function tipoMeta(tipo: SocialPostTipo) {
  return TIPO_OPTIONS.find((o) => o.value === tipo) ?? TIPO_OPTIONS[6];
}

function formatDateShort(iso: string | null) {
  if (!iso) return "non schedulato";
  const d = new Date(iso);
  return d.toLocaleString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function dayKey(iso: string) {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    .toISOString()
    .slice(0, 10);
}

function statusLabel(status: SocialPost["status"]): string {
  const map: Record<SocialPost["status"], string> = {
    bozza: "da pubblicare",
    approvato: "da pubblicare",
    schedulato: "da pubblicare",
    pubblicato: "pubblicato",
    skip: "skip",
  };
  return map[status];
}

function statusChipStyle(status: SocialPost["status"]): React.CSSProperties {
  const isPub = status === "pubblicato";
  const isSkip = status === "skip";
  const bg = isPub
    ? "hsl(158 50% 15%)"
    : isSkip
      ? "hsl(0 20% 18%)"
      : "hsl(var(--v2-accent) / 0.14)";
  const fg = isPub
    ? "hsl(var(--v2-accent))"
    : isSkip
      ? "hsl(var(--v2-text-mute))"
      : "hsl(var(--v2-accent))";
  return {
    background: bg,
    color: fg,
    fontSize: 10,
    padding: "2px 8px",
    borderRadius: 6,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    fontWeight: 700,
  };
}

export function SocialClient({
  initialPosts,
  initialDelibere,
}: {
  initialPosts: SocialPost[];
  initialDelibere: Delibera[];
}) {
  const [posts, setPosts] = useState<SocialPost[]>(initialPosts);
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [editing, setEditing] = useState<SocialPost | null>(null);

  const upsertPost = (p: SocialPost) => {
    setPosts((prev) => {
      const next = prev.filter((x) => x.id !== p.id);
      next.push(p);
      next.sort((a, b) => {
        const aDate = a.scheduled_at ?? a.created_at;
        const bDate = b.scheduled_at ?? b.created_at;
        return new Date(aDate).getTime() - new Date(bDate).getTime();
      });
      return next;
    });
  };

  const removePost = (id: string) =>
    setPosts((prev) => prev.filter((p) => p.id !== id));

  // Segmenti
  const todayKey = dayKey(new Date().toISOString());
  const now = new Date();
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const weekEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7);

  const [selectedDay, setSelectedDay] = useState<string>(todayKey);

  const { postsOfSelectedDay, postsWithoutDate } = useMemo(() => {
    const ofDay: SocialPost[] = [];
    const noDate: SocialPost[] = [];
    const seenIds = new Set<string>();
    const add = (list: SocialPost[], p: SocialPost) => {
      if (seenIds.has(p.id)) return;
      seenIds.add(p.id);
      list.push(p);
    };
    for (const p of posts) {
      if (p.status === "skip") continue;
      const matchesDay =
        (p.published_linkedin_at && dayKey(p.published_linkedin_at) === selectedDay) ||
        (p.published_x_at && dayKey(p.published_x_at) === selectedDay) ||
        (p.status !== "pubblicato" &&
          p.scheduled_at &&
          dayKey(p.scheduled_at) === selectedDay);

      if (matchesDay) {
        add(ofDay, p);
        continue;
      }
      // Bozze senza alcuna data → in "senza data" se il giorno selezionato NON è oggi,
      // altrimenti appaiono in "oggi" come backlog utile
      if (
        !p.scheduled_at &&
        !p.published_linkedin_at &&
        !p.published_x_at &&
        p.status !== "pubblicato"
      ) {
        if (selectedDay === todayKey) add(ofDay, p);
        else add(noDate, p);
      }
    }
    return { postsOfSelectedDay: ofDay, postsWithoutDate: noDate };
  }, [posts, selectedDay, todayKey]);

  const isSelectedToday = selectedDay === todayKey;
  const selectedDayHeading = isSelectedToday
    ? "Oggi · da pubblicare"
    : `Post del ${new Date(selectedDay + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", day: "numeric", month: "long" })}`;

  return (
    <>
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          marginBottom: 28,
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            className="v2-mono"
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "hsl(var(--v2-accent))",
              marginBottom: 6,
              fontWeight: 600,
            }}
          >
            // CONTENT · SOCIAL
          </div>
          <h1
            style={{
              fontSize: 28,
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "hsl(var(--v2-text))",
            }}
          >
            Social editor
          </h1>
          <p
            style={{
              fontSize: 13,
              color: "hsl(var(--v2-text-dim))",
              marginTop: 4,
            }}
          >
            Genera post LinkedIn + X con Claude, calendarizza, copia-incolla.
          </p>
        </div>
        <button
          type="button"
          className="v2-btn v2-btn--primary"
          onClick={() => setGeneratorOpen(true)}
        >
          <Plus className="w-4 h-4" />
          Nuovo post
        </button>
      </div>

      {/* 1. Calendario ribbon orizzontale sempre in alto */}
      <section style={{ marginBottom: 28 }}>
        <CalendarRibbon
          allPosts={posts}
          selectedDayKey={selectedDay}
          onSelect={setSelectedDay}
        />
      </section>

      {/* 2. Post del giorno selezionato */}
      <section style={{ marginBottom: 32 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 14,
          }}
        >
          <Clock
            className="w-4 h-4"
            style={{ color: "hsl(var(--v2-accent))" }}
            strokeWidth={2}
          />
          <h2
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: "hsl(var(--v2-text))",
              textTransform: "uppercase",
              letterSpacing: "0.14em",
            }}
          >
            {selectedDayHeading}
          </h2>
          <span
            style={{
              fontSize: 11,
              color: "hsl(var(--v2-text-mute))",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            {postsOfSelectedDay.length}
          </span>
        </div>
        {postsOfSelectedDay.length === 0 ? (
          <div
            className="v2-card"
            style={{
              padding: 24,
              textAlign: "center",
              color: "hsl(var(--v2-text-mute))",
              fontSize: 13,
            }}
          >
            Nessun post per questo giorno.{" "}
            {isSelectedToday ? (
              <>
                Genera qualcosa con il pulsante <strong>Nuovo post</strong> o
                chiedi all&apos;agente AI.
              </>
            ) : null}
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {postsOfSelectedDay.map((p) => (
              <PostRow key={p.id} post={p} onOpen={() => setEditing(p)} big />
            ))}
          </div>
        )}
      </section>

      {/* 3. Bozze senza data (se ce ne sono) */}
      {postsWithoutDate.length > 0 && !isSelectedToday && (
        <section style={{ marginBottom: 32 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <Sparkles
              className="w-4 h-4"
              style={{ color: "hsl(var(--v2-warn))" }}
              strokeWidth={2}
            />
            <h2
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: "hsl(var(--v2-text))",
                textTransform: "uppercase",
                letterSpacing: "0.14em",
              }}
            >
              Bozze senza data
            </h2>
            <span
              style={{
                fontSize: 11,
                color: "hsl(var(--v2-text-mute))",
                fontFamily: "var(--font-mono), monospace",
              }}
            >
              {postsWithoutDate.length}
            </span>
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {postsWithoutDate.map((p) => (
              <PostRow key={p.id} post={p} onOpen={() => setEditing(p)} />
            ))}
          </div>
        </section>
      )}

      {/* Pubblicati ora si vedono cliccando sui giorni passati nel calendario */}

      {/* Drawer generatore */}
      {generatorOpen && (
        <GeneratorDrawer
          delibere={initialDelibere}
          onClose={() => setGeneratorOpen(false)}
          onCreated={(p) => {
            upsertPost(p);
            setGeneratorOpen(false);
            setEditing(p);
          }}
        />
      )}

      {/* Drawer editor */}
      {editing && (
        <PostDrawer
          post={editing}
          onClose={() => setEditing(null)}
          onUpdate={(p) => {
            upsertPost(p);
            setEditing(p);
          }}
          onDelete={(id) => {
            removePost(id);
            setEditing(null);
          }}
        />
      )}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════
// POST ROW
// ═══════════════════════════════════════════════════════════════════

function PostRow({
  post,
  onOpen,
  big,
  compact,
}: {
  post: SocialPost;
  onOpen: () => void;
  big?: boolean;
  compact?: boolean;
}) {
  const meta = tipoMeta(post.tipo);
  const preview = (post.hook || post.copy_linkedin || "(vuoto)").slice(0, 180);
  const hasImage =
    Boolean(post.image_url) ||
    Boolean(post.image_template);
  const imgSrc = hasImage
    ? `/api/admin/social/image/${post.id}?format=square`
    : null;
  const thumbSize = big ? 92 : compact ? 52 : 72;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="v2-card v2-card--interactive"
      style={{
        width: "100%",
        textAlign: "left",
        padding: compact ? 12 : big ? 18 : 14,
        display: "flex",
        alignItems: "stretch",
        gap: 14,
      }}
    >
      {imgSrc && (
        <div
          style={{
            width: thumbSize,
            height: thumbSize,
            flexShrink: 0,
            borderRadius: 10,
            overflow: "hidden",
            background: "hsl(var(--v2-bg))",
            border: "1px solid hsl(var(--v2-border))",
          }}
        >
          <img
            src={imgSrc}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
            loading="lazy"
          />
        </div>
      )}
      <div
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          justifyContent: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: "hsl(var(--v2-text))",
            }}
          >
            {meta.emoji} {meta.label}
          </span>
          <span style={statusChipStyle(post.status)}>
            {statusLabel(post.status)}
          </span>
          {post.generated_by === "auto" && (
            <span
              title="Generato automaticamente dal cron mattutino"
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 5,
                background: "hsl(var(--v2-accent) / 0.12)",
                color: "hsl(var(--v2-accent))",
                border: "1px solid hsl(var(--v2-accent) / 0.3)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              🤖 auto
            </span>
          )}
          {post.image_url && (
            <span
              title="Con hero AI Nano Banana"
              style={{
                fontSize: 10,
                padding: "2px 7px",
                borderRadius: 5,
                background: "hsl(var(--v2-info) / 0.12)",
                color: "hsl(var(--v2-info))",
                border: "1px solid hsl(var(--v2-info) / 0.3)",
                fontWeight: 700,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              🎨 AI
            </span>
          )}
          <span
            className="v2-mono"
            style={{
              fontSize: 10,
              color: "hsl(var(--v2-text-mute))",
              marginLeft: "auto",
            }}
          >
            {formatDateShort(post.scheduled_at)}
          </span>
        </div>
        {!compact && (
          <div
            style={{
              fontSize: big ? 13.5 : 12.5,
              lineHeight: 1.45,
              color: "hsl(var(--v2-text-dim))",
              whiteSpace: "pre-wrap",
              display: "-webkit-box",
              WebkitLineClamp: big ? 3 : 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {preview}
            {post.copy_linkedin.length > 180 ? "…" : ""}
          </div>
        )}
      </div>
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════
// CALENDAR RIBBON (horizontal scroll)
// ═══════════════════════════════════════════════════════════════════

type DayMeta = {
  date: Date;
  key: string;
  counts: { published: number; scheduled: number; draft: number; total: number };
};

function CalendarRibbon({
  allPosts,
  selectedDayKey,
  onSelect,
}: {
  allPosts: SocialPost[];
  selectedDayKey: string;
  onSelect: (key: string) => void;
}) {
  const todayKey = dayKey(new Date().toISOString());
  // Range: 30gg indietro + 60gg avanti rispetto a oggi
  const RANGE_BACK = 30;
  const RANGE_FWD = 60;

  const days = useMemo<DayMeta[]>(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - RANGE_BACK);
    const list: DayMeta[] = [];
    for (let i = 0; i <= RANGE_BACK + RANGE_FWD; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = dayKey(d.toISOString());
      list.push({
        date: d,
        key,
        counts: { published: 0, scheduled: 0, draft: 0, total: 0 },
      });
    }
    // Conta per ogni giorno
    const byKey = new Map(list.map((x) => [x.key, x]));
    for (const p of allPosts) {
      if (p.status === "skip") continue;
      const ids = new Set<string>();
      const bump = (k: string | null | undefined, kind: "published" | "scheduled" | "draft") => {
        if (!k) return;
        const dm = byKey.get(k);
        if (!dm) return;
        const uniq = p.id + ":" + kind;
        if (ids.has(uniq)) return;
        ids.add(uniq);
        dm.counts[kind]++;
        dm.counts.total++;
      };
      if (p.published_linkedin_at) bump(dayKey(p.published_linkedin_at), "published");
      if (p.published_x_at) bump(dayKey(p.published_x_at), "published");
      if (p.status !== "pubblicato" && p.scheduled_at)
        bump(dayKey(p.scheduled_at), "scheduled");
      if (
        !p.scheduled_at &&
        !p.published_linkedin_at &&
        !p.published_x_at &&
        p.status !== "pubblicato"
      )
        bump(todayKey, "draft");
    }
    return list;
  }, [allPosts, todayKey]);

  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLButtonElement>(null);

  // Al mount: scroll fino al giorno selezionato (default oggi) centrato
  useEffect(() => {
    if (selectedRef.current) {
      selectedRef.current.scrollIntoView({
        behavior: "instant" as ScrollBehavior,
        inline: "center",
        block: "nearest",
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shiftBy = (n: number) => {
    const idx = days.findIndex((d) => d.key === selectedDayKey);
    if (idx < 0) return;
    const next = Math.max(0, Math.min(days.length - 1, idx + n));
    onSelect(days[next].key);
    // Sincronizza scroll verso nuovo selezionato
    requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector<HTMLElement>(
        `[data-day="${days[next].key}"]`,
      );
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  };

  const goToday = () => {
    onSelect(todayKey);
    requestAnimationFrame(() => {
      const el = scrollRef.current?.querySelector<HTMLElement>(
        `[data-day="${todayKey}"]`,
      );
      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    });
  };

  const scrollByPx = (px: number) => {
    scrollRef.current?.scrollBy({ left: px, behavior: "smooth" });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 12,
        }}
      >
        <Calendar
          className="w-4 h-4"
          style={{ color: "hsl(var(--v2-info))" }}
          strokeWidth={2}
        />
        <h2
          style={{
            fontSize: 14,
            fontWeight: 700,
            color: "hsl(var(--v2-text))",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
          }}
        >
          Calendario
        </h2>
        <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
          <button
            type="button"
            onClick={() => shiftBy(-1)}
            className="v2-btn v2-btn--ghost"
            style={{ padding: "6px 10px", fontSize: 12 }}
            title="Giorno precedente"
            aria-label="Giorno precedente"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={goToday}
            className="v2-btn v2-btn--ghost"
            style={{
              padding: "6px 12px",
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              opacity: selectedDayKey === todayKey ? 0.5 : 1,
            }}
            disabled={selectedDayKey === todayKey}
          >
            Oggi
          </button>
          <button
            type="button"
            onClick={() => shiftBy(1)}
            className="v2-btn v2-btn--ghost"
            style={{ padding: "6px 10px", fontSize: 12 }}
            title="Giorno successivo"
            aria-label="Giorno successivo"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Ribbon con scroll orizzontale */}
      <div style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => scrollByPx(-600)}
          aria-label="Scorri indietro"
          style={{
            position: "absolute",
            left: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "hsl(var(--v2-bg))",
            border: "1px solid hsl(var(--v2-border))",
            color: "hsl(var(--v2-text-dim))",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px hsl(0 0% 0% / 0.3)",
            zIndex: 2,
          }}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => scrollByPx(600)}
          aria-label="Scorri avanti"
          style={{
            position: "absolute",
            right: -8,
            top: "50%",
            transform: "translateY(-50%)",
            width: 30,
            height: 30,
            borderRadius: "50%",
            background: "hsl(var(--v2-bg))",
            border: "1px solid hsl(var(--v2-border))",
            color: "hsl(var(--v2-text-dim))",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            boxShadow: "0 2px 8px hsl(0 0% 0% / 0.3)",
            zIndex: 2,
          }}
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          ref={scrollRef}
          className="v2-calendar-ribbon"
          style={{
            display: "flex",
            gap: 10,
            overflowX: "auto",
            overflowY: "hidden",
            scrollSnapType: "x mandatory",
            padding: "6px 4px",
            scrollbarWidth: "thin",
          }}
        >
          {days.map((dm) => {
            const isSel = dm.key === selectedDayKey;
            const isToday = dm.key === todayKey;
            const isPast = dm.key < todayKey;
            return (
              <button
                type="button"
                key={dm.key}
                data-day={dm.key}
                ref={isSel ? selectedRef : undefined}
                onClick={() => onSelect(dm.key)}
                style={{
                  flex: "0 0 auto",
                  minWidth: 180,
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1px solid ${
                    isSel
                      ? "hsl(var(--v2-accent))"
                      : isToday
                        ? "hsl(var(--v2-accent) / 0.35)"
                        : "hsl(var(--v2-border))"
                  }`,
                  background: isSel
                    ? "hsl(var(--v2-accent) / 0.14)"
                    : "hsl(var(--v2-card))",
                  color: "hsl(var(--v2-text))",
                  textAlign: "left",
                  cursor: "pointer",
                  scrollSnapAlign: "center",
                  transition: "all 140ms ease",
                  boxShadow: isSel
                    ? "0 0 0 1px hsl(var(--v2-accent) / 0.3), 0 4px 16px hsl(var(--v2-accent) / 0.14)"
                    : "none",
                  opacity: isPast && !isSel ? 0.72 : 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    justifyContent: "space-between",
                  }}
                >
                  <span
                    className="v2-mono"
                    style={{
                      fontSize: 10,
                      letterSpacing: "0.18em",
                      textTransform: "uppercase",
                      fontWeight: 700,
                      color: isToday
                        ? "hsl(var(--v2-accent))"
                        : "hsl(var(--v2-text-mute))",
                    }}
                  >
                    {dm.date.toLocaleDateString("it-IT", { weekday: "short" })}
                    {isToday ? " · oggi" : ""}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      color: "hsl(var(--v2-text-mute))",
                      textTransform: "lowercase",
                    }}
                  >
                    {dm.date.toLocaleDateString("it-IT", { month: "short" })}
                  </span>
                </div>

                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                      color: "hsl(var(--v2-text))",
                      lineHeight: 1,
                    }}
                  >
                    {dm.date.getDate()}
                  </span>
                  {dm.counts.total > 0 && (
                    <span
                      className="v2-mono"
                      style={{
                        fontSize: 10.5,
                        color: "hsl(var(--v2-text-mute))",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {dm.counts.total} post
                    </span>
                  )}
                </div>

                {/* Dots counter per tipo */}
                {dm.counts.total > 0 ? (
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {dm.counts.published > 0 && (
                      <span
                        className="v2-mono"
                        style={{
                          fontSize: 9.5,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "hsl(var(--v2-accent) / 0.14)",
                          color: "hsl(var(--v2-accent))",
                          fontWeight: 700,
                        }}
                      >
                        ✓ {dm.counts.published}
                      </span>
                    )}
                    {dm.counts.scheduled > 0 && (
                      <span
                        className="v2-mono"
                        style={{
                          fontSize: 9.5,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "hsl(var(--v2-info) / 0.14)",
                          color: "hsl(var(--v2-info))",
                          fontWeight: 700,
                        }}
                      >
                        ◇ {dm.counts.scheduled}
                      </span>
                    )}
                    {dm.counts.draft > 0 && (
                      <span
                        className="v2-mono"
                        style={{
                          fontSize: 9.5,
                          padding: "2px 6px",
                          borderRadius: 4,
                          background: "hsl(var(--v2-warn) / 0.14)",
                          color: "hsl(var(--v2-warn))",
                          fontWeight: 700,
                        }}
                      >
                        ✎ {dm.counts.draft}
                      </span>
                    )}
                  </div>
                ) : (
                  <div
                    style={{
                      fontSize: 10,
                      color: "hsl(var(--v2-text-mute))",
                      fontStyle: "italic",
                    }}
                  >
                    —
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GENERATOR DRAWER
// ═══════════════════════════════════════════════════════════════════

function GeneratorDrawer({
  delibere,
  onClose,
  onCreated,
}: {
  delibere: Delibera[];
  onClose: () => void;
  onCreated: (p: SocialPost) => void;
}) {
  const [tipo, setTipo] = useState<SocialPostTipo>("libero");
  const [deliberaId, setDeliberaId] = useState<string>("");
  const [brief, setBrief] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleGenerate = () => {
    startTransition(async () => {
      try {
        const fonteKind =
          tipo === "delibera" ? "delibera" : tipo === "libero" ? null : null;
        const fonteId = tipo === "delibera" ? deliberaId || null : null;
        if (tipo === "delibera" && !fonteId) {
          toast.error("Seleziona una delibera");
          return;
        }
        const post = await generateSocialPost({
          tipo,
          fonte_kind: fonteKind,
          fonte_id: fonteId,
          brief: brief || undefined,
        });
        toast.success("Post generato");
        onCreated(post);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Errore sconosciuto";
        toast.error(`Generazione fallita: ${msg}`);
      }
    });
  };

  return (
    <Drawer onClose={onClose} title="Nuovo post">
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        <Field label="Tipologia">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 6 }}>
            {TIPO_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => setTipo(o.value)}
                className="v2-chip"
                style={{
                  padding: "8px 10px",
                  border: "1px solid hsl(var(--v2-border))",
                  background:
                    tipo === o.value
                      ? "hsl(var(--v2-accent) / 0.14)"
                      : "hsl(var(--v2-card))",
                  color:
                    tipo === o.value
                      ? "hsl(var(--v2-accent))"
                      : "hsl(var(--v2-text-dim))",
                  borderColor:
                    tipo === o.value
                      ? "hsl(var(--v2-accent) / 0.4)"
                      : "hsl(var(--v2-border))",
                  fontSize: 12,
                  fontWeight: 600,
                  textAlign: "left",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              >
                {o.emoji} {o.label}
              </button>
            ))}
          </div>
        </Field>

        {tipo === "delibera" && (
          <Field label="Delibera">
            <select
              className="v2-input"
              value={deliberaId}
              onChange={(e) => setDeliberaId(e.target.value)}
            >
              <option value="">— Seleziona —</option>
              {delibere.map((d) => (
                <option key={d.id} value={String(d.id)}>
                  {d.numero} · {(d.titolo ?? "").slice(0, 80)}
                </option>
              ))}
            </select>
            <p
              style={{
                fontSize: 11,
                color: "hsl(var(--v2-text-mute))",
                marginTop: 6,
              }}
            >
              Solo delibere con summary AI già generato.
            </p>
          </Field>
        )}

        <Field label="Brief opzionale">
          <textarea
            className="v2-input"
            rows={5}
            placeholder="Note extra, angolo editoriale, dato da enfatizzare, CTA…"
            value={brief}
            onChange={(e) => setBrief(e.target.value)}
          />
        </Field>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            borderTop: "1px solid hsl(var(--v2-border))",
            paddingTop: 16,
          }}
        >
          <button type="button" className="v2-btn v2-btn--ghost" onClick={onClose}>
            Annulla
          </button>
          <button
            type="button"
            className="v2-btn v2-btn--primary"
            onClick={handleGenerate}
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isPending ? "Genero con Claude…" : "Genera con AI"}
          </button>
        </div>
      </div>
    </Drawer>
  );
}

// ═══════════════════════════════════════════════════════════════════
// POST EDITOR DRAWER
// ═══════════════════════════════════════════════════════════════════

type EditorTab = "preview" | "testi" | "immagine" | "schedula";

function PostDrawer({
  post,
  onClose,
  onUpdate,
  onDelete,
}: {
  post: SocialPost;
  onClose: () => void;
  onUpdate: (p: SocialPost) => void;
  onDelete: (id: string) => void;
}) {
  const [tab, setTab] = useState<EditorTab>("preview");
  const [copyLinkedin, setCopyLinkedin] = useState(post.copy_linkedin);
  const [copyX, setCopyX] = useState(post.copy_x);
  const [hashtags, setHashtags] = useState(post.hashtags.join(" "));
  const [scheduledAt, setScheduledAt] = useState(
    post.scheduled_at
      ? new Date(post.scheduled_at).toISOString().slice(0, 16)
      : "",
  );
  const [lane, setLane] = useState<SocialPost["scheduled_lane"]>(
    post.scheduled_lane,
  );
  const [notes, setNotes] = useState(post.notes ?? "");
  const [isSaving, startSave] = useTransition();
  const [activePreview, setActivePreview] = useState<"linkedin" | "x">("linkedin");

  const imageUrl = post.image_template
    ? `/api/admin/social/image/${post.id}?format=square`
    : null;

  const save = (overrides: Partial<Parameters<typeof updateSocialPost>[1]> = {}) => {
    startSave(async () => {
      try {
        const hashtagList = hashtags
          .split(/[\s,]+/)
          .map((h) => h.trim().replace(/^#/, ""))
          .filter(Boolean);
        const patch = {
          copy_linkedin: copyLinkedin,
          copy_x: copyX,
          hashtags: hashtagList,
          scheduled_at: scheduledAt ? new Date(scheduledAt).toISOString() : null,
          scheduled_lane: lane,
          notes: notes || null,
          ...overrides,
        };
        const updated = await updateSocialPost(post.id, patch);
        onUpdate(updated);
        toast.success("Salvato");
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Errore";
        toast.error(`Salvataggio fallito: ${msg}`);
      }
    });
  };

  const markDone = async (laneUsed: "linkedin" | "x" | "both") => {
    await markPublished(post.id, laneUsed);
    toast.success("Segnato come pubblicato");
    onUpdate({ ...post, status: "pubblicato" });
  };
  const del = async () => {
    if (!confirm("Eliminare questo post?")) return;
    await deleteSocialPost(post.id);
    onDelete(post.id);
    toast.success("Post eliminato");
  };

  const copyToClipboard = async (text: string) => {
    try {
      const hashtagList = hashtags
        .split(/[\s,]+/)
        .map((h) => h.trim().replace(/^#/, ""))
        .filter(Boolean);
      const withTags =
        hashtagList.length > 0
          ? `${text}\n\n${hashtagList.map((h) => `#${h}`).join(" ")}`
          : text;
      await navigator.clipboard.writeText(withTags);
      toast.success("Copiato negli appunti");
    } catch {
      toast.error("Impossibile copiare");
    }
  };

  const meta = tipoMeta(post.tipo);
  const hashtagListArr = hashtags
    .split(/[\s,]+/)
    .map((h) => h.trim().replace(/^#/, ""))
    .filter(Boolean);

  const statusBadge = (
    <span style={statusChipStyle(post.status)}>{statusLabel(post.status)}</span>
  );

  const tabsBar = (
    <div
      style={{
        display: "flex",
        gap: 2,
        overflowX: "auto",
      }}
    >
      <TabButton
        active={tab === "preview"}
        onClick={() => setTab("preview")}
        icon={<Linkedin className="w-3.5 h-3.5" />}
        label="Anteprima"
      />
      <TabButton
        active={tab === "testi"}
        onClick={() => setTab("testi")}
        icon={<Copy className="w-3.5 h-3.5" />}
        label="Testi"
      />
      <TabButton
        active={tab === "immagine"}
        onClick={() => setTab("immagine")}
        icon={<ImageIcon className="w-3.5 h-3.5" />}
        label="Immagine"
      />
      <TabButton
        active={tab === "schedula"}
        onClick={() => setTab("schedula")}
        icon={<Calendar className="w-3.5 h-3.5" />}
        label="Schedula"
      />
    </div>
  );

  const footer = (
    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
      <button
        type="button"
        className="v2-btn v2-btn--primary"
        onClick={() => save()}
        disabled={isSaving}
      >
        {isSaving ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Check className="w-4 h-4" />
        )}
        Salva
      </button>

      {post.status !== "pubblicato" && (
        <>
          <button
            type="button"
            className="v2-btn v2-btn--ghost"
            onClick={() => markDone("linkedin")}
          >
            <Linkedin className="w-4 h-4" /> Pubblicato LI
          </button>
          <button
            type="button"
            className="v2-btn v2-btn--ghost"
            onClick={() => markDone("x")}
          >
            𝕏 Pubblicato X
          </button>
        </>
      )}

      <button
        type="button"
        className="v2-btn v2-btn--ghost"
        onClick={del}
        style={{ marginLeft: "auto", color: "hsl(var(--v2-danger))" }}
        aria-label="Elimina"
        title="Elimina"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );

  return (
    <Drawer
      onClose={onClose}
      width={720}
      title={`${meta.emoji} ${meta.label}`}
      subtitle={post.hook ?? "(post senza hook)"}
      badge={statusBadge}
      tabs={tabsBar}
      footer={footer}
    >
      {tab === "preview" && (
        <PreviewTab
          copyLinkedin={copyLinkedin}
          copyX={copyX}
          hashtags={hashtagListArr}
          imageUrl={imageUrl}
          activePreview={activePreview}
          setActivePreview={setActivePreview}
          onCopyLinkedIn={() => copyToClipboard(copyLinkedin)}
          onCopyX={() => copyToClipboard(copyX)}
          post={post}
        />
      )}

      {tab === "testi" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <Field label="LinkedIn copy">
            <textarea
              className="v2-input"
              rows={14}
              value={copyLinkedin}
              onChange={(e) => setCopyLinkedin(e.target.value)}
              style={{ fontFamily: "inherit", lineHeight: 1.5 }}
            />
            <CharFooter
              count={copyLinkedin.length}
              onCopy={() => copyToClipboard(copyLinkedin)}
            />
          </Field>
          <Field label="X copy (separa thread con '---' su riga vuota)">
            <textarea
              className="v2-input"
              rows={8}
              value={copyX}
              onChange={(e) => setCopyX(e.target.value)}
              style={{ fontFamily: "inherit", lineHeight: 1.5 }}
            />
            <CharFooter
              count={copyX.length}
              onCopy={() => copyToClipboard(copyX)}
            />
          </Field>
          <Field label="Hashtag (separati da spazio)">
            <input
              type="text"
              className="v2-input"
              placeholder="energia ARERA PUN"
              value={hashtags}
              onChange={(e) => setHashtags(e.target.value)}
            />
            {hashtagListArr.length > 0 && (
              <div
                style={{
                  marginTop: 6,
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 4,
                }}
              >
                {hashtagListArr.map((h) => (
                  <span
                    key={h}
                    style={{
                      fontSize: 11,
                      padding: "2px 8px",
                      borderRadius: 4,
                      background: "hsl(var(--v2-accent) / 0.1)",
                      color: "hsl(var(--v2-accent))",
                      fontWeight: 600,
                    }}
                  >
                    #{h}
                  </span>
                ))}
              </div>
            )}
          </Field>
        </div>
      )}

      {tab === "immagine" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {imageUrl ? (
            <>
              <div
                className="v2-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "hsl(var(--v2-text-mute))",
                  fontWeight: 600,
                }}
              >
                Template: {post.image_template}
              </div>
              <div
                style={{
                  border: "1px solid hsl(var(--v2-border))",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "hsl(var(--v2-bg))",
                }}
              >
                <img
                  src={imageUrl}
                  alt="template"
                  style={{ width: "100%", display: "block" }}
                />
              </div>
              <div
                className="v2-mono"
                style={{
                  fontSize: 10,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: "hsl(var(--v2-text-mute))",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                Scarica nei 3 formati
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                <a
                  href={`/api/admin/social/image/${post.id}?format=square`}
                  download={`post-${post.id}-square.png`}
                  className="v2-btn v2-btn--ghost"
                  style={{ fontSize: 12 }}
                >
                  <Download className="w-3.5 h-3.5" /> Square 1080
                </a>
                <a
                  href={`/api/admin/social/image/${post.id}?format=feed`}
                  download={`post-${post.id}-feed.png`}
                  className="v2-btn v2-btn--ghost"
                  style={{ fontSize: 12 }}
                >
                  <Download className="w-3.5 h-3.5" /> LI Feed 1200×627
                </a>
                <a
                  href={`/api/admin/social/image/${post.id}?format=landscape`}
                  download={`post-${post.id}-landscape.png`}
                  className="v2-btn v2-btn--ghost"
                  style={{ fontSize: 12 }}
                >
                  <Download className="w-3.5 h-3.5" /> X 1600×900
                </a>
              </div>
            </>
          ) : (
            <div
              className="v2-card"
              style={{
                padding: 20,
                textAlign: "center",
                color: "hsl(var(--v2-text-mute))",
                fontSize: 13,
              }}
            >
              Nessun template immagine assegnato a questo post.
            </div>
          )}
        </div>
      )}

      {tab === "schedula" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="Data e ora pubblicazione">
            <input
              type="datetime-local"
              className="v2-input"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
          </Field>
          <Field label="Canali di pubblicazione">
            <select
              className="v2-input"
              value={lane}
              onChange={(e) =>
                setLane(e.target.value as SocialPost["scheduled_lane"])
              }
            >
              <option value="both">LinkedIn + X</option>
              <option value="linkedin">Solo LinkedIn</option>
              <option value="x">Solo X</option>
            </select>
          </Field>
          <Field label="Note interne">
            <textarea
              className="v2-input"
              rows={4}
              placeholder="Promemoria per te stesso…"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              style={{ fontFamily: "inherit", lineHeight: 1.5 }}
            />
          </Field>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 10,
              borderTop: "1px solid hsl(var(--v2-border))",
              paddingTop: 14,
              fontSize: 11,
              color: "hsl(var(--v2-text-mute))",
              fontFamily: "var(--font-mono), monospace",
            }}
          >
            <div>
              <div style={{ textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>
                Stato
              </div>
              <span style={statusChipStyle(post.status)}>{statusLabel(post.status)}</span>
            </div>
            <div>
              <div style={{ textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>
                Creato
              </div>
              <div>{new Date(post.created_at).toLocaleDateString("it-IT")}</div>
            </div>
            {post.published_linkedin_at && (
              <div>
                <div style={{ textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>
                  Pubblicato LI
                </div>
                <div>{new Date(post.published_linkedin_at).toLocaleString("it-IT")}</div>
              </div>
            )}
            {post.published_x_at && (
              <div>
                <div style={{ textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>
                  Pubblicato X
                </div>
                <div>{new Date(post.published_x_at).toLocaleString("it-IT")}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </Drawer>
  );
}

// ─── Piccoli atomi usati solo dentro PostDrawer ───

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: "10px 14px",
        background: "transparent",
        color: active ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-mute))",
        border: "none",
        borderBottom: active
          ? "2px solid hsl(var(--v2-accent))"
          : "2px solid transparent",
        cursor: "pointer",
        fontSize: 13,
        fontWeight: 600,
        letterSpacing: "-0.005em",
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        whiteSpace: "nowrap",
        transition: "color 120ms ease",
        marginBottom: -1,
      }}
    >
      {icon}
      {label}
    </button>
  );
}

function CharFooter({
  count,
  onCopy,
}: {
  count: number;
  onCopy: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: 6,
        fontSize: 11,
        color: "hsl(var(--v2-text-mute))",
        fontFamily: "var(--font-mono), monospace",
      }}
    >
      <span>{count} caratteri</span>
      <button
        type="button"
        onClick={onCopy}
        style={{
          fontSize: 11,
          color: "hsl(var(--v2-accent))",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
          background: "transparent",
          border: "1px solid hsl(var(--v2-accent) / 0.2)",
          padding: "3px 8px",
          borderRadius: 6,
          cursor: "pointer",
          fontWeight: 600,
        }}
      >
        <Copy className="w-3 h-3" /> Copia con hashtag
      </button>
    </div>
  );
}

function PreviewTab({
  copyLinkedin,
  copyX,
  hashtags,
  imageUrl,
  activePreview,
  setActivePreview,
  onCopyLinkedIn,
  onCopyX,
  post,
}: {
  copyLinkedin: string;
  copyX: string;
  hashtags: string[];
  imageUrl: string | null;
  activePreview: "linkedin" | "x";
  setActivePreview: (v: "linkedin" | "x") => void;
  onCopyLinkedIn: () => void;
  onCopyX: () => void;
  post: SocialPost;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Toggle LinkedIn / X */}
      <div
        style={{
          display: "flex",
          gap: 4,
          padding: 4,
          background: "hsl(var(--v2-card))",
          border: "1px solid hsl(var(--v2-border))",
          borderRadius: 10,
          alignSelf: "flex-start",
        }}
      >
        <button
          type="button"
          onClick={() => setActivePreview("linkedin")}
          style={{
            padding: "6px 14px",
            background:
              activePreview === "linkedin"
                ? "hsl(var(--v2-accent) / 0.14)"
                : "transparent",
            color:
              activePreview === "linkedin"
                ? "hsl(var(--v2-accent))"
                : "hsl(var(--v2-text-dim))",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <Linkedin className="w-3.5 h-3.5" /> LinkedIn
        </button>
        <button
          type="button"
          onClick={() => setActivePreview("x")}
          style={{
            padding: "6px 14px",
            background:
              activePreview === "x"
                ? "hsl(var(--v2-accent) / 0.14)"
                : "transparent",
            color:
              activePreview === "x"
                ? "hsl(var(--v2-accent))"
                : "hsl(var(--v2-text-dim))",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          𝕏 X
        </button>
      </div>

      {activePreview === "linkedin" ? (
        <LinkedInPreview
          copy={copyLinkedin}
          hashtags={hashtags}
          imageUrl={imageUrl}
        />
      ) : (
        <XPreview copy={copyX} hashtags={hashtags} imageUrl={imageUrl} />
      )}

      {/* Azioni quick sotto la preview */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 4,
        }}
      >
        <button
          type="button"
          className="v2-btn v2-btn--primary"
          onClick={activePreview === "linkedin" ? onCopyLinkedIn : onCopyX}
          style={{ flex: "1 1 180px" }}
        >
          <Copy className="w-4 h-4" /> Copia testo{" "}
          {activePreview === "linkedin" ? "LinkedIn" : "X"}
        </button>
        {imageUrl && (
          <a
            href={`/api/admin/social/image/${post.id}?format=${
              activePreview === "linkedin" ? "feed" : "landscape"
            }`}
            download={`post-${post.id}-${
              activePreview === "linkedin" ? "feed" : "landscape"
            }.png`}
            className="v2-btn v2-btn--ghost"
          >
            <Download className="w-4 h-4" /> Scarica immagine
          </a>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// GENERIC DRAWER
// ═══════════════════════════════════════════════════════════════════

function Drawer({
  title,
  subtitle,
  badge,
  tabs,
  children,
  onClose,
  width = 520,
  footer,
}: {
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  tabs?: React.ReactNode;
  children: React.ReactNode;
  onClose: () => void;
  width?: number;
  footer?: React.ReactNode;
}) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "flex-end",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "hsl(0 0% 0% / 0.5)",
          backdropFilter: "blur(4px)",
        }}
      />
      <div
        style={{
          position: "relative",
          width: `min(${width}px, 100vw)`,
          maxWidth: "100vw",
          height: "100%",
          background: "hsl(var(--v2-bg))",
          borderLeft: "1px solid hsl(var(--v2-border))",
          boxShadow: "-24px 0 48px hsl(0 0% 0% / 0.4)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header sticky */}
        <div
          style={{
            padding: "16px 22px 0",
            borderBottom: "1px solid hsl(var(--v2-border))",
            background: "hsl(var(--v2-bg))",
            flexShrink: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
              marginBottom: 12,
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: "hsl(var(--v2-text))",
                    minWidth: 0,
                  }}
                >
                  {title}
                </h3>
                {badge}
              </div>
              {subtitle && (
                <div
                  style={{
                    fontSize: 12,
                    color: "hsl(var(--v2-text-mute))",
                    lineHeight: 1.45,
                    maxWidth: 640,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {subtitle}
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                display: "grid",
                placeItems: "center",
                background: "transparent",
                color: "hsl(var(--v2-text-mute))",
                border: "1px solid hsl(var(--v2-border))",
                cursor: "pointer",
                flexShrink: 0,
              }}
              aria-label="Chiudi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {tabs}
        </div>

        {/* Body scrollabile */}
        <div
          style={{
            flex: 1,
            minHeight: 0,
            overflowY: "auto",
            padding: 22,
          }}
        >
          {children}
        </div>

        {/* Footer sticky */}
        {footer && (
          <div
            style={{
              flexShrink: 0,
              padding: "12px 18px",
              borderTop: "1px solid hsl(var(--v2-border))",
              background: "hsl(var(--v2-bg))",
              boxShadow: "0 -12px 24px hsl(0 0% 0% / 0.3)",
            }}
          >
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <span
        className="v2-mono"
        style={{
          fontSize: 10,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "hsl(var(--v2-text-mute))",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}
