"use client";

import { useMemo } from "react";
import { ExternalLink, Mail, Phone, Users } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { SurveyBadge } from "./survey-badge";
import { EnrichButton } from "./enrich-button";
import { firstPhone, cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

type Props = {
  leads: Lead[];
  onSelect: (id: string) => void;
};

const COLS = [
  { key: "ragione", label: "Ragione sociale", width: "minmax(240px, 1.6fr)" },
  { key: "stato", label: "Stato", width: "150px" },
  { key: "survey", label: "Survey", width: "130px" },
  { key: "tipo", label: "Tipo", width: "110px" },
  { key: "comune", label: "Comune", width: "140px" },
  { key: "prov", label: "Prov.", width: "100px" },
  { key: "sito", label: "Sito web", width: "170px" },
  { key: "email", label: "Email", width: "220px" },
  { key: "tel", label: "Telefono", width: "140px" },
  { key: "titolari", label: "Titolari", width: "100px" },
] as const;

export function LeadsTable({ leads, onSelect }: Props) {
  const rows = useMemo(() => leads, [leads]);
  const gridTemplate = COLS.map((c) => c.width).join(" ");

  return (
    <div className="liquid-glass rounded-[1.25rem] overflow-hidden">
      <div className="max-h-[72vh] overflow-auto scroll-contained">
        <div className="min-w-[1400px]">
          {/* Header */}
          <div
            className="sticky top-0 z-10 grid items-center gap-0 bg-[hsl(215_35%_14%)] border-b border-primary/25"
            style={{ gridTemplateColumns: gridTemplate }}
          >
            {COLS.map((c) => (
              <div
                key={c.key}
                className="px-4 py-3.5 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground whitespace-nowrap"
              >
                {c.label}
              </div>
            ))}
          </div>

          {/* Body */}
          {rows.map((l, i) => (
            <div
              key={l.id}
              role="button"
              onClick={() => onSelect(l.id)}
              className={cn(
                "group grid items-center gap-0 border-b border-white/5 cursor-pointer transition-colors",
                i % 2 === 0 ? "bg-white/[0.015]" : "bg-transparent",
                "hover:bg-primary/[0.05]",
              )}
              style={{ gridTemplateColumns: gridTemplate }}
            >
              <div className="px-4 py-3 min-w-0 group-hover:text-primary transition-colors">
                <div className="flex flex-col">
                  <span className="font-semibold truncate">{l.ragione_sociale}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{l.piva}</span>
                </div>
              </div>
              <div className="px-4 py-3">
                <StatusBadge status={l.status} />
              </div>
              <div className="px-4 py-3">
                <SurveyBadge status={l.survey_status} />
              </div>
              <div className="px-4 py-3">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                    l.tipo_servizio === "Dual (Ele+Gas)" &&
                      "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
                    l.tipo_servizio === "Solo Elettrico" &&
                      "border-yellow-500/50 text-yellow-300 bg-yellow-500/10",
                    l.tipo_servizio === "Solo Gas" &&
                      "border-blue-500/50 text-blue-300 bg-blue-500/10",
                  )}
                >
                  {l.tipo_servizio === "Dual (Ele+Gas)"
                    ? "Dual"
                    : l.tipo_servizio.replace("Solo ", "")}
                </span>
              </div>
              <div className="px-4 py-3 text-sm text-muted-foreground truncate">
                {l.comune ?? "—"}
              </div>
              <div className="px-4 py-3 text-sm text-muted-foreground truncate">
                {l.provincia ?? "—"}
              </div>
              <div className="px-4 py-3 min-w-0">
                {l.sito_web ? (
                  <a
                    href={l.sito_web}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline truncate max-w-full"
                  >
                    <span className="truncate">{l.dominio}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div className="px-4 py-3 min-w-0">
                {l.email ? (
                  <a
                    href={`mailto:${l.email}`}
                    onClick={(e) => e.stopPropagation()}
                    className="inline-flex items-center gap-1 text-sm text-primary hover:underline truncate max-w-full"
                  >
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{l.email}</span>
                  </a>
                ) : l.email_info ? (
                  <span className="text-muted-foreground italic text-xs truncate block">
                    {l.email_info}
                  </span>
                ) : (
                  <span className="text-muted-foreground">—</span>
                )}
              </div>
              <div className="px-4 py-3 min-w-0">
                {(() => {
                  const tel = firstPhone(l.telefoni);
                  return tel ? (
                    <a
                      href={`tel:${tel.replace(/\D/g, "")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-sm hover:text-primary transition-colors truncate max-w-full"
                    >
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate">{tel}</span>
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  );
                })()}
              </div>
              <div className="px-4 py-3">
                <div
                  className="flex items-center gap-1.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <EnrichButton
                    leadId={l.id}
                    piva={l.piva}
                    enrichedAt={l.contacts_enriched_at}
                  />
                  {l.contacts_count && l.contacts_count > 0 ? (
                    <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {l.contacts_count}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <div className="py-16 text-center text-muted-foreground">
              Nessun lead corrisponde ai filtri.
            </div>
          )}
        </div>
      </div>
      <div className="px-5 py-2.5 text-xs text-muted-foreground border-t border-white/10 bg-background/40 flex items-center justify-between">
        <span>
          <span className="font-semibold text-foreground tabular-nums">
            {rows.length.toLocaleString("it-IT")}
          </span>{" "}
          lead
        </span>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Clicca una riga per aprire il dettaglio
        </span>
      </div>
    </div>
  );
}
