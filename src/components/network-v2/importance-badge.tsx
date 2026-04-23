import { AlertTriangle, Sparkles, Zap } from "lucide-react";
import type { Importanza, HeuristicTag } from "@/components/network-v2/delibere-v2-client";

export function ImportanceBadge({
  importanza,
  categoriaImpatto,
  heuristicTag,
  size = "sm",
}: {
  importanza: Importanza | null;
  categoriaImpatto: string | null;
  heuristicTag: HeuristicTag;
  size?: "sm" | "md";
}) {
  // Priorità: AI > euristica. Se AI normale/bassa, non mostrare badge.
  if (importanza === "critica" || importanza === "alta") {
    const label =
      importanza === "critica"
        ? categoriaImpatto ?? "Cambio tariffario"
        : categoriaImpatto ?? "Cambio operativo";
    const color =
      importanza === "critica"
        ? {
            fg: "hsl(var(--v2-danger))",
            bg: "hsl(var(--v2-danger) / 0.1)",
            border: "hsl(var(--v2-danger) / 0.35)",
          }
        : {
            fg: "hsl(var(--v2-warn))",
            bg: "hsl(var(--v2-warn) / 0.1)",
            border: "hsl(var(--v2-warn) / 0.35)",
          };
    return (
      <span
        className="v2-mono inline-flex items-center gap-1 font-bold uppercase rounded"
        style={{
          fontSize: size === "md" ? "10.5px" : "9.5px",
          letterSpacing: "0.14em",
          padding: size === "md" ? "3px 8px" : "2px 6px",
          color: color.fg,
          background: color.bg,
          border: `1px solid ${color.border}`,
          lineHeight: 1.2,
        }}
      >
        {importanza === "critica" ? (
          <AlertTriangle className="w-2.5 h-2.5" />
        ) : (
          <Zap className="w-2.5 h-2.5" />
        )}
        {label}
      </span>
    );
  }

  // Heuristic fallback (solo per delibere non ancora analizzate dall'AI)
  if (!importanza && heuristicTag) {
    const label =
      heuristicTag === "possibile_tariffario"
        ? "Possibile cambio tariffario"
        : "Possibile cambio operativo";
    return (
      <span
        className="v2-mono inline-flex items-center gap-1 font-semibold uppercase rounded"
        title="Classificazione automatica su titolo. Clicca 'Genera sommario AI' per conferma."
        style={{
          fontSize: size === "md" ? "10px" : "9px",
          letterSpacing: "0.12em",
          padding: size === "md" ? "3px 7px" : "2px 6px",
          color: "hsl(var(--v2-warn))",
          background: "hsl(var(--v2-warn) / 0.06)",
          border: "1px solid hsl(var(--v2-warn) / 0.25)",
          lineHeight: 1.2,
          borderStyle: "dashed",
        }}
      >
        <Sparkles className="w-2.5 h-2.5" />
        {label}
      </span>
    );
  }

  return null;
}
