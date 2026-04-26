"use client";

import { useMemo, useState, useEffect, useTransition } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Download,
  ExternalLink,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  Loader2,
  MessageSquare,
  Search,
  Sparkles,
  X,
  AlertTriangle,
} from "lucide-react";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import { ImportanceBadge } from "@/components/network-v2/importance-badge";
import { DeliberaRowRich } from "@/components/network-v2/delibera-row-rich";
import { cn } from "@/lib/utils";

export type UiSector = "eel" | "gas";

export type UiAttachment = {
  label: string;
  url: string;
  kind: "pdf" | "xlsx" | "docx" | "zip" | "other";
};

export type Importanza = "critica" | "alta" | "normale" | "bassa";
export type HeuristicTag = "possibile_tariffario" | "possibile_operativo" | null;

export type DeliberaView = {
  id: number;
  code: string;
  title: string;
  date: string | null;
  sectors: UiSector[];
  settoreLabel: string | null;
  tipo: string | null;
  summary: string | null;
  bullets: string[] | null;
  attachments: UiAttachment[];
  url: string | null;
  hasSummary: boolean;
  aiError: string | null;
  aiSource: "pdf" | "url" | null;
  aiGeneratedAt: string | null;
  importanza: Importanza | null;
  categoriaImpatto: string | null;
  heuristicTag: HeuristicTag;
};

