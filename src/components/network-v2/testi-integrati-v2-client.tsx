"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Download,
  ExternalLink,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  Loader2,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import { DeliberaRowRich } from "@/components/network-v2/delibera-row-rich";
import type { UiSector } from "@/lib/delibere/api";
import { cn } from "@/lib/utils";

export type TiAttachment = {
  label: string;
  url: string;
  kind: "pdf" | "xlsx" | "docx" | "zip" | "other";
};

export type DeliberaRefView = {
  codice: string;
  titolo: string | null;
  settore: string | null;
  dataPubblicazione: string | null;
  /** Se presente: link interno al cockpit delibere. Preferito. */
  internalHref: string | null;
  /** Fallback alla pagina ARERA se la delibera non è nella cache. */
  areraHref: string | null;
};

export type TestoIntegratoView = {
  id: number;
  codice: string;
  titolo: string;
  descrizione: string | null;
  deliberaRef: DeliberaRefView | null;
  dataVigore: string | null;
  sectors: UiSector[];
  stato: string | null;
  url: string | null;
  attachments: TiAttachment[];
  summary: string | null;
  bullets: string[] | null;
  hasSummary: boolean;
  aiSource: "pdf" | "metadata" | null;
  aiError: string | null;
};

type SectorFilter = "all" | "eel" | "gas";

function matchesSectorFilter(sectors: UiSector[], f: SectorFilter): boolean {
  if (f === "all") return true;
  return sectors.includes(f);
}

const MONTHS_IT = [
  "gen", "feb", "mar", "apr", "mag", "giu",
  "lug", "ago", "set", "ott", "nov", "dic",
];

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

