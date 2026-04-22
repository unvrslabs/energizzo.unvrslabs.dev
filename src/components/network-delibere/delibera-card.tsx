"use client";

import {
  ExternalLink,
  MessageSquare,
  FileText,
  FileSpreadsheet,
  FileArchive,
  FileCode,
  Calendar,
  Download,
  Zap,
  Flame,
} from "lucide-react";
import type {
  Delibera,
  DeliberaAttachment,
  DeliberaSector,
} from "@/lib/delibere/mock";

const MONTHS_IT = [
  "gen",
  "feb",
  "mar",
  "apr",
  "mag",
  "giu",
  "lug",
  "ago",
  "set",
  "ott",
  "nov",
  "dic",
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS_IT[d.getMonth()]} ${d.getFullYear()}`;
}

function attachmentIcon(kind: DeliberaAttachment["kind"]) {
  switch (kind) {
    case "xlsx":
      return <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-300" />;
    case "zip":
      return <FileArchive className="h-3.5 w-3.5 text-amber-300" />;
    case "docx":
      return <FileCode className="h-3.5 w-3.5 text-sky-300" />;
    default:
      return <FileText className="h-3.5 w-3.5 text-primary" />;
  }
}

function SectorBadge({ sector }: { sector: DeliberaSector }) {
  if (sector === "eel") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
        <Zap className="h-3 w-3" />
        Elettrico
      </span>
    );
  }
  if (sector === "gas") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-300 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
        <Flame className="h-3 w-3" />
        Gas
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full border border-white/15 bg-white/[0.05] text-muted-foreground px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide">
      Comune
    </span>
  );
}

export function DeliberaCard({
  delibera,
  onAskAgent,
}: {
  delibera: Delibera;
  onAskAgent: (d: Delibera) => void;
}) {
  return (
    <article className="dispaccio-card p-5 sm:p-6 flex flex-col gap-4">
      {/* Header: sectors + date + code */}
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-1.5 flex-wrap">
          {delibera.sectors.map((s) => (
            <SectorBadge key={s} sector={s} />
          ))}
          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <Calendar className="h-3 w-3" />
            {formatDate(delibera.date)}
          </span>
        </div>
        <span className="inline-flex items-center rounded-md border border-white/10 bg-white/[0.04] px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
          {delibera.code}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-display text-base sm:text-lg font-bold leading-tight tracking-tight text-foreground">
        {delibera.title}
      </h3>

      {/* Summary */}
      <p className="text-sm text-muted-foreground leading-relaxed">
        {delibera.summary}
      </p>

      {/* Bullets */}
      <div className="rounded-xl border border-primary/20 bg-primary/[0.04] p-3 sm:p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary mb-2">
          Cose da sapere
        </p>
        <ul className="space-y-1.5">
          {delibera.bullets.map((b, i) => (
            <li
              key={i}
              className="flex gap-2 text-xs sm:text-[13px] text-foreground/90 leading-relaxed"
            >
              <span className="mt-1.5 h-1 w-1 rounded-full bg-primary shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Attachments */}
      {delibera.attachments.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
            Allegati
          </p>
          <div className="flex flex-col gap-1.5">
            {delibera.attachments.map((a) => (
              <button
                key={a.label}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "I file della delibera saranno scaricabili quando collegheremo il crawler ARERA.",
                  );
                }}
                className="group inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] px-3 py-2 text-xs text-foreground/90 transition-colors text-left"
              >
                {attachmentIcon(a.kind)}
                <span className="flex-1 truncate">{a.label}</span>
                {a.size && (
                  <span className="text-[10px] text-muted-foreground/70 shrink-0">
                    {a.size}
                  </span>
                )}
                <Download className="h-3.5 w-3.5 text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer actions */}
      <div className="flex items-center gap-2 pt-1 mt-auto">
        <a
          href={delibera.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Apri su ARERA</span>
          <span className="sm:hidden">ARERA</span>
        </a>
        <button
          type="button"
          onClick={() => onAskAgent(delibera)}
          className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-primary to-emerald-600 text-primary-foreground px-3.5 py-1.5 text-xs font-semibold shadow-md shadow-primary/25 hover:shadow-primary/40 transition-shadow ml-auto"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chiedi all&apos;agente
        </button>
      </div>
    </article>
  );
}
