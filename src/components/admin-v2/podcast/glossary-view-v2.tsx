"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { upsertTerm, updateTerm, deleteTerm } from "@/actions/podcast-glossary";
import {
  GLOSSARY_CATEGORIES,
  GLOSSARY_CATEGORY_LABEL,
  type GlossaryCategory,
} from "@/lib/podcast-config";
import type { PodcastGlossaryTerm } from "@/lib/types";

export function GlossaryViewV2({ terms }: { terms: PodcastGlossaryTerm[] }) {
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
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Knowledge · glossario operativo
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            {terms.length} termini
          </h1>
        </div>
        <button onClick={() => setAddOpen(true)} className="v2-btn v2-btn--primary">
          <Plus className="w-3.5 h-3.5" />
          Nuovo termine
        </button>
      </header>

      <div className="v2-card p-3 flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cerca termine o definizione…"
            className="v2-input"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2" style={{ color: "hsl(var(--v2-text-mute))" }}>
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
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
                className="px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors"
                style={{
                  background: on ? "hsl(var(--v2-accent) / 0.14)" : "hsl(var(--v2-bg-elev))",
                  color: on ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-dim))",
                  border: `1px solid ${on ? "hsl(var(--v2-accent) / 0.35)" : "hsl(var(--v2-border))"}`,
                }}
              >
                {GLOSSARY_CATEGORY_LABEL[c]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid md:grid-cols-[320px_1fr] gap-4">
        {/* Lista */}
        <div className="v2-card overflow-y-auto" style={{ maxHeight: "65vh" }}>
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-[12.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessun termine.
            </div>
          ) : (
            <ul>
              {filtered.map((t) => {
                const active = selectedId === t.id;
                return (
                  <li key={t.id}>
                    <button
                      onClick={() => setSelectedId(t.id)}
                      className="w-full text-left px-3 py-2.5 transition-colors"
                      style={{
                        background: active ? "hsl(var(--v2-accent) / 0.08)" : "transparent",
                        borderLeft: active ? "2px solid hsl(var(--v2-accent))" : "2px solid transparent",
                        borderBottom: "1px solid hsl(var(--v2-border))",
                      }}
                    >
                      <div className="text-[13px] font-semibold" style={{ color: active ? "hsl(var(--v2-text))" : "hsl(var(--v2-text))" }}>
                        {t.term}
                      </div>
                      <div className="v2-mono text-[10px] uppercase tracking-[0.14em] mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
                        {GLOSSARY_CATEGORY_LABEL[t.category]}
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Detail */}
        <div className="v2-card p-5">
          {selected ? (
            <>
              <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
                    {selected.term}
                  </h2>
                  <div className="v2-mono text-[10px] uppercase tracking-[0.14em] mt-1" style={{ color: "hsl(var(--v2-accent))" }}>
                    {GLOSSARY_CATEGORY_LABEL[selected.category]}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditOpen(true)} className="v2-btn">
                    <Pencil className="w-3.5 h-3.5" />
                    Modifica
                  </button>
                  <button
                    onClick={async () => {
                      if (!confirm(`Eliminare "${selected.term}"?`)) return;
                      const r = await deleteTerm({ id: selected.id });
                      if (!r.ok) toast.error(r.error ?? "Errore");
                      else toast.success("Eliminato");
                    }}
                    className="v2-btn"
                    style={{ color: "hsl(var(--v2-danger))" }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="text-[14px] leading-relaxed whitespace-pre-wrap" style={{ color: "hsl(var(--v2-text))" }}>
                {selected.definition}
              </div>
            </>
          ) : (
            <div className="text-[13px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Seleziona un termine per vedere la definizione.
            </div>
          )}
        </div>
      </div>

      <TermDialog open={addOpen} onOpenChange={setAddOpen} initial={null} />
      {selected && <TermDialog open={editOpen} onOpenChange={setEditOpen} initial={selected} />}
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
        <form onSubmit={submit} className="flex flex-col gap-3">
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Termine (es. TIVG)"
            className="rounded-md px-3 py-2 text-[13px] outline-none"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-text))",
            }}
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as GlossaryCategory)}
            className="rounded-md px-3 py-2 text-[13px] outline-none"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-text))",
            }}
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
            className="rounded-md px-3 py-2 text-[13px] outline-none resize-y"
            style={{
              background: "hsl(var(--v2-bg-elev))",
              border: "1px solid hsl(var(--v2-border))",
              color: "hsl(var(--v2-text))",
              fontFamily: "inherit",
            }}
          />
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => onOpenChange(false)} className="v2-btn">
              Annulla
            </button>
            <button type="submit" className="v2-btn v2-btn--primary">
              Salva
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
