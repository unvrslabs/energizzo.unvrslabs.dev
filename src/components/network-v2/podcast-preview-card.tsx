import Link from "next/link";
import {
  Mic,
  Play,
  Clock,
  Users,
  Radio,
  ArrowRight,
  Sparkles,
  Calendar,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";

type GuestRow = {
  id: string;
  external_name: string | null;
  external_company: string | null;
  external_role: string | null;
  status: string | null;
  episode_title: string | null;
  episode_url: string | null;
  published_at: string | null;
  recorded_at: string | null;
  invited_at: string | null;
  selected_episode_slug: string | null;
};

type TopicRow = {
  id: string;
  title: string;
  intensity: string | null;
  active: boolean | null;
};

type Stats = {
  target: number;
  invited: number;
  recorded: number;
  published: number;
  total: number;
};

async function loadPodcastData(): Promise<{
  stats: Stats;
  latest: GuestRow | null;
  hotTopics: TopicRow[];
}> {
  try {
    const supabase = await createClient();
    const [guestsRes, topicsRes] = await Promise.all([
      supabase
        .from("podcast_guests")
        .select(
          "id,external_name,external_company,external_role,status,episode_title,episode_url,published_at,recorded_at,invited_at,selected_episode_slug",
        )
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("recorded_at", { ascending: false, nullsFirst: false })
        .order("invited_at", { ascending: false, nullsFirst: false })
        .limit(50),
      supabase
        .from("podcast_hot_topics")
        .select("id,title,intensity,active")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(5),
    ]);

    const guests = (guestsRes.data ?? []) as GuestRow[];
    const stats: Stats = {
      target: guests.filter((g) => g.status === "target").length,
      invited: guests.filter((g) => g.status === "invited").length,
      recorded: guests.filter((g) => g.status === "recorded").length,
      published: guests.filter((g) => g.status === "published").length,
      total: guests.length,
    };
    // Ordine priorità "latest": published > recorded > invited > target
    const latest =
      guests.find((g) => g.status === "published") ??
      guests.find((g) => g.status === "recorded") ??
      guests.find((g) => g.status === "invited") ??
      guests[0] ??
      null;
    return {
      stats,
      latest,
      hotTopics: (topicsRes.data ?? []) as TopicRow[],
    };
  } catch {
    return {
      stats: { target: 0, invited: 0, recorded: 0, published: 0, total: 0 },
      latest: null,
      hotTopics: [],
    };
  }
}

function fmtDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

export async function PodcastPreviewCard() {
  const { stats, latest, hotTopics } = await loadPodcastData();

  const mode: "published" | "recorded" | "prelaunch" =
    latest?.status === "published" && latest.episode_url
      ? "published"
      : latest?.status === "recorded"
        ? "recorded"
        : "prelaunch";

  return (
    <div className="v2-card v2-col-12 overflow-hidden">
      <div className="v2-card-head flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Mic
            className="w-3.5 h-3.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          />
          <span className="v2-card-title">
            Podcast &ldquo;Il Reseller&rdquo;
          </span>
          {mode === "prelaunch" && (
            <span
              className="v2-mono text-[9.5px] font-semibold uppercase tracking-[0.16em] px-1.5 py-0.5 rounded"
              style={{
                color: "hsl(var(--v2-warn))",
                background: "hsl(var(--v2-warn) / 0.12)",
                border: "1px solid hsl(var(--v2-warn) / 0.3)",
              }}
            >
              In preparazione
            </span>
          )}
        </div>
        <Link
          href="/network/podcast"
          className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          Archivio →
        </Link>
      </div>

      <div className="grid lg:grid-cols-[1.4fr_1fr] gap-0">
        {/* HERO visuale */}
        <div
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            minHeight: 320,
            padding: "56px 32px 40px",
            background:
              "radial-gradient(ellipse at 25% 30%, hsl(158 55% 24%) 0%, hsl(215 30% 12%) 55%, hsl(215 35% 8%) 100%)",
            borderRight: "1px solid hsl(var(--v2-border))",
          }}
        >
          {/* Waveform decorativa */}
          <svg
            aria-hidden
            viewBox="0 0 400 120"
            preserveAspectRatio="none"
            className="absolute inset-0 w-full h-full opacity-35"
            style={{ pointerEvents: "none" }}
          >
            <defs>
              <linearGradient id="wf" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="hsl(var(--v2-accent))" stopOpacity="0" />
                <stop offset="50%" stopColor="hsl(var(--v2-accent))" stopOpacity="0.9" />
                <stop offset="100%" stopColor="hsl(var(--v2-accent))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {Array.from({ length: 60 }).map((_, i) => {
              const x = (i / 59) * 400;
              const hNorm = Math.abs(Math.sin((i * 0.42) + 1) * Math.cos(i * 0.23)) * 0.9 + 0.1;
              const barH = hNorm * 80;
              return (
                <rect
                  key={i}
                  x={x}
                  y={60 - barH / 2}
                  width="3"
                  height={barH}
                  rx="1.5"
                  fill="url(#wf)"
                />
              );
            })}
          </svg>
          {/* Bokeh luminosi */}
          <div
            aria-hidden
            className="absolute -top-10 -right-10 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "hsl(var(--v2-accent) / 0.2)", filter: "blur(60px)" }}
          />
          <div
            aria-hidden
            className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "hsl(200 70% 58% / 0.14)", filter: "blur(70px)" }}
          />

          {/* Badge top-left */}
          <div
            className="absolute top-3 left-3 flex items-center gap-2"
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: "hsl(215 30% 8% / 0.72)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Radio
              className="w-3 h-3"
              style={{ color: "hsl(var(--v2-accent))" }}
            />
            <span
              className="v2-mono font-semibold uppercase tracking-[0.16em]"
              style={{ fontSize: 9.5, color: "hsl(var(--v2-text))" }}
            >
              Il Reseller
            </span>
          </div>

          {/* Stats top-right */}
          <div
            className="absolute top-3 right-3 flex items-center gap-2"
            style={{
              padding: "4px 10px",
              borderRadius: 6,
              background: "hsl(215 30% 8% / 0.72)",
              border: "1px solid hsl(0 0% 100% / 0.08)",
              backdropFilter: "blur(8px)",
            }}
          >
            <Users
              className="w-3 h-3"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            />
            <span
              className="v2-mono"
              style={{ fontSize: 10, color: "hsl(var(--v2-text-dim))" }}
            >
              {stats.total} ospiti
            </span>
          </div>

          {/* Elemento centrale a seconda del mode */}
          <div className="relative flex flex-col items-center gap-5">
            {mode === "published" ? (
              <div
                className="grid place-items-center"
                style={{
                  width: 84,
                  height: 84,
                  borderRadius: 999,
                  background:
                    "linear-gradient(135deg, hsl(var(--v2-accent)), hsl(var(--v2-accent) / 0.85))",
                  color: "hsl(215 30% 10%)",
                  boxShadow:
                    "0 16px 40px hsl(var(--v2-accent) / 0.35), inset 0 1px 0 hsl(0 0% 100% / 0.28)",
                }}
              >
                <Play
                  className="w-8 h-8"
                  fill="currentColor"
                  style={{ transform: "translateX(2px)" }}
                />
              </div>
            ) : (
              <div
                className="grid place-items-center relative"
                style={{
                  width: 88,
                  height: 88,
                  borderRadius: 999,
                  background: "hsl(var(--v2-accent) / 0.14)",
                  border: "1px solid hsl(var(--v2-accent) / 0.4)",
                }}
              >
                <Mic
                  className="w-10 h-10"
                  style={{ color: "hsl(var(--v2-accent))" }}
                />
                {mode === "recorded" && (
                  <span
                    aria-hidden
                    className="absolute inset-0 rounded-full animate-pulse"
                    style={{
                      boxShadow:
                        "0 0 0 4px hsl(var(--v2-accent) / 0.15), 0 0 0 12px hsl(var(--v2-accent) / 0.06)",
                    }}
                  />
                )}
              </div>
            )}
            <div
              className="text-center flex flex-col gap-2"
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                background: "hsl(215 30% 8% / 0.55)",
                backdropFilter: "blur(8px)",
                border: "1px solid hsl(0 0% 100% / 0.05)",
              }}
            >
              <span
                className="v2-mono font-semibold uppercase tracking-[0.18em]"
                style={{ fontSize: 10.5, color: "hsl(var(--v2-accent))" }}
              >
                {mode === "published"
                  ? "In onda"
                  : mode === "recorded"
                    ? "Prossima uscita"
                    : "Il podcast dei reseller"}
              </span>
              <span
                className="text-[13px] font-semibold"
                style={{ color: "hsl(var(--v2-text))" }}
              >
                {mode === "published"
                  ? (latest?.episode_title ?? "Episodio live")
                  : mode === "recorded"
                    ? "Episodio registrato · in post-produzione"
                    : "Prima stagione · primavera 2026"}
              </span>
            </div>
          </div>
        </div>

        {/* CONTENUTO destra */}
        <div className="p-5 flex flex-col gap-4">
          {/* Pipeline stats */}
          <div>
            <div
              className="v2-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              Pipeline episodi
            </div>
            <div className="grid grid-cols-4 gap-2">
              <StatCell
                label="Target"
                value={stats.target}
                color="hsl(var(--v2-text-dim))"
              />
              <StatCell
                label="Invitati"
                value={stats.invited}
                color="hsl(var(--v2-info))"
              />
              <StatCell
                label="Registrati"
                value={stats.recorded}
                color="hsl(var(--v2-warn))"
              />
              <StatCell
                label="Live"
                value={stats.published}
                color="hsl(var(--v2-accent))"
                highlight
              />
            </div>
          </div>

          {/* Prossimo episodio / Latest guest */}
          {latest &&
          (latest.external_name ||
            latest.external_company ||
            latest.episode_title) ? (
            <div
              className="pt-3"
              style={{ borderTop: "1px solid hsl(var(--v2-border))" }}
            >
              <div
                className="v2-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-2"
                style={{ color: "hsl(var(--v2-accent))" }}
              >
                {mode === "published"
                  ? "In onda ora"
                  : mode === "recorded"
                    ? "Prossima uscita"
                    : "In selezione"}
              </div>
              {latest.episode_title && (
                <h3
                  className="font-semibold leading-tight mb-2"
                  style={{
                    fontSize: 14,
                    color: "hsl(var(--v2-text))",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {latest.episode_title}
                </h3>
              )}
              <p
                className="text-[12px] leading-relaxed"
                style={{ color: "hsl(var(--v2-text-dim))" }}
              >
                {latest.external_name && (
                  <strong style={{ color: "hsl(var(--v2-text))" }}>
                    {latest.external_name}
                  </strong>
                )}
                {latest.external_role && <> · {latest.external_role}</>}
                {latest.external_company && (
                  <>
                    {" "}·{" "}
                    <em style={{ color: "hsl(var(--v2-text-dim))" }}>
                      {latest.external_company}
                    </em>
                  </>
                )}
              </p>
            </div>
          ) : hotTopics.length > 0 ? (
            <div
              className="pt-3"
              style={{ borderTop: "1px solid hsl(var(--v2-border))" }}
            >
              <div
                className="v2-mono text-[10px] font-semibold uppercase tracking-[0.18em] mb-2 flex items-center gap-2"
                style={{ color: "hsl(var(--v2-accent))" }}
              >
                <Sparkles className="w-3 h-3" />
                Temi sul tavolo
              </div>
              <ul className="flex flex-col gap-1.5">
                {hotTopics.slice(0, 4).map((t) => (
                  <li
                    key={t.id}
                    className="text-[12.5px] leading-tight flex items-start gap-2"
                    style={{ color: "hsl(var(--v2-text))" }}
                  >
                    <span
                      style={{
                        color: "hsl(var(--v2-accent))",
                        fontWeight: 700,
                        flexShrink: 0,
                      }}
                    >
                      ·
                    </span>
                    <span>{t.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {/* CTA */}
          <div className="flex items-center gap-2 mt-auto pt-2 flex-wrap">
            {mode === "published" && latest?.episode_url ? (
              <a
                href={latest.episode_url}
                target="_blank"
                rel="noopener noreferrer"
                className="v2-btn v2-btn--primary"
              >
                <Play className="w-3.5 h-3.5" fill="currentColor" />
                Guarda episodio
              </a>
            ) : (
              <Link href="/network/podcast" className="v2-btn v2-btn--primary">
                <Calendar className="w-3.5 h-3.5" />
                Proponi un ospite
              </Link>
            )}
            <Link href="/network/podcast" className="v2-btn">
              Dettagli
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  color,
  highlight,
}: {
  label: string;
  value: number;
  color: string;
  highlight?: boolean;
}) {
  return (
    <div
      style={{
        padding: "8px 10px",
        borderRadius: 8,
        background: highlight
          ? "hsl(var(--v2-accent) / 0.1)"
          : "hsl(var(--v2-bg-elev))",
        border: `1px solid ${
          highlight ? "hsl(var(--v2-accent) / 0.3)" : "hsl(var(--v2-border))"
        }`,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <span
        className="v2-mono"
        style={{
          fontSize: 9,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "hsl(var(--v2-text-mute))",
          fontWeight: 600,
        }}
      >
        {label}
      </span>
      <span
        className="v2-mono"
        style={{
          fontSize: 22,
          fontWeight: 700,
          color,
          lineHeight: 1,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </span>
    </div>
  );
}

// Clock import kept for potential future use
export type { GuestRow };
void Clock;
