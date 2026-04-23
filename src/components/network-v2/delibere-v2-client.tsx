"use client";

import { useMemo, useState, useEffect } from "react";
import {
  ArrowUpRight,
  Bookmark,
  Download,
  ExternalLink,
  FileArchive,
  FileCode,
  FileSpreadsheet,
  FileText,
  MessageSquare,
  Search,
  X,
} from "lucide-react";
import { DELIBERE, type Delibera, type DeliberaAttachment, type DeliberaSector } from "@/lib/delibere/mock";
import { V2SectorChip } from "@/components/network-v2/sector-chip";
import { cn } from "@/lib/utils";

const MONTHS_IT = ["gen", "feb", "mar", "apr", "mag", "giu", "lug", "ago", "set", "ott", "nov", "dic"];

function fmtShort(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]}`;
}
function fmtFull(iso: string) {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function attachmentIcon(kind: DeliberaAttachment["kind"]) {
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

export function DelibereV2Client({ initialCode }: { initialCode?: string }) {
  const sorted = useMemo(
    () => [...DELIBERE].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [],
  );

  const [query, setQuery] = useState("");
  const [sector, setSector] = useState<"all" | DeliberaSector>("all");
  const [selectedCode, setSelectedCode] = useState<string>(
    initialCode && sorted.find((d) => d.code === initialCode) ? initialCode : sorted[0].code,
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sorted.filter((d) => {
      if (sector !== "all" && !d.sectors.includes(sector)) return false;
      if (q) {
        const hay = (d.title + " " + d.code + " " + d.summary + " " + d.bullets.join(" ")).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [sorted, query, sector]);

  useEffect(() => {
    if (filtered.length > 0 && !filtered.find((d) => d.code === selectedCode)) {
      setSelectedCode(filtered[0].code);
    }
  }, [filtered, selectedCode]);

  const selected = filtered.find((d) => d.code === selectedCode) ?? filtered[0] ?? sorted[0];

  return (
    <div
      className="v2-card overflow-hidden grid"
      style={{
        gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.35fr)",
        minHeight: "calc(100vh - 180px)",
      }}
    >
      {/* LIST */}
      <div className="flex flex-col min-h-0" style={{ borderRight: "1px solid hsl(var(--v2-border))" }}>
        {/* Toolbar */}
        <div className="p-3 flex flex-col gap-2" style={{ borderBottom: "1px solid hsl(var(--v2-border))" }}>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca codice, titolo, contenuto…"
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
            {(["all", "eel", "gas", "com"] as const).map((s) => {
              const active = sector === s;
              const label = s === "all" ? "Tutte" : s === "eel" ? "Energia" : s === "gas" ? "Gas" : "Comune";
              const count =
                s === "all" ? sorted.length : sorted.filter((d) => d.sectors.includes(s)).length;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSector(s)}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11.5px] font-medium transition-colors",
                  )}
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

        {/* Rows */}
        <div className="overflow-y-auto flex-1 min-h-0">
          {filtered.length === 0 ? (
            <div className="p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
              Nessun risultato.
            </div>
          ) : (
            filtered.map((d) => {
              const active = d.code === selectedCode;
              return (
                <button
                  key={d.code}
                  type="button"
                  onClick={() => setSelectedCode(d.code)}
                  className={cn("v2-delibera-row text-left w-full", active && "v2-delibera-row--active")}
                  style={{ gridTemplateColumns: "min-content 1fr", gap: "10px" }}
                >
                  <div className="flex flex-col gap-1 items-start">
                    <span className="v2-delibera-code">{d.code.split("/").slice(0, 2).join("/")}</span>
                    <span className="v2-delibera-date">{fmtShort(d.date)}</span>
                  </div>
                  <div className="min-w-0 flex flex-col gap-1.5">
                    <span className="v2-delibera-title">{d.title}</span>
                    <div className="flex items-center gap-1.5">
                      {d.sectors.map((s) => (
                        <V2SectorChip key={s} sector={s} />
                      ))}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* DETAIL */}
      <div className="overflow-y-auto min-h-0">
        {selected && <DetailPanel d={selected} />}
      </div>
    </div>
  );
}

function DetailPanel({ d }: { d: Delibera }) {
  return (
    <article className="p-6 md:p-8 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {d.sectors.map((s) => (
            <V2SectorChip key={s} sector={s} />
          ))}
          <span className="v2-mono text-[11px] ml-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Pubblicata {fmtFull(d.date)}
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
          {d.code}
        </span>
      </div>

      <h2 className="text-xl md:text-[22px] font-semibold leading-tight tracking-tight" style={{ color: "hsl(var(--v2-text))" }}>
        {d.title}
      </h2>

      <p className="text-[14px] leading-relaxed" style={{ color: "hsl(var(--v2-text-dim))" }}>
        {d.summary}
      </p>

      <div className="v2-card p-4">
        <div className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: "hsl(var(--v2-accent))" }}>
          Key take · 4 punti
        </div>
        <ul className="space-y-2.5">
          {d.bullets.map((b, i) => (
            <li key={i} className="flex gap-3 text-[13.5px] leading-relaxed" style={{ color: "hsl(var(--v2-text))" }}>
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
      </div>

      {d.attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Allegati · {d.attachments.length}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {d.attachments.map((a) => (
              <button
                key={a.label}
                type="button"
                className="v2-card v2-card--interactive p-3 flex items-center gap-3 text-left"
                onClick={() => alert("Gli allegati saranno scaricabili quando sarà attivo il crawler ARERA.")}
              >
                {attachmentIcon(a.kind)}
                <span className="flex-1 text-[12.5px] truncate" style={{ color: "hsl(var(--v2-text))" }}>
                  {a.label}
                </span>
                {a.size && (
                  <span className="v2-mono text-[10.5px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {a.size}
                  </span>
                )}
                <Download className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap pt-2 mt-auto" style={{ borderTop: "1px solid hsl(var(--v2-border))", paddingTop: "16px" }}>
        <button type="button" className="v2-btn v2-btn--primary">
          <MessageSquare className="w-3.5 h-3.5" />
          Chiedi all&apos;agente
        </button>
        <button type="button" className="v2-btn">
          <Bookmark className="w-3.5 h-3.5" />
          Salva
        </button>
        <a href={d.url} target="_blank" rel="noopener noreferrer" className="v2-btn ml-auto">
          <ExternalLink className="w-3.5 h-3.5" />
          ARERA
          <ArrowUpRight className="w-3 h-3" style={{ color: "hsl(var(--v2-text-mute))" }} />
        </a>
      </div>
    </article>
  );
}
