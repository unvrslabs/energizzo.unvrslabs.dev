"use client";

import { useMemo } from "react";
import { ExternalLink, Mail, Phone, Users } from "lucide-react";
import { StatusBadge } from "./status-badge";
import { EnrichButton } from "./enrich-button";
import { firstPhone, cn } from "@/lib/utils";
import type { Lead } from "@/lib/types";

type Props = {
  leads: Lead[];
  onSelect: (id: string) => void;
};

export function LeadsTable({ leads, onSelect }: Props) {
  const rows = useMemo(() => leads, [leads]);

  return (
    <div className="glass rounded-lg overflow-hidden">
      <div className="max-h-[70vh] overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card/90 backdrop-blur-xl border-b border-border/60">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Ragione sociale</th>
              <th className="px-4 py-3 w-[150px]">Stato</th>
              <th className="px-4 py-3 w-[140px]">Tipo servizio</th>
              <th className="px-4 py-3 w-[140px]">Comune</th>
              <th className="px-4 py-3 w-[100px]">Prov.</th>
              <th className="px-4 py-3 w-[180px]">Sito web</th>
              <th className="px-4 py-3 w-[200px]">Email</th>
              <th className="px-4 py-3 w-[140px]">Telefono</th>
              <th className="px-4 py-3 w-[110px]">Titolari</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => (
              <tr
                key={l.id}
                onClick={() => onSelect(l.id)}
                className="group cursor-pointer border-b border-border/30 hover:bg-accent/5 transition-colors"
              >
                <td className="px-4 py-3 font-medium group-hover:text-primary transition-colors">
                  <div className="flex flex-col">
                    <span>{l.ragione_sociale}</span>
                    <span className="font-mono text-[10px] text-muted-foreground">{l.piva}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={l.status} />
                </td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-block rounded-md border px-2 py-0.5 text-xs font-medium",
                      l.tipo_servizio === "Dual (Ele+Gas)" && "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
                      l.tipo_servizio === "Solo Elettrico" && "border-yellow-500/50 text-yellow-300 bg-yellow-500/10",
                      l.tipo_servizio === "Solo Gas" && "border-blue-500/50 text-blue-300 bg-blue-500/10",
                    )}
                  >
                    {l.tipo_servizio === "Dual (Ele+Gas)" ? "Dual" : l.tipo_servizio.replace("Solo ", "")}
                  </span>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{l.comune ?? "—"}</td>
                <td className="px-4 py-3 text-muted-foreground">{l.provincia ?? "—"}</td>
                <td className="px-4 py-3">
                  {l.sito_web ? (
                    <a
                      href={l.sito_web}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-primary hover:underline truncate max-w-[160px]"
                    >
                      <span className="truncate">{l.dominio}</span>
                      <ExternalLink className="h-3 w-3 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3 truncate max-w-[200px]">
                  {l.email ? (
                    <a
                      href={`mailto:${l.email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Mail className="h-3 w-3" />
                      <span className="truncate">{l.email}</span>
                    </a>
                  ) : l.email_info ? (
                    <span className="text-muted-foreground italic text-xs">{l.email_info} (proposta)</span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  {(() => {
                    const tel = firstPhone(l.telefoni);
                    return tel ? (
                      <a
                        href={`tel:${tel.replace(/\D/g, "")}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                      >
                        <Phone className="h-3 w-3" />
                        {tel}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    );
                  })()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                    <EnrichButton leadId={l.id} piva={l.piva} enrichedAt={l.contacts_enriched_at} />
                    {l.contacts_count && l.contacts_count > 0 ? (
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {l.contacts_count}
                      </span>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={9} className="py-16 text-center text-muted-foreground">
                  Nessun lead corrisponde ai filtri.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="px-4 py-2 text-xs text-muted-foreground border-t border-border/60 bg-background/40">
        {rows.length.toLocaleString("it-IT")} lead
      </div>
    </div>
  );
}
