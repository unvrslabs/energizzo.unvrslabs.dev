"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { upsertTerm, updateTerm, deleteTerm } from "@/actions/podcast-glossary";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_CATEGORY_LABEL,
  type GlossaryCategory,
} from "@/lib/podcast-config";
import type { PodcastGlossaryTerm } from "@/lib/types";

export function GlossaryView({ terms }: { terms: PodcastGlossaryTerm[] }) {
  const [q, setQ] = useState("");
  const [cats, setCats] = useState<Set<GlossaryCategory>>(new Set());
  const [selectedId, setSelectedId] = useState<string | null>(terms[0]?.id ?? null);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return terms.filter((t) => {
      if (cats.size > 0 && !cats.has(t.category)) return false;
      if (!needle) return true;
      return t.term.toLowerCase().includes(needle) || t.definition.toLowerCase().includes(needle);
    });
  }, [terms, q, cats]);

  const selected = terms.find((t) => t.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-2xl tracking-wide">Glossario</h1>
        <button
          onClick={() => setAddOpen(true)}
          className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary text-primary-foreground"
        >
          <Plus className="h-4 w-4" /> Nuovo
        </button>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Cerca termine o definizione…"
        className="w-full bg-white/5 rounded-lg px-4 py-3 text-lg outline-none border border-white/10"
      />

      <div className="flex flex-wrap gap-2">
        {GLOSSARY_CATEGORIES.map((c) => {
          const on = cats.has(c);
          return (
            <button
              key={c}
              onClick={() =>
                setCats((p) => {
                  const n = new Set(p);
                  if (on) n.delete(c);
                  else n.add(c);
                  return n;
                })
              }
              className={`px-3 h-7 rounded-full text-xs ${
                on ? "bg-primary/20 text-primary" : "bg-white/5 text-muted-foreground"
              }`}
            >
              {GLOSSARY_CATEGORY_LABEL[c]}
            </button>
          );
        })}
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4">
        <div className="liquid-glass rounded-2xl p-2 max-h-[60vh] overflow-auto">
          {filtered.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                selectedId === t.id ? "bg-primary/20 text-primary" : "hover:bg-white/5"
              }`}
            >
              <div className="font-semibold">{t.term}</div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                {GLOSSARY_CATEGORY_LABEL[t.category]}
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-sm text-muted-foreground text-center py-6">Nessun termine.</div>
          )}
        </div>

        <div className="liquid-glass rounded-2xl p-5">
          {selected ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-xl">{selected.term}</h2>
                <div className="flex gap-2">
                  <button onClick={() => setEditOpen(true)} className="text-xs text-primary">
                    Modifica
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Eliminare "${selected.term}"?`)) return;
                      const r = await deleteTerm({ id: selected.id });
                      if (!r.ok) toast.error(r.error ?? "Errore");
                      else toast.success("Eliminato");
                    }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                {GLOSSARY_CATEGORY_LABEL[selected.category]}
              </div>
              <div className="text-sm whitespace-pre-wrap">{selected.definition}</div>
            </>
          ) : (
            <div className="text-sm text-muted-foreground">Seleziona un termine.</div>
          )}
        </div>
      </div>

      <TermDialog open={addOpen} onOpenChange={setAddOpen} initial={null} />
      {selected && (
        <TermDialog open={editOpen} onOpenChange={setEditOpen} initial={selected} />
      )}
    </div>
  );
}

function TermDialog({
  open,
  onOpenChange,
  initial,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial: PodcastGlossaryTerm | null;
}) {
  const [term, setTerm] = useState(initial?.term ?? "");
  const [category, setCategory] = useState<GlossaryCategory>(initial?.category ?? "regolatore");
  const [definition, setDefinition] = useState(initial?.definition ?? "");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!term.trim() || !definition.trim()) return;
    const r = initial
      ? await updateTerm({
          id: initial.id,
          patch: { term: term.trim(), category, definition: definition.trim() },
        })
      : await upsertTerm({ term: term.trim(), category, definition: definition.trim() });
    if (!r.ok) {
      toast.error(r.error ?? "Errore");
      return;
    }
    toast.success(initial ? "Aggiornato" : "Creato");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? "Modifica termine" : "Nuovo termine"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Termine (es. TIVG)"
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GlossaryCategory)}
            className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm border border-white/10"
          >
            {GLOSSARY_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {GLOSSARY_CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
          <textarea
            value={definition}
            onChange={(e) => setDefinition(e.target.value)}
            rows={5}
            placeholder="Definizione…"
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
              Salva
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
