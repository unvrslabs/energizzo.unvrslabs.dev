"use client";

import { ArrowUpRight, MessageSquare } from "lucide-react";
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

function formatEditorialDate(iso: string): { day: string; mon: string; yr: string } {
  const d = new Date(iso);
  return {
    day: String(d.getDate()).padStart(2, "0"),
    mon: MONTHS_IT[d.getMonth()],
    yr: String(d.getFullYear()),
  };
}

function typeLabel(kind: DeliberaAttachment["kind"]): string {
  if (kind === "xlsx") return "XLS";
  if (kind === "docx") return "DOC";
  if (kind === "zip") return "ZIP";
  return "PDF";
}

function sectorGlyph(sector: DeliberaSector): string {
  if (sector === "eel") return "⚡";
  if (sector === "gas") return "◈";
  return "·";
}

function sectorCode(sector: DeliberaSector): string {
  if (sector === "eel") return "EEL";
  if (sector === "gas") return "GAS";
  return "COM";
}

function SectorChip({ sector }: { sector: DeliberaSector }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] text-foreground/85">
      <span className="text-primary">{sectorGlyph(sector)}</span>
      {sectorCode(sector)}
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
  const { day, mon, yr } = formatEditorialDate(delibera.date);

  return (
    <article className="net-card overflow-hidden">
      {/* Header · date + sector chips + code */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-white/[0.06] flex-wrap">
        <span className="net-mono font-bold text-[13px] tracking-[0.06em] text-foreground">
          {day}
          <span className="text-muted-foreground/70 mx-0.5">·</span>
          {mon}
          <span className="text-muted-foreground/70 mx-0.5">·</span>
          {yr}
        </span>
        <div className="inline-flex items-center gap-3 flex-wrap">
          {delibera.sectors.map((s) => (
            <SectorChip key={s} sector={s} />
          ))}
          <span className="net-mono text-[11px] tracking-[0.1em] text-muted-foreground/80 uppercase">
            {delibera.code}
          </span>
        </div>
      </div>

      {/* Body · title + lede */}
      <div className="px-6 pt-6">
        <h3 className="text-[20px] sm:text-[22px] font-bold leading-[1.2] tracking-[-0.02em] text-foreground mb-3 max-w-[40ch]">
          {delibera.title}
        </h3>
        <p className="net-serif font-light text-[15px] leading-[1.55] text-foreground/85 max-w-[62ch]">
          {delibera.summary}
        </p>
      </div>

      {/* Cose da sapere */}
      <div className="px-6 pt-6">
        <p className="net-rule mb-4">
          <span>Cose da sapere</span>
          <span className="text-muted-foreground/50">
            · {String(delibera.bullets.length).padStart(2, "0")}
          </span>
        </p>
        <ul className="pl-9 space-y-2.5">
          {delibera.bullets.map((b, i) => (
            <li
              key={i}
              className="relative text-[14px] leading-[1.55] text-foreground/85 tracking-[-0.005em]"
            >
              <span
                aria-hidden
                className="net-mono absolute -left-6 top-0 text-primary font-bold"
              >
                →
              </span>
              {b}
            </li>
          ))}
        </ul>
      </div>

      {/* Allegati */}
      {delibera.attachments.length > 0 && (
        <div className="pt-6">
          <p className="net-rule mb-0 px-6">
            <span>Allegati</span>
            <span className="text-muted-foreground/50">
              · {String(delibera.attachments.length).padStart(2, "0")}
            </span>
          </p>
          <div className="mt-4 border-t border-white/[0.06] border-b">
            {delibera.attachments.map((a, i) => (
              <button
                key={a.label}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  alert(
                    "I file della delibera saranno scaricabili quando collegheremo il crawler ARERA.",
                  );
                }}
                className={`group w-full grid grid-cols-[48px_minmax(0,1fr)_auto_auto] items-center gap-4 px-6 py-3 text-left text-[14px] text-foreground/85 hover:text-foreground hover:bg-white/[0.02] transition-colors ${
                  i < delibera.attachments.length - 1
                    ? "border-b border-white/[0.06]"
                    : ""
                }`}
              >
                <span className="net-mono text-[10px] font-bold text-center tracking-[0.18em] text-muted-foreground group-hover:text-foreground px-0 py-1 border border-white/[0.12] group-hover:border-white/25 rounded-[4px] transition-colors">
                  {typeLabel(a.kind)}
                </span>
                <span className="truncate tracking-[-0.005em]">{a.label}</span>
                {a.size && (
                  <span className="net-mono text-[11.5px] text-muted-foreground/70 tracking-[0.06em] shrink-0">
                    {a.size}
                  </span>
                )}
                <span className="net-mono text-[10.5px] tracking-[0.12em] uppercase text-muted-foreground/60 group-hover:text-primary transition-colors shrink-0">
                  Scarica ↓
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Footer · actions */}
      <div className="flex items-center justify-between gap-3 px-6 py-5 flex-wrap">
        <a
          href={delibera.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-lg border border-white/[0.12] px-4 py-2.5 net-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-foreground/85 hover:text-foreground hover:border-white/25 transition-colors"
        >
          <ArrowUpRight className="h-3.5 w-3.5" />
          Apri su ARERA
        </a>
        <button
          type="button"
          onClick={() => onAskAgent(delibera)}
          className="inline-flex items-center gap-2 rounded-lg bg-primary text-[hsl(158_80%_10%)] px-4 py-2.5 text-[13px] font-bold tracking-[-0.005em] transition-all hover:-translate-y-px hover:shadow-[0_8px_24px_hsl(158_72%_40%/0.3)]"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Chiedi all&apos;agente
        </button>
      </div>
    </article>
  );
}
