"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Download,
  ExternalLink,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  Search,
  X,
} from "lucide-react";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import type { UiSector } from "@/lib/delibere/api";
import { cn } from "@/lib/utils";

export type TiAttachment = {
  label: string;
  url: string;
  kind: "pdf" | "xlsx" | "docx" | "zip" | "other";
};

export type TestoIntegratoView = {
  id: number;
  codice: string;
  titolo: string;
  descrizione: string | null;
  delibera_riferimento: string | null;
  dataVigore: string | null;
  sectors: UiSector[];
  stato: string | null;
  url: string | null;
  attachments: TiAttachment[];
};

type SectorFilter = "all" | "eel" | "gas" | "dual";

function matchesSectorFilter(sectors: UiSector[], f: SectorFilter): boolean {
  if (f === "all") return true;
  const hasEel = sectors.includes("eel");
  const hasGas = sectors.includes("gas");
  if (f === "dual") return hasEel && hasGas;
  if (f === "eel") return hasEel && !hasGas;
  if (f === "gas") return hasGas && !hasEel;
  return false;
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
  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<SectorFilter>("all");
  const [selectedCode, setSelectedCode] = useState<string>(
    testi.length > 0
      ? initialCode && testi.find((t) => t.codice === initialCode)
        ? initialCode
        : testi[0].codice
      : "",
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return testi.filter((t) => {
      if (!matchesSectorFilter(t.sectors, sector)) return false;
      if (q) {
        const hay = [t.titolo, t.codice, t.descrizione ?? ""].join(" ").toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [testi, query, sector]);

  const selected = filtered.find((t) => t.codice === selectedCode) ?? filtered[0] ?? testi[0];

  const listMaxHeight = "calc(100vh - 160px)";

  if (testi.length === 0) {
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
                  ? testi.length
                  : testi.filter((t) => matchesSectorFilter(t.sectors, s)).length;
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
            filtered.map((t) => {
              const active = t.codice === selectedCode;
              const codeShort = t.codice.split("/").slice(0, 2).join("/");
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedCode(t.codice)}
                  className={cn("v2-delibera-row text-left w-full", active && "v2-delibera-row--active")}
                  style={{ gridTemplateColumns: "min-content 1fr", gap: "10px" }}
                >
                  <div className="flex flex-col gap-1 items-start">
                    <span className="v2-delibera-code">{codeShort}</span>
                    <span className="v2-delibera-date">{fmtShort(t.dataVigore)}</span>
                  </div>
                  <div className="min-w-0 flex flex-col gap-1.5">
                    <span className="v2-delibera-title">{t.titolo}</span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {t.sectors.map((s) => (
                        <V2SectorChip key={s} sector={s} />
                      ))}
                      {t.stato && (
                        <span
                          className="v2-mono inline-flex items-center text-[9.5px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                          style={{
                            color: "hsl(var(--v2-accent))",
                            background: "hsl(var(--v2-accent) / 0.08)",
                            border: "1px solid hsl(var(--v2-accent) / 0.22)",
                          }}
                        >
                          {t.stato}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* DETAIL */}
      <div className="overflow-y-auto min-h-0" style={{ maxHeight: listMaxHeight }}>
        {selected && <DetailPanel t={selected} />}
      </div>
    </div>
  );
}

function DetailPanel({ t }: { t: TestoIntegratoView }) {
  return (
    <article className="p-6 md:p-8 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {t.sectors.map((s) => (
            <V2SectorChip key={s} sector={s} />
          ))}
          <span className="v2-mono text-[11px] ml-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Vigente dal {fmtFull(t.dataVigore)}
          </span>
        </div>
        <span
          className="v2-mono text-[11px] font-semibold px-2 py-1 rounded"
          style={{
            background: "hsl(var(--v2-bg-elev))",
            border: "1px solid hsl(var(--v2-border))",
            color: "hsl(var(--v2-text))",
          }}
        >
          {t.codice}
        </span>
      </div>

      <h2
        className="text-xl md:text-[22px] font-semibold leading-tight tracking-tight"
        style={{ color: "hsl(var(--v2-text))" }}
      >
        {t.titolo}
      </h2>

      {t.descrizione && (
        <p className="text-[14px] leading-relaxed" style={{ color: "hsl(var(--v2-text-dim))" }}>
          {t.descrizione}
        </p>
      )}

      {t.delibera_riferimento && (
        <div className="v2-card p-4">
          <div
            className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em] mb-2"
            style={{ color: "hsl(var(--v2-accent))" }}
          >
            Delibera di riferimento
          </div>
          <p
            className="v2-mono text-[13px] font-semibold"
            style={{ color: "hsl(var(--v2-text))" }}
          >
            {t.delibera_riferimento}
          </p>
        </div>
      )}

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
                href={a.url}
                target="_blank"
                rel="noopener noreferrer"
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
