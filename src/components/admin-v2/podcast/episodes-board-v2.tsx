"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, ListOrdered } from "lucide-react";
import type { EpisodePreview } from "@/lib/podcast-content";

const INTENSITY_META: Record<string, { label: string; emoji: string; color: string }> = {
  bollente: { label: "Bollente", emoji: "🔥", color: "hsl(24 90% 62%)" },
  medio: { label: "Media intensità", emoji: "🌡️", color: "hsl(var(--v2-warn))" },
  freddo: { label: "Freddo", emoji: "❄️", color: "hsl(var(--v2-info))" },
};

const PRODUCTION_STATUS_META: Record<
  "da_registrare" | "registrata" | "pubblicata",
  { label: string; emoji: string; color: string }
> = {
  da_registrare: { label: "Da registrare", emoji: "📝", color: "hsl(var(--v2-text-dim))" },
  registrata: { label: "Registrata", emoji: "🎙️", color: "hsl(270 60% 70%)" },
  pubblicata: { label: "Pubblicata", emoji: "🚀", color: "hsl(var(--v2-accent))" },
};

const PRODUCTION_ORDER = ["da_registrare", "registrata", "pubblicata"] as const;

export function EpisodesBoardV2({
  episodes,
  basePath = "/dashboard-v2/podcast/episodi",
}: {
  episodes: EpisodePreview[];
  basePath?: string;
}) {
  const [view, setView] = useState<"timeline" | "kanban">("timeline");

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Editoriale · episodi preparati
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            {episodes.length} puntate, una per tema caldo
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Ogni episodio ha 15 domande con risposte attese e argomenti collegati
          </p>
        </div>

        <div className="v2-card p-1 flex items-center gap-0.5 w-fit">
          {(
            [
              { v: "timeline", label: "Timeline", icon: ListOrdered },
              { v: "kanban", label: "Kanban", icon: LayoutGrid },
            ] as const
          ).map((opt) => {
            const active = view === opt.v;
            const Icon = opt.icon;
            return (
              <button
                key={opt.v}
                onClick={() => setView(opt.v)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors"
                style={{
                  background: active ? "hsl(var(--v2-bg-elev))" : "transparent",
                  color: active ? "hsl(var(--v2-text))" : "hsl(var(--v2-text-dim))",
                  border: `1px solid ${active ? "hsl(var(--v2-border-strong))" : "transparent"}`,
                }}
              >
                <Icon className="w-3.5 h-3.5" />
                {opt.label}
              </button>
            );
          })}
        </div>
      </header>

      {episodes.length === 0 ? (
        <div className="v2-card p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Nessun episodio caricato.
        </div>
      ) : view === "timeline" ? (
        <TimelineView episodes={episodes} basePath={basePath} />
      ) : (
        <KanbanView episodes={episodes} basePath={basePath} />
      )}
    </div>
  );
}

function TimelineView({
  episodes,
  basePath,
}: {
  episodes: EpisodePreview[];
  basePath: string;
}) {
  return (
    <ol className="relative flex flex-col gap-3 before:absolute before:left-5 before:top-3 before:bottom-3 before:w-px" style={{ ["--tw-before-bg" as string]: "hsl(var(--v2-border))" }}>
      <style>{`ol.relative::before{background: hsl(var(--v2-border))}`}</style>
      {episodes.map((ep) => {
        const meta = ep.intensity ? INTENSITY_META[ep.intensity] : null;
        return (
          <li key={ep.slug} className="relative flex gap-4 items-stretch">
            <div
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full v2-mono text-[12px] font-bold"
              style={{
                background: "hsl(var(--v2-bg-elev))",
                border: "1px solid hsl(var(--v2-accent) / 0.5)",
                color: "hsl(var(--v2-accent))",
              }}
              aria-hidden
            >
              {ep.numero !== null ? String(ep.numero).padStart(2, "0") : "·"}
            </div>
            <Link
              href={`${basePath}/${ep.slug}`}
              className="v2-card v2-card--interactive flex-1 p-4"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-semibold tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
                    {ep.title}
                  </div>
                  {ep.subtitle && (
                    <p className="text-[12.5px] mt-1 line-clamp-2" style={{ color: "hsl(var(--v2-text-dim))" }}>
                      {ep.subtitle}
                    </p>
                  )}
                </div>
                {meta && (
                  <span
                    className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded shrink-0 inline-flex items-center gap-1"
                    style={{
                      background: `${meta.color}1f`,
                      color: meta.color,
                      border: `1px solid ${meta.color}55`,
                    }}
                  >
                    {meta.emoji} {meta.label}
                  </span>
                )}
              </div>
            </Link>
          </li>
        );
      })}
    </ol>
  );
}

function KanbanView({
  episodes,
  basePath,
}: {
  episodes: EpisodePreview[];
  basePath: string;
}) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scroll-x-contained">
      {PRODUCTION_ORDER.map((key) => {
        const meta = PRODUCTION_STATUS_META[key];
        const items = episodes.filter((e) => (e.production_status ?? "da_registrare") === key);
        return (
          <div
            key={key}
            className="v2-card w-[300px] shrink-0 flex flex-col"
            style={{ padding: "12px" }}
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ background: meta.color }} />
                <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text))" }}>
                  {meta.emoji} {meta.label}
                </span>
              </div>
              <span
                className="v2-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                style={{ background: "hsl(var(--v2-border))", color: "hsl(var(--v2-text-dim))" }}
              >
                {items.length}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {items.map((ep) => {
                const intensityMeta = ep.intensity ? INTENSITY_META[ep.intensity] : null;
                return (
                  <Link
                    key={ep.slug}
                    href={`${basePath}/${ep.slug}`}
                    className="block rounded-lg p-3 transition-colors"
                    style={{
                      background: "hsl(var(--v2-bg-elev))",
                      border: "1px solid hsl(var(--v2-border))",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      {ep.numero !== null && (
                        <span className="v2-mono text-[11px] font-bold shrink-0" style={{ color: "hsl(var(--v2-accent))" }}>
                          {String(ep.numero).padStart(2, "0")}
                        </span>
                      )}
                      <span className="text-[12.5px] font-medium truncate flex-1" style={{ color: "hsl(var(--v2-text))" }}>
                        {ep.title}
                      </span>
                      {intensityMeta && (
                        <span className="shrink-0" title={intensityMeta.label}>
                          {intensityMeta.emoji}
                        </span>
                      )}
                    </div>
                    {ep.subtitle && (
                      <p className="text-[11px] mt-1 line-clamp-2" style={{ color: "hsl(var(--v2-text-dim))" }}>
                        {ep.subtitle}
                      </p>
                    )}
                    {typeof ep.guests_count === "number" && ep.guests_count > 0 && (
                      <div className="v2-mono text-[10px] mt-1.5 uppercase tracking-[0.1em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                        {ep.guests_count} {ep.guests_count === 1 ? "ospite" : "ospiti"}
                      </div>
                    )}
                  </Link>
                );
              })}
              {items.length === 0 && (
                <div
                  className="v2-mono text-[10px] text-center py-4 rounded-md"
                  style={{
                    color: "hsl(var(--v2-text-mute))",
                    border: "1px dashed hsl(var(--v2-border))",
                  }}
                >
                  Nessun episodio
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