const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtShort(iso: string | null) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "—";
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]}`;
}
function fmtFull(iso: string | null) {
  if (!iso) return "data n/d";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "data n/d";
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function attachmentIcon(kind: UiAttachment["kind"]) {
  switch (kind) {
    case "xlsx":
      return <FileSpreadsheet className="w-3.5 h-3.5" style={{ color: "hsl(158 64% 62%)" }} />;
    case "zip":
      return <FileArchive className="w-3.5 h-3.5" style={{ color: "hsl(38 92% 65%)" }} />;
    case "docx":
      return <FileCode className="w-3.5 h-3.5" style={{ color: "hsl(200 70% 65%)" }} />;
    default:
      return <FileText className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />;
  }
}

type SectorFilter = "all" | "eel" | "gas" | "dual";

/**
 * Matching mutuamente esclusivo: le categorie sommano sempre al totale.
 * - "eel"  → solo elettrico (non dual)
 * - "gas"  → solo gas (non dual)
 * - "dual" → impatta entrambi i vettori
 */
function matchesSectorFilter(sectors: UiSector[], f: SectorFilter): boolean {
  if (f === "all") return true;
  const hasEel = sectors.includes("eel");
  const hasGas = sectors.includes("gas");
  if (f === "dual") return hasEel && hasGas;
  if (f === "eel") return hasEel && !hasGas;
  if (f === "gas") return hasGas && !hasEel;
  return false;
}

export function DelibereV2Client({
  delibere,
  initialCode,
}: {
  delibere: DeliberaView[];
  initialCode?: string;
}) {
  const [items, setItems] = useState<DeliberaView[]>(delibere);

  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<SectorFilter>("all");
  const [selectedCode, setSelectedCode] = useState<string>(
    items.length > 0
      ? initialCode && items.find((d) => d.code === initialCode)
        ? initialCode
        : items[0].code
      : "",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((d) => {
      if (!matchesSectorFilter(d.sectors, sector)) return false;
      if (q) {
        const hay = [
          d.title,
          d.code,
          d.summary ?? "",
          (d.bullets ?? []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, sector]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((d) => d.code === selectedCode)) {
      setSelectedCode(filtered[0].code);
    }
  }, [filtered, selectedCode]);

  const selected = filtered.find((d) => d.code === selectedCode) ?? filtered[0] ?? items[0];

  function handleSummaryUpdated(updated: DeliberaView) {
    setItems((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  if (items.length === 0) {
    return (
      <div className="v2-card p-10 text-center">
        <p className="text-sm" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Nessuna delibera sincronizzata. Un admin può lanciare il sync da <code>POST /api/admin/delibere/sync</code>.
        </p>
      </div>
    );
  }

  // Altezza card allineata al bordo inferiore della sidebar.
  // Sidebar: bottom 16px. Content: padding-top 28px + header ~80px + margin ~16px = ~124px.
  // maxHeight = 100vh - (offset top ~144px) - (spazio fino a bottom sidebar 16px) ≈ 100vh - 160px.
  // Row height fissa 96px → niente tagli parziali, scroll interno se contenuto supera l'altezza.
  const listMaxHeight = "calc(100vh - 160px)";

  return (
    <div
      className="v2-card overflow-hidden grid"
      style={{
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.35fr)",
      }}
    >
      {/* LIST */}
      <div
        className="flex flex-col min-h-0"
        style={{
          borderRight: "1px solid hsl(var(--v2-border))",
          maxHeight: listMaxHeight,
        }}
      >
        <div
          className="flex flex-col gap-3"
          style={{
            padding: "16px 18px",
            borderBottom: "1px solid hsl(var(--v2-border))",
          }}
        >
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca codice, titolo, contenuto…"
              className="v2-input"
              style={{
                width: "100%",
                paddingLeft: 36,
                paddingRight: query ? 32 : 12,
                paddingTop: 9,
                paddingBottom: 9,
                fontSize: 13,
              }}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: "hsl(var(--v2-text-mute))" }}
                aria-label="Pulisci"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {(["all", "dual", "eel", "gas"] as const).map((s) => {
              const active = sector === s;
              const label =
                s === "all"
                  ? "Tutti"
                  : s === "dual"
                  ? "Energia + Gas"
                  : s === "eel"
                  ? "Energia"
                  : "Gas";
              const count =
                s === "all"
                  ? items.length
                  : items.filter((d) => matchesSectorFilter(d.sectors, s)).length;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSector(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors",
                  )}
                  style={{
                    background: active ? "hsl(var(--v2-accent) / 0.14)" : "hsl(var(--v2-bg-elev))",
                    color: active ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-dim))",
                    border: `1px solid ${active ? "hsl(var(--v2-accent) / 0.35)" : "hsl(var(--v2-border))"}`,
                  }}
                >
                  {label}
                  <span className="v2-mono text-[10px] opacity-75 font-semibold">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessun risultato.
            </div>
          ) : (
            filtered.map((d) => (
              <DeliberaRowRich
                key={d.id}
                d={{
                  code: d.code,
                  title: d.title,
                  date: d.date,
                  sectors: d.sectors,
                  importanza: d.importanza,
                  summary: d.summary,
                }}
                active={d.code === selectedCode}
                onClick={() => setSelectedCode(d.code)}
              />
            ))
          )}
        </div>
      </div>

      {/* DETAIL */}
      <div
        className="overflow-y-auto min-h-0"
        style={{ maxHeight: listMaxHeight }}
      >
        {selected && <DetailPanel d={selected} onSummaryUpdated={handleSummaryUpdated} />}
      </div>
    </div>
  );
}

function DetailPanel({
  d,
  onSummaryUpdated,
}: {
  d: DeliberaView;
  onSummaryUpdated: (updated: DeliberaView) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errMsg, setErrMsg] = useState<string | null>(null);

  async function requestSummary() {
    setErrMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/delibere/${d.id}/summarize`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) {
          throw new Error(data.error ?? "errore generazione");
        }
        onSummaryUpdated({
          ...d,
          summary: data.result.summary,
          bullets: data.result.bullets,
          sectors: data.result.sectors.length ? data.result.sectors : d.sectors,
          hasSummary: true,
          aiError: null,
          aiSource: data.result.source,
          aiGeneratedAt: new Date().toISOString(),
        });
      } catch (err) {
        const m = err instanceof Error ? err.message : "errore imprevisto";
        setErrMsg(m);
      }
    });
  }

  return (
    <article className="p-6 md:p-7 flex flex-col gap-4">
      {/* Header meta riga unica */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {d.sectors.map((s) => (
            <V2SectorChip key={s} sector={s} />
          ))}
          <ImportanceBadge
            importanza={d.importanza}
            categoriaImpatto={d.categoriaImpatto}
            heuristicTag={d.heuristicTag}
            size="md"
          />
        </div>
        <span
          className="v2-mono text-[10.5px] font-semibold px-2 py-1 rounded"
          style={{
            background: "hsl(var(--v2-bg-elev))",
            border: "1px solid hsl(var(--v2-border))",
            color: "hsl(var(--v2-text))",
            letterSpacing: "0.06em",
          }}
        >
          {d.code}
        </span>
      </div>

      {/* Kicker tipo + data */}
      <div
        className="v2-mono"
        style={{
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "hsl(var(--v2-text-mute))",
        }}
      >
        {d.tipo ? `${d.tipo} · ` : ""}Pubblicata {fmtFull(d.date)}
      </div>

      {/* Titolo */}
      <h2
        className="text-lg md:text-[19px] font-semibold leading-snug tracking-tight"
        style={{ color: "hsl(var(--v2-text))" }}
      >
        {d.title}
      </h2>

      {d.hasSummary && d.summary ? (
        <p
          className="text-[13.5px] leading-relaxed"
          style={{
            color: "hsl(var(--v2-text-dim))",
            paddingLeft: 12,
            borderLeft: "2px solid hsl(var(--v2-accent) / 0.4)",
          }}
        >
          {d.summary}
        </p>
      ) : null}

      <div className="v2-card p-4">
        {d.hasSummary && d.bullets && d.bullets.length > 0 ? (
          <>
            <div
              className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em] mb-3 flex items-center gap-2"
              style={{ color: "hsl(var(--v2-accent))" }}
            >
              <Sparkles className="w-3 h-3" />
              Key take · {d.bullets.length} punti
              {d.aiSource === "pdf" && (
                <span className="ml-auto text-[9.5px] opacity-70">da PDF</span>
              )}
            </div>
            <ul className="space-y-2.5">
              {d.bullets.map((b, i) => (
                <li
                  key={i}
                  className="flex gap-3 text-[13.5px] leading-relaxed"
                  style={{ color: "hsl(var(--v2-text))" }}
                >
                  <span
                    className="v2-mono text-[11px] font-bold shrink-0 w-5"
                    style={{ color: "hsl(var(--v2-accent))" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <div className="flex flex-col items-center text-center gap-3 py-4">
            <div
              className="inline-flex items-center justify-center w-11 h-11 rounded-xl"
              style={{
                background: "hsl(var(--v2-accent) / 0.12)",
                border: "1px solid hsl(var(--v2-accent) / 0.28)",
                color: "hsl(var(--v2-accent))",
              }}
            >
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[14px] font-semibold" style={{ color: "hsl(var(--v2-text))" }}>
                Sommario non ancora generato
              </p>
              <p className="text-[12.5px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
                L&apos;agente AI può analizzare il PDF della delibera e produrre 4 punti operativi per reseller.
              </p>
            </div>
            <button
              type="button"
              onClick={requestSummary}
              disabled={isPending}
              className="v2-btn v2-btn--primary"
            >
              {isPending ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Analisi in corso…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  Genera sommario AI
                </>
              )}
            </button>
            {(errMsg || d.aiError) && (
              <p
                className="text-[11.5px] mt-1 inline-flex items-center gap-1.5"
                style={{ color: "hsl(0 72% 62%)" }}
              >
                <AlertTriangle className="w-3 h-3" />
                {errMsg ?? d.aiError}
              </p>
            )}
          </div>
        )}
      </div>

      {d.attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          <div
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Allegati · {d.attachments.length}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {d.attachments.map((a, i) => (
              <a
                key={`${a.url}-${i}`}
                // Proxy server-side: risolve il PDF da ARERA e lo scarica.
                href={`/api/delibere/${d.id}/document?idx=${i}`}
                className="v2-card v2-card--interactive p-3 flex items-center gap-3 text-left"
              >
                {attachmentIcon(a.kind)}
                <span
                  className="flex-1 text-[12.5px] truncate"
                  style={{ color: "hsl(var(--v2-text))" }}
                >
                  {a.label}
                </span>
                <Download className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
              </a>
            ))}
          </div>
        </div>
      )}

      <div
        className="flex items-center gap-2 flex-wrap pt-2 mt-auto"
        style={{ borderTop: "1px solid hsl(var(--v2-border))", paddingTop: "16px" }}
      >
        <button type="button" className="v2-btn">
          <MessageSquare className="w-3.5 h-3.5" />
          Chiedi all&apos;agente
        </button>
        <button type="button" className="v2-btn">
          <Bookmark className="w-3.5 h-3.5" />
          Salva
        </button>
        {d.url && (
          <a
            href={d.url}
            target="_blank"
            rel="noopener noreferrer"
            className="v2-btn ml-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            {d.tipo ?? "Fonte"}
            <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(var(--v2-text-mute))" }} />
          </a>
        )}
      </div>
    </article>
  );
}