function attachmentIcon(kind: TiAttachment["kind"]) {
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

export function TestiIntegratiV2Client({
  testi,
  initialCode,
}: {
  testi: TestoIntegratoView[];
  initialCode?: string;
}) {
  const [items, setItems] = useState<TestoIntegratoView[]>(testi);
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<SectorFilter>("all");
  const [selectedCode, setSelectedCode] = useState<string>(
    items.length > 0
      ? initialCode && items.find((t) => t.codice === initialCode)
        ? initialCode
        : items[0].codice
      : "",
  );

  function handleSummaryUpdated(updated: TestoIntegratoView) {
    setItems((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((t) => {
      if (!matchesSectorFilter(t.sectors, sector)) return false;
      if (q) {
        const hay = [t.titolo, t.codice, t.descrizione ?? ""].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [items, query, sector]);

  const selected = filtered.find((t) => t.codice === selectedCode) ?? filtered[0] ?? items[0];

  const listMaxHeight = "calc(100vh - 160px)";

  if (items.length === 0) {
    return (
      <div className="v2-card p-10 text-center">
        <p className="text-sm" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Nessun testo integrato sincronizzato.
        </p>
      </div>
    );
  }

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
        <div className="p-3 flex flex-col gap-2" style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca codice, titolo, descrizione…"
              className="v2-input"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5"
                style={{ color: "hsl(var(--v2-text-mute))" }}
                aria-label="Pulisci"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {(["all", "eel", "gas"] as const).map((s) => {
              const active = sector === s;
              const label = s === "all" ? "Tutti" : s === "eel" ? "Energia" : "Gas";
              const count =
                s === "all"
                  ? items.length
                  : items.filter((t) => matchesSectorFilter(t.sectors, s)).length;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSector(s)}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors"
                  style={{
                    background: active ? "hsl(var(--v2-accent) / 0.14)" : "hsl(var(--v2-bg-elev))",
                    color: active ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-dim))",
                    border: `1px solid ${active ? "hsl(var(--v2-accent) / 0.35)" : "hsl(var(--v2-border))"}`,
                  }}
                >
                  {label}
                  <span className="v2-mono text-[10px] opacity-70">{count}</span>
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
            filtered.map((t) => (
              <DeliberaRowRich
                key={t.id}
                d={{
                  code: t.codice,
                  title: t.titolo,
                  date: t.dataVigore,
                  sectors: t.sectors,
                  importanza: null,
                  summary: t.descrizione,
                  stripeColor: "hsl(var(--v2-accent) / 0.5)",
                  extraChip: t.stato ? { label: t.stato } : undefined,
                }}
                active={t.codice === selectedCode}
                onClick={() => setSelectedCode(t.codice)}
              />
            ))
          )}
        </div>
      </div>

      {/* DETAIL */}
      <div className="overflow-y-auto min-h-0" style={{ maxHeight: listMaxHeight }}>
        {selected && (
          <DetailPanel t={selected} onSummaryUpdated={handleSummaryUpdated} />
        )}
      </div>
    </div>
  );
}

function DetailPanel({
  t,
  onSummaryUpdated,
}: {
  t: TestoIntegratoView;
  onSummaryUpdated: (updated: TestoIntegratoView) => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [errMsg, setErrMsg] = useState<string | null>(null);

  function requestSummary() {
    setErrMsg(null);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/testi-integrati/${t.id}/summarize`, {
          method: "POST",
        });
        const data = await res.json();
        if (!res.ok || !data.ok) throw new Error(data.error ?? "errore");
        onSummaryUpdated({
          ...t,
          summary: data.result.summary,
          bullets: data.result.bullets,
          hasSummary: true,
          aiSource: data.result.source,
          aiError: null,
        });
      } catch (err) {
        setErrMsg(err instanceof Error ? err.message : "errore imprevisto");
      }
    });
  }

  return (
    <article className="p-6 md:p-7 flex flex-col gap-4">
      {/* Header meta riga unica */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {t.sectors.map((s) => (
            <V2SectorChip key={s} sector={s} />
          ))}
          {t.stato && (
            <span
              className="v2-mono"
              style={{
                fontSize: 9.5,
                fontWeight: 700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color: "hsl(var(--v2-accent))",
                background: "hsl(var(--v2-accent) / 0.10)",
                padding: "2px 8px",
                borderRadius: 4,
                border: "1px solid hsl(var(--v2-accent) / 0.28)",
              }}
            >
              {t.stato}
            </span>
          )}
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
          {t.codice}
        </span>
      </div>

      {/* Kicker vigenza */}
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
        Testo integrato · Vigente dal {fmtFull(t.dataVigore)}
      </div>

      {/* Titolo */}
      <h2
        className="text-lg md:text-[19px] font-semibold leading-snug tracking-tight"
        style={{ color: "hsl(var(--v2-text))" }}
      >
        {t.titolo}
      </h2>

      {t.descrizione && t.descrizione !== t.titolo && (
        <p
          className="text-[13.5px] leading-relaxed"
          style={{
            color: "hsl(var(--v2-text-dim))",
            paddingLeft: 12,
            borderLeft: "2px solid hsl(var(--v2-accent) / 0.4)",
          }}
        >
          {t.descrizione}
        </p>
      )}

      {t.hasSummary && t.summary && t.summary !== t.descrizione && (
        <p
          className="text-[13.5px] leading-relaxed"
          style={{
            color: "hsl(var(--v2-text-dim))",
            paddingLeft: 12,
            borderLeft: "2px solid hsl(var(--v2-accent) / 0.4)",
          }}
        >
          {t.summary}
        </p>
      )}

      <div className="v2-card p-4">
        {t.hasSummary && t.bullets && t.bullets.length > 0 ? (
          <>
            <div
              className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em] mb-3 flex items-center gap-2"
              style={{ color: "hsl(var(--v2-accent))" }}
            >
              <Sparkles className="w-3 h-3" />
              Key take · {t.bullets.length} punti
              {t.aiSource === "pdf" && (
                <span className="ml-auto text-[9.5px] opacity-70">da PDF</span>
              )}
              {t.aiSource === "metadata" && (
                <span className="ml-auto text-[9.5px] opacity-70">da metadati</span>
              )}
            </div>
            <ul className="space-y-2.5">
              {t.bullets.map((b, i) => (
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
                Analisi AI non ancora generata
              </p>
              <p className="text-[12.5px] mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
                L&apos;agente AI può analizzare il testo integrato e produrre 4 punti chiave operativi.
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
            {(errMsg || t.aiError) && (
              <p
                className="text-[11.5px] mt-1 inline-flex items-center gap-1.5"
                style={{ color: "hsl(0 72% 62%)" }}
              >
                <AlertTriangle className="w-3 h-3" />
                {errMsg ?? t.aiError}
              </p>
            )}
          </div>
        )}
      </div>

      {t.deliberaRef && <DeliberaRefCard dref={t.deliberaRef} />}

      {t.attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          <div
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Allegati · {t.attachments.length}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {t.attachments.map((a, i) => (
              <a
                key={`${a.url}-${i}`}
                // Proxy server-side: risolve il PDF da ARERA e lo scarica.
                href={`/api/testi-integrati/${t.id}/document?idx=${i}`}
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
          <Bookmark className="w-3.5 h-3.5" />
          Salva
        </button>
        {t.url && (
          <a
            href={t.url}
            target="_blank"
            rel="noopener noreferrer"
            className="v2-btn ml-auto"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            ARERA
            <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(var(--v2-text-mute))" }} />
          </a>
        )}
      </div>
    </article>
  );
}

function DeliberaRefCard({ dref }: { dref: DeliberaRefView }) {
  const settoreLabel = labelSettore(dref.settore);

  const Inner = (
    <div className="relative group">
      <div
        className="v2-card v2-card--interactive p-4 flex items-center gap-3"
        style={{ transition: "border-color 160ms ease, background 160ms ease" }}
      >
        <div className="flex-1 min-w-0">
          <div
            className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em] mb-1.5"
            style={{ color: "hsl(var(--v2-accent))" }}
          >
            Delibera di riferimento
          </div>
          <div
            className="v2-mono text-[13.5px] font-semibold flex items-center gap-2 flex-wrap"
            style={{ color: "hsl(var(--v2-text))" }}
          >
            {dref.codice}
          </div>
          {dref.titolo && (
            <p
              className="text-[12.5px] mt-1.5 line-clamp-2"
              style={{ color: "hsl(var(--v2-text-dim))", lineHeight: 1.45 }}
            >
              {dref.titolo}
            </p>
          )}
        </div>
        <div
          className="flex items-center gap-1 shrink-0 self-start pt-0.5"
          style={{ color: "hsl(var(--v2-accent))" }}
        >
          {dref.internalHref ? (
            <>
              <span
                className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hidden sm:inline"
                style={{ color: "hsl(var(--v2-accent))" }}
              >
                Apri
              </span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          ) : dref.areraHref ? (
            <>
              <span
                className="v2-mono text-[10px] font-semibold uppercase tracking-[0.14em] hidden sm:inline"
                style={{ color: "hsl(var(--v2-text-mute))" }}
              >
                ARERA
              </span>
              <ExternalLink className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
            </>
          ) : null}
        </div>
      </div>

      {/* Hover preview popover (desktop only) */}
      <div
        className="hidden md:block absolute z-20 top-full left-0 right-0 mt-2 p-3 rounded-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150"
        style={{
          background: "hsl(var(--v2-bg-elev))",
          border: "1px solid hsl(var(--v2-border-strong))",
          boxShadow: "0 12px 32px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.04)",
        }}
        aria-hidden
      >
        <div className="flex items-center gap-2 flex-wrap mb-1.5">
          {settoreLabel && (
            <span
              className="v2-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
              style={{
                color: "hsl(var(--v2-accent))",
                background: "hsl(var(--v2-accent) / 0.1)",
                border: "1px solid hsl(var(--v2-accent) / 0.28)",
              }}
            >
              {settoreLabel}
            </span>
          )}
          {dref.dataPubblicazione && (
            <span
              className="v2-mono text-[10px]"
              style={{ color: "hsl(var(--v2-text-mute))" }}
            >
              Pubblicata {fmtFull(dref.dataPubblicazione)}
            </span>
          )}
        </div>
        <p className="text-[12.5px] leading-relaxed" style={{ color: "hsl(var(--v2-text))" }}>
          {dref.titolo ?? "Questa delibera è più vecchia e non è nel nostro archivio. Clicca per aprirla su ARERA."}
        </p>
      </div>
    </div>
  );

  if (dref.internalHref) {
    return (
      <Link href={dref.internalHref} className="block">
        {Inner}
      </Link>
    );
  }
  if (dref.areraHref) {
    return (
      <a href={dref.areraHref} target="_blank" rel="noopener noreferrer" className="block">
        {Inner}
      </a>
    );
  }
  return <div className="block">{Inner}</div>;
}

function labelSettore(s: string | null): string | null {
  if (!s) return null;
  const l = s.toLowerCase();
  if (l.includes("luce") || l.includes("elett")) return "Energia";
  if (l.includes("gas")) return "Gas";
  return s;
}
