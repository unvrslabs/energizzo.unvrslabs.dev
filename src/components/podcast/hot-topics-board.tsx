"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Plus, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createHotTopic, updateHotTopic } from "@/actions/podcast-hot-topic";
import {
  HOT_TOPIC_INTENSITIES,
  HOT_TOPIC_INTENSITY_CONFIG,
  type HotTopicIntensity,
} from "@/lib/podcast-config";
import type { PodcastHotTopic } from "@/lib/types";

export function HotTopicsBoard({ topics }: { topics: PodcastHotTopic[] }) {
  const [addOpen, setAddOpen] = useState(false);
  const [editing, setEditing] = useState<PodcastHotTopic | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="font-display text-2xl tracking-wide">Temi caldi</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nuovo tema
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {HOT_TOPIC_INTENSITIES.map((intensity) => {
          const list = topics.filter((t) => t.intensity === intensity);
          const cfg = HOT_TOPIC_INTENSITY_CONFIG[intensity];
          return (
            <div key={intensity} className="space-y-3">
              <div className="text-sm font-semibold">
                {cfg.emoji} {cfg.label} · {list.length}
              </div>
              {list.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setEditing(t)}
                  className="block w-full text-left liquid-glass rounded-2xl p-4 hover:bg-white/5 transition-colors"
                >
                  <div className="text-sm font-semibold">{t.title}</div>
                  {t.body && (
                    <div className="text-xs text-muted-foreground mt-1 line-clamp-3">{t.body}</div>
                  )}
                  {t.suggested_questions.length > 0 && (
                    <div className="mt-2 text-[10px] uppercase tracking-wider text-muted-foreground">
                      {t.suggested_questions.length} domande suggerite
                    </div>
                  )}
                </button>
              ))}
              {list.length === 0 && (
                <div className="text-xs text-muted-foreground italic p-4">Nessun tema.</div>
              )}
            </div>
          );
        })}
      </div>

      <TopicDialog open={addOpen} onOpenChange={setAddOpen} initial={null} />
      <TopicDialog
        open={!!editing}
        onOpenChange={(v) => !v && setEditing(null)}
        initial={editing}
      />
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
        <form onSubmit={submit} className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titolo"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <select
            value={intensity}
            onChange={(e) => setIntensity(e.target.value as HotTopicIntensity)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
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
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <textarea
            value={suggested}
            onChange={(e) => setSuggested(e.target.value)}
            rows={4}
            placeholder="Domande suggerite, una per riga…"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <div className="flex justify-between pt-2">
            {initial && (
              <button
                type="button"
                onClick={archive}
                className="inline-flex items-center gap-1.5 text-xs text-destructive"
              >
                <Archive className="h-3 w-3" /> Archivia
              </button>
            )}
            <div className="ml-auto flex gap-2">
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="px-4 h-9 rounded-full text-sm bg-white/5"
              >
                Annulla
              </button>
              <button
                type="submit"
                className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
              >
                Salva
              </button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
