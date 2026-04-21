"use client";

import { useState, useMemo } from "react";
import { toast } from "sonner";
import { Plus, Archive } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createQuestion, updateQuestion } from "@/actions/podcast-question";
import {
  QUESTION_THEMES,
  QUESTION_THEME_LABEL,
  QUESTION_PHASES,
  type QuestionPhase,
  type QuestionTheme,
} from "@/lib/podcast-config";
import type { PodcastQuestion } from "@/lib/types";

export function QuestionBank({ questions }: { questions: PodcastQuestion[] }) {
  const [activeTheme, setActiveTheme] = useState<QuestionTheme>("margini");
  const [q, setQ] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return questions.filter(
      (x) => x.theme === activeTheme && (!needle || x.body.toLowerCase().includes(needle)),
    );
  }, [questions, activeTheme, q]);

  const byPhase = (p: QuestionPhase) => filtered.filter((x) => x.phase === p);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-2xl tracking-wide">Banca domande</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nuova domanda
        </button>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUESTION_THEMES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTheme(t)}
            className={`px-3 h-8 rounded-full text-xs font-semibold ${
              activeTheme === t
                ? "bg-primary text-primary-foreground"
                : "bg-white/5 text-muted-foreground"
            }`}
          >
            {QUESTION_THEME_LABEL[t]}
          </button>
        ))}
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca nel testo delle domande…"
        className="w-full bg-white/5 rounded-lg px-4 py-2 text-sm outline-none border border-white/10"
      />

      <div className="grid md:grid-cols-2 gap-4">
        {QUESTION_PHASES.map((phase) => (
          <div key={phase} className="liquid-glass rounded-2xl p-4 space-y-2">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground">
              {phase}
            </h2>
            <div className="space-y-1">
              {byPhase(phase).map((qn) => (
                <div key={qn.id} className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">•</span>
                  <span className="flex-1">{qn.body}</span>
                  <button
                    onClick={async () => {
                      const r = await updateQuestion({
                        id: qn.id,
                        patch: { archived: true },
                      });
                      if (!r.ok) toast.error(r.error ?? "Errore");
                      else toast.success("Archiviata");
                    }}
                    className="text-muted-foreground hover:text-destructive"
                    title="Archivia"
                  >
                    <Archive className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {byPhase(phase).length === 0 && (
                <div className="text-xs text-muted-foreground italic">Nessuna domanda.</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <AddQuestionDialog
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultTheme={activeTheme}
      />
    </div>
  );
}

function AddQuestionDialog({
  open,
  onOpenChange,
  defaultTheme,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultTheme: QuestionTheme;
}) {
  const [theme, setTheme] = useState<QuestionTheme>(defaultTheme);
  const [phase, setPhase] = useState<QuestionPhase>("approfondimento");
  const [body, setBody] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    const r = await createQuestion({ theme, phase, body: body.trim() });
    if (!r.ok) {
      toast.error(r.error ?? "Errore");
      return;
    }
    toast.success("Domanda creata");
    setBody("");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Nuova domanda</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as QuestionTheme)}
              className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
            >
              {QUESTION_THEMES.map((t) => (
                <option key={t} value={t}>
                  {QUESTION_THEME_LABEL[t]}
                </option>
              ))}
            </select>
            <select
              value={phase}
              onChange={(e) => setPhase(e.target.value as QuestionPhase)}
              className="bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
            >
              {QUESTION_PHASES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={4}
            placeholder="Testo della domanda…"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <div className="flex justify-end gap-2 pt-2">
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
              Crea
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
