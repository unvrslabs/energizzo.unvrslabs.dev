"use client";

import { useState } from "react";
import Link from "next/link";
import { LayoutGrid, ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";
import type { EpisodePreview } from "@/lib/podcast-content";

const INTENSITY_META: Record<string, { label: string; emoji: string; color: string }> = {
  bollente: { label: "Bollente", emoji: "🔥", color: "#f97316" },
  medio: { label: "Media intensità", emoji: "🌡️", color: "#eab308" },
  freddo: { label: "Freddo", emoji: "❄️", color: "#38bdf8" },
};

const PRODUCTION_STATUS_META: Record<
  "da_registrare" | "registrata" | "pubblicata",
  { label: string; emoji: string; color: string }
> = {
  da_registrare: { label: "Da registrare", emoji: "📝", color: "#64748b" },
  registrata: { label: "Registrata", emoji: "🎙️", color: "#a78bfa" },
  pubblicata: { label: "Pubblicata", emoji: "🚀", color: "#22c55e" },
};

const PRODUCTION_ORDER = ["da_registrare", "registrata", "pubblicata"] as const;

type Props = { episodes: EpisodePreview[] };

export function EpisodesBoard({ episodes }: Props) {
  const [view, setView] = useState<"timeline" | "kanban">("timeline");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl tracking-wide">Episodi preparati</h1>
          <p className="text-sm text-muted-foreground mt-1">
            10 puntate pre-scritte, una per tema caldo. Ogni episodio: 15 domande con
            risposte attese e argomenti collegati.
          </p>
        </div>
        <div className="flex rounded-full border border-white/10 p-0.5">
          {(
            [
              { v: "timeline", label: "Timeline", icon: ListOrdered },
              { v: "kanban", label: "Kanban", icon: LayoutGrid },
            ] as const
          ).map((opt) => (
            <button
              key={opt.v}
              onClick={() => setView(opt.v)}
              className={cn(
                "inline-flex items-center gap-1.5 px-3 h-8 rounded-full text-xs font-semibold",
                view === opt.v
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <opt.icon className="h-3.5 w-3.5" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {episodes.length === 0 ? (
        <div className="liquid-glass rounded-2xl p-6 text-sm text-muted-foreground">
          Nessun episodio caricato.
        </div>
      ) : view === "timeline" ? (
        <TimelineView episodes={episodes} />
      ) : (
        <KanbanView episodes={episodes} />
      )}
    </div>
  );
}

function TimelineView({ episodes }: Props) {
  return (
    <ol className="relative space-y-4 before:absolute before:left-5 before:top-2 before:bottom-2 before:w-px before:bg-white/10">
      {episodes.map((ep) => {
        const meta = ep.intensity ? INTENSITY_META[ep.intensity] : null;
        return (
          <li key={ep.slug} className="relative flex gap-4 items-stretch">
            <div
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-primary/40 bg-[hsl(215_35%_14%)] font-display text-sm font-black text-primary"
              aria-hidden
            >
              {ep.numero !== null ? String(ep.numero).padStart(2, "0") : "·"}
            </div>
            <Link
              href={`/dashboard/podcast/episodi/${ep.slug}`}
              className="liquid-glass rounded-2xl p-4 flex-1 hover:bg-white/5 transition-colors"
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="font-display text-lg tracking-wide">{ep.title}</div>
                  {ep.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {ep.subtitle}
                    </p>
                  )}
                </div>
                {meta && (
                  <span
                    className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold shrink-0"
                    style={{
                      backgroundColor: `${meta.color}20`,
                      color: meta.color,
                      border: `1px solid ${meta.color}50`,
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

function KanbanView({ episodes }: Props) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-4 scroll-x-contained">
      {PRODUCTION_ORDER.map((key) => {
        const meta = PRODUCTION_STATUS_META[key];
        const items = episodes.filter((e) => (e.production_status ?? "da_registrare") === key);
        return (
          <div
            key={key}
            className="glass rounded-lg p-3 w-[320px] shrink-0 flex flex-col"
          >
            <div className="flex items-center justify-between mb-3 px-1">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: meta.color }}
              >
                {meta.emoji} {meta.label}
              </span>
              <span className="text-xs text-muted-foreground">{items.length}</span>
            </div>
            <div className="space-y-2">
              {items.map((ep) => {
                const intensityMeta = ep.intensity ? INTENSITY_META[ep.intensity] : null;
                return (
                  <Link
                    key={ep.slug}
                    href={`/dashboard/podcast/episodi/${ep.slug}`}
                    className="block rounded-lg bg-white/5 p-3 text-sm hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {ep.numero !== null && (
                        <span className="font-display text-xs font-black text-primary shrink-0">
                          {String(ep.numero).padStart(2, "0")}
                        </span>
                      )}
                      <span className="font-semibold truncate flex-1">{ep.title}</span>
                      {intensityMeta && (
                        <span className="text-xs shrink-0" title={intensityMeta.label}>
                          {intensityMeta.emoji}
                        </span>
                      )}
                    </div>
                    {ep.subtitle && (
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2">
                        {ep.subtitle}
                      </p>
                    )}
                    {typeof ep.guests_count === "number" && ep.guests_count > 0 && (
                      <div className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                        {ep.guests_count} {ep.guests_count === 1 ? "ospite" : "ospiti"}
                      </div>
                    )}
                  </Link>
                );
              })}
              {items.length === 0 && (
                <div className="text-xs text-muted-foreground italic p-2">
                  Nessun episodio.
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
