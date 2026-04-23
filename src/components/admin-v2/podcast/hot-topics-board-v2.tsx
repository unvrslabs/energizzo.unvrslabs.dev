"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Archive, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createHotTopic, updateHotTopic } from "@/actions/podcast-hot-topic";
import {
  HOT_TOPIC_INTENSITIES,
  HOT_TOPIC_INTENSITY_CONFIG,
  type HotTopicIntensity,
} from "@/lib/podcast-config";
import type { PodcastHotTopic } from "@/lib/types";

const INTENSITY_COLOR: Record<HotTopicIntensity, string> = {
  bollente: "hsl(24 90% 62%)",
  medio: "hsl(var(--v2-warn))",
  freddo: "hsl(var(--v2-info))",
};

export function HotTopicsBoardV2({ topics }: { topics: PodcastHotTopic[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PodcastHotTopic | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Editoriale · radar tematico
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            {topics.length} temi attivi
          </h1>
        </div>
        <button onClick={() => setAddOpen(true)} className="v2-btn v2-btn--primary">
          <Plus className="w-3.5 h-3.5" />
          Nuovo tema
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        {HOT_TOPIC_INTENSITIES.map((intensity) => {
          const list = topics.filter((t) => t.intensity === intensity);
          const cfg = HOT_TOPIC_INTENSITY_CONFIG[intensity];
          const color = INTENSITY_COLOR[intensity];
          return (
            <div key={intensity} className="flex flex-col gap-2">
              <div className="flex items-center gap-2 px-1 py-1">
                <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text))" }}>
                  {cfg.emoji} {cfg.label}
                </span>
                <span
                  className="v2-mono text-[10px] font-bold px-1.5 py-0.5 rounded ml-auto"
                  style={{
                    background: `${color}1a`,
                    color,
                    border: `1px solid ${color}44`,
                  }}
                >
                  {list.length}
                </span>
              </div>
              {list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEditing(t)}
                  className="v2-card v2-card--interactive p-4 text-left"
                >
                  <div className="text-[13.5px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
                    {t.title}
                  </div>
                  {t.body && (
                    <div className="text-[12px] mt-1.5 line-clamp-3 leading-relaxed" style={{ color: "hsl(var(--v2-text-dim))" }}>
                      {t.body}
                    </div>
                  )}
                  {t.suggested_questions.length > 0 && (
                    <div className="v2-mono text-[10px] uppercase tracking-[0.14em] mt-2" style={{ color: color }}>
                      {t.suggested_questions.length} domande suggerite
                    </div>
                  )}
                </button>
              ))}
              {list.length === 0 && (
                <div
                  className="v2-mono text-[10px] text-center py-6 rounded-md"
                  style={{
                    color: "hsl(var(--v2-text-mute))",
                    border: "1px dashed hsl(var(--v2-border))",
                  }}
                >
                  Nessun tema
                </div>
              )}
            </div>
          );
        })}
      </div>

      <TopicDialog open={addOpen} onOpenChange={setAddOpen} initial={null} />
      <TopicDialog open={!!editing} onOpenChange={(v) => !v && setEditing(null)} initial={editing} />
    </div>
  );
}

function TopicDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PodcastHotTopic | null;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [intensity, setIntensity] = useState<HotTopicIntensity>(initial?.intensity ?? "medio");
  const [suggested, setSuggested] = useState(initial?.suggested_questions.join("\n") ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const suggestedArr = suggested
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);
    if (initial) {
      const r = await updateHotTopic({
        id: initial.id,
        patch: {
          title: title.trim(),
          body: body || null,
          intensity,
          suggested_questions: suggestedArr,
        },
      });
      if (!r.ok) toast.error(r.error ?? "Errore");
      else toast.success("Aggiornato");
    } else {
      const r = await createHotTopic({
        title: title.trim(),
        body: body || null,
        intensity,
        suggested_questions: suggestedArr,
      });
      if (!r.ok) toast.error(r.error ?? "Errore");
      else toast.success("Creato");
    }
    onOpenChange(false);
  }

  async function archive() {
    if (!initial) return;
    const r = await updateHotTopic({ id: initial.id, patch: { active: false } });
    if (!r.ok) toast.error(r.error ?? "Errore");
    else {
      toast.success("Archiviato");
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifica tema" : "Nuovo tema"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo"
            className="rounded-md px-3 py-2 text-[13px] outline-none"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-text))",
            }}
          />
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as HotTopicIntensity)}
            className="rounded-md px-3 py-2 text-[13px] outline-none"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-text))",
            }}
          >
            {HOT_TOPIC_INTENSITIES.map((i) => (
              <option key={i} value={i}>
                {HOT_TOPIC_INTENSITY_CONFIG[i].emoji} {HOT_TOPIC_INTENSITY_CONFIG[i].label}
              </option>
            ))}
          </select>
          <textarea
            value={body ?? ""}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Descrizione…"
            className="rounded-md px-3 py-2 text-[13px] outline-none resize-y"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-text))",
              fontFamily: "inherit",
            }}
          />
          <textarea
            value={suggested}
            onChange={(e) => setSuggested(e.target.value)}
            rows={4}
            placeholder="Domande suggerite, una per riga…"
            className="rounded-md px-3 py-2 text-[13px] outline-none resize-y"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-text))",
              fontFamily: "inherit",
            }}
          />
          <div className="flex justify-between pt-2">
            {initial && (
              <button
                type="button"
                onClick={archive}
                className="v2-btn"
                style={{ color: "hsl(var(--v2-danger))" }}
              >
                <Archive className="w-3.5 h-3.5" />
                Archivia
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button type="button" onClick={() => onOpenChange(false)} className="v2-btn">
                Annulla
              </button>
              <button type="submit" className="v2-btn v2-btn--primary">
                Salva
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
