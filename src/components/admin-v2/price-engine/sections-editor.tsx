"use client";

import { useState, useTransition } from "react";
import { Check, AlertTriangle, Save } from "lucide-react";
import { replaceRemoSections } from "@/actions/remo";
import type { RemoSection } from "@/lib/remo/types";
import { cn } from "@/lib/utils";

type SaveState =
  | { kind: "idle" }
  | { kind: "ok"; count: number }
  | { kind: "error"; error: string };

export function SectionsEditor({
  reportId,
  initialJson,
  sectionsPreview,
}: {
  reportId: string;
  initialJson: string;
  sectionsPreview: RemoSection[];
}) {
  const [json, setJson] = useState(initialJson);
  const [state, setState] = useState<SaveState>({ kind: "idle" });
  const [pending, startTransition] = useTransition();

  function save() {
    setState({ kind: "idle" });
    startTransition(async () => {
      const res = await replaceRemoSections(reportId, json);
      if (res.ok) {
        setState({ kind: "ok", count: res.data.count });
      } else {
        setState({ kind: "error", error: res.error });
      }
    });
  }

  const dirty = json.trim() !== initialJson.trim();

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      <div className="lg:col-span-3 dispaccio-card rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold">Sezioni JSON</h2>
            <p className="text-[11px] text-muted-foreground">
              Array di oggetti{" "}
              <code className="rounded bg-white/10 px-1 py-0.5 text-[10px]">
                {`{order_index, slug, group_slug, group_label, type, title, ...}`}
              </code>
            </p>
          </div>
          <button
            type="button"
            onClick={save}
            disabled={pending || !dirty}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
              pending || !dirty
                ? "bg-white/5 text-muted-foreground cursor-not-allowed"
                : "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30 hover:shadow-lg",
            )}
          >
            <Save className="h-3.5 w-3.5" />
            {pending ? "Salvo…" : "Sostituisci sezioni"}
          </button>
        </div>

        <textarea
          value={json}
          onChange={(e) => {
            setJson(e.target.value);
            if (state.kind !== "idle") setState({ kind: "idle" });
          }}
          spellCheck={false}
          className="flex-1 min-h-[520px] rounded-lg border border-white/10 bg-black/30 p-3 font-mono text-[11px] leading-relaxed text-foreground/90 outline-none focus:border-primary/40"
          placeholder="[]"
        />

        {state.kind === "ok" && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200 flex items-center gap-2">
            <Check className="h-3.5 w-3.5" />
            Salvato. {state.count} sezion{state.count === 1 ? "e" : "i"}{" "}
            aggiornat{state.count === 1 ? "a" : "e"}.
          </div>
        )}

        {state.kind === "error" && (
          <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200 flex items-center gap-2">
            <AlertTriangle className="h-3.5 w-3.5" />
            {state.error}
          </div>
        )}
      </div>

      <aside className="lg:col-span-2 dispaccio-card rounded-2xl p-4 space-y-3 self-start sticky top-24">
        <h2 className="text-sm font-bold">Anteprima sezioni</h2>
        {sectionsPreview.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Nessuna sezione. Incolla JSON nel box di sinistra e salva.
          </p>
        ) : (
          <ol className="space-y-1.5 text-xs">
            {sectionsPreview.map((s) => (
              <li
                key={s.id}
                className="flex items-start gap-2 rounded-lg border border-white/5 bg-white/[0.02] px-2.5 py-1.5"
              >
                <span className="text-[10px] font-mono text-muted-foreground/70 pt-0.5">
                  {s.order_index}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground truncate">
                    {s.title}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {s.group_label} · {s.type}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </aside>
    </div>
  );
}
