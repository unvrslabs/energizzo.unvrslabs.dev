"use client";

import { Building2, Paperclip } from "lucide-react";
import { CATEGORIA_CONFIG, STATUS_CONFIG, type Categoria } from "@/lib/status-config";
import type { Lead } from "@/lib/types";
import { cn } from "@/lib/utils";

export function LeadsTableV2({
  leads,
  onSelect,
}: {
  leads: Lead[];
  onSelect: (id: string) => void;
}) {
  if (leads.length === 0) {
    return (
      <div className="v2-card p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
        Nessun lead nel filtro corrente.
      </div>
    );
  }

  const GRID = "minmax(260px, 2fr) 70px 140px 150px 110px 90px 180px";

  return (
    <div className="v2-card overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: "1170px" }}>
          {/* Header */}
          <div
            className="grid gap-3 px-4 py-3 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              gridTemplateColumns: GRID,
              color: "hsl(var(--v2-text-mute))",
              borderBottom: "1px solid hsl(var(--v2-border))",
            }}
          >
            <span>Ragione sociale</span>
            <span>Invito</span>
            <span>Stato</span>
            <span>Categoria</span>
            <span>Network</span>
            <span>Tipo</span>
            <span>Comune</span>
          </div>

          {/* Rows */}
          <ul>
            {leads.map((l) => {
              const statusCfg = STATUS_CONFIG[l.status];
              return (
                <li
                  key={l.id}
                  onClick={() => onSelect(l.id)}
                  className="grid gap-3 px-4 py-3 items-center cursor-pointer transition-colors hover:bg-white/[0.02]"
                  style={{
                    gridTemplateColumns: GRID,
                    borderBottom: "1px solid hsl(var(--v2-border))",
                  }}
                >
              <div className="flex items-center gap-2 min-w-0">
                <Building2 className="w-4 h-4 shrink-0" style={{ color: "hsl(var(--v2-text-mute))" }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                    {l.ragione_sociale}
                  </div>
                  <div className="v2-mono text-[10.5px] truncate flex items-center gap-2" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    <span>{l.piva ?? "—"}</span>
                    {(l.documents_count ?? 0) > 0 && (
                      <span
                        className="v2-mono inline-flex items-center gap-0.5 px-1 py-0 text-[9px] font-bold rounded"
                        style={{
                          background: "hsl(var(--v2-accent) / 0.12)",
                          color: "hsl(var(--v2-accent))",
                        }}
                      >
                        <Paperclip className="w-2.5 h-2.5" />
                        {l.documents_count}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {l.invite_number != null ? (
                <span
                  className="v2-mono text-[10.5px] font-bold px-1.5 py-0.5 rounded w-fit"
                  style={{
                    background: "hsl(var(--v2-warn) / 0.1)",
                    color: "hsl(var(--v2-warn))",
                    border: "1px solid hsl(var(--v2-warn) / 0.3)",
                  }}
                  title="Invito nominale"
                >
                  #{String(l.invite_number).padStart(3, "0")}
                </span>
              ) : (
                <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                  —
                </span>
              )}

              <StatusPill color={statusCfg.color} label={statusCfg.label} />

              <CategoriaPill categoria={l.categoria as Categoria | null} />

              <NetworkPill status={l.network_status ?? null} />

              <span className="v2-mono text-[11px] truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                {l.tipo_servizio === "Dual (Ele+Gas)" ? "Dual" : l.tipo_servizio.replace("Solo ", "")}
              </span>

              <span className="text-[12px] truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                {l.comune ?? "—"}{l.provincia ? ` (${l.provincia})` : ""}
              </span>
            </li>
          );
        })}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ color, label }: { color: string; label: string }) {
  return (
    <span
      className="v2-mono inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
      style={{
        background: `${color}18`,
        color,
        border: `1px solid ${color}44`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function CategoriaPill({ categoria }: { categoria: Categoria | null }) {
  if (!categoria) {
    return (
      <span
        className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
        style={{
          background: "hsl(var(--v2-border))",
          color: "hsl(var(--v2-text-mute))",
        }}
      >
        —
      </span>
    );
  }
  const cfg = CATEGORIA_CONFIG[categoria];
  return (
    <span
      className={cn("v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded inline-flex items-center gap-1.5 w-fit")}
      style={{
        background: `${cfg.color}18`,
        color: cfg.color,
        border: `1px solid ${cfg.color}44`,
      }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.color }} />
      {categoria.replace(/_/g, " ").replace("DISPACCIATORE", "DISP.")}
    </span>
  );
}

function NetworkPill({ status }: { status: string | null }) {
  if (status === "member") {
    return (
      <span
        className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
        style={{ background: "hsl(var(--v2-accent) / 0.14)", color: "hsl(var(--v2-accent))" }}
      >
        Membro
      </span>
    );
  }
  if (status === "invited") {
    return (
      <span
        className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
        style={{ background: "hsl(var(--v2-warn) / 0.14)", color: "hsl(var(--v2-warn))" }}
      >
        Invitato
      </span>
    );
  }
  return (
    <span
      className="v2-mono text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
      style={{ background: "hsl(var(--v2-border))", color: "hsl(var(--v2-text-mute))" }}
    >
      —
    </span>
  );
}
