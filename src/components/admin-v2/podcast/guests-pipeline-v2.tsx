"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Building2, MessageCircle, Plus, Search, User, UserSquare2, X } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import {
  GUEST_CATEGORY_LABEL,
  GUEST_STATUS_CONFIG,
  GUEST_STATUSES,
  type GuestStatus,
} from "@/lib/podcast-config";
import { updateGuestStatus } from "@/actions/podcast-guest";
import { GuestAddFromLead } from "@/components/podcast/guest-add-from-lead";
import { GuestAddExternal } from "@/components/podcast/guest-add-external";
import type { Lead, PodcastGuest } from "@/lib/types";

type LeadMini = Pick<Lead, "id" | "ragione_sociale" | "piva" | "provincia" | "email" | "telefoni">;

export function GuestsPipelineV2({
  guests,
  leads,
  leadBasePath = "/dashboard/lead",
}: {
  guests: PodcastGuest[];
  leads: LeadMini[];
  leadBasePath?: string;
}) {
  const [view, setView] = useState<"kanban" | "tabella">("kanban");
  const [query, setQuery] = useState("");
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [addExternalOpen, setAddExternalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (!q) return true;
      const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [guests, query]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Pipeline · ospiti podcast
          </p>
          <h1 className="text-xl md:text-2xl font-semibold tracking-tight mt-1" style={{ color: "hsl(var(--v2-text))" }}>
            {guests.length} ospiti · {guests.filter((g) => g.status === "confirmed").length} confermati
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setAddLeadOpen(true)} className="v2-btn v2-btn--primary">
            <Plus className="w-3.5 h-3.5" />
            Da lead CRM
          </button>
          <button onClick={() => setAddExternalOpen(true)} className="v2-btn">
            <Plus className="w-3.5 h-3.5" />
            Esterno
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div className="v2-card p-3 flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca ospite, azienda…"
            className="v2-input"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2"
              style={{ color: "hsl(var(--v2-text-mute))" }}
              aria-label="Pulisci"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="ml-auto v2-card p-1 flex items-center gap-0.5 w-fit">
          {(["kanban", "tabella"] as const).map((v) => {
            const active = view === v;
            return (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md text-[12px] font-medium transition-colors"
                style={{
                  background: active ? "hsl(var(--v2-bg-elev))" : "transparent",
                  color: active ? "hsl(var(--v2-text))" : "hsl(var(--v2-text-dim))",
                  border: `1px solid ${active ? "hsl(var(--v2-border-strong))" : "transparent"}`,
                }}
              >
                {v === "kanban" ? "Kanban" : "Tabella"}
              </button>
            );
          })}
        </div>
      </div>

      {view === "kanban" ? (
        <GuestsKanban guests={filtered} leadBasePath={leadBasePath} />
      ) : (
        <GuestsTable guests={filtered} leadBasePath={leadBasePath} />
      )}

      <GuestAddFromLead open={addLeadOpen} onOpenChange={setAddLeadOpen} leads={leads} />
      <GuestAddExternal open={addExternalOpen} onOpenChange={setAddExternalOpen} />
    </div>
  );
}

function GuestsTable({ guests, leadBasePath }: { guests: PodcastGuest[]; leadBasePath: string }) {
  if (guests.length === 0) {
    return (
      <div className="v2-card p-10 text-center text-sm" style={{ color: "hsl(var(--v2-text-mute))" }}>
        Nessun ospite nel filtro corrente.
      </div>
    );
  }

  const GRID = "32px minmax(260px, 2fr) 80px 160px 140px 130px";

  return (
    <div className="v2-card overflow-hidden">
      <div className="overflow-x-auto">
        <div style={{ minWidth: "900px" }}>
          <div
            className="grid gap-3 px-4 py-3 v2-mono text-[10px] font-bold uppercase tracking-[0.14em]"
            style={{
              gridTemplateColumns: GRID,
              color: "hsl(var(--v2-text-mute))",
              borderBottom: "1px solid hsl(var(--v2-border))",
            }}
          >
            <span />
            <span>Ospite / Azienda</span>
            <span>Tier</span>
            <span>Categoria</span>
            <span>Stato</span>
            <span>Registrazione</span>
          </div>
          {guests.map((g) => {
            const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "—";
            const status = GUEST_STATUS_CONFIG[g.status];
            const SourceIcon = g.lead_id ? Building2 : UserSquare2;
            return (
              <Link
                key={g.id}
                href={g.lead_id ? `${leadBasePath}/${g.lead_id}` : `#external-${g.id}`}
                className="grid gap-3 px-4 py-3 items-center transition-colors hover:bg-white/[0.02]"
                style={{
                  gridTemplateColumns: GRID,
                  borderBottom: "1px solid hsl(var(--v2-border))",
                }}
              >
                <SourceIcon className="w-4 h-4" style={{ color: "hsl(var(--v2-text-mute))" }} />
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                    {name}
                  </div>
                  {g.external_role && (
                    <div className="v2-mono text-[10.5px] truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
                      {g.external_role}
                    </div>
                  )}
                </div>
                <span
                  className="v2-mono text-[11px]"
                  style={{ color: g.tier ? "hsl(var(--v2-text))" : "hsl(var(--v2-text-mute))" }}
                >
                  {g.tier ? `T${g.tier}` : "—"}
                </span>
                <span className="v2-mono text-[11px] truncate" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {g.category ? GUEST_CATEGORY_LABEL[g.category].split(" ")[0] : "—"}
                </span>
                <span
                  className="v2-mono inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded w-fit"
                  style={{
                    background: `${status.color}18`,
                    color: status.color,
                    border: `1px solid ${status.color}44`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: status.color }} />
                  {status.label}
                </span>
                <span className="v2-mono text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
                  {g.recorded_at ? new Date(g.recorded_at).toLocaleDateString("it-IT") : "—"}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function GuestsKanban({ guests, leadBasePath }: { guests: PodcastGuest[]; leadBasePath: string }) {
  const [local, setLocal] = useState<Record<string, GuestStatus>>({});
  const [, startTransition] = useTransition();

  const withOverrides = guests.map((g) => (local[g.id] ? { ...g, status: local[g.id] } : g));

  function onDragEnd(r: DropResult) {
    if (!r.destination) return;
    if (r.destination.droppableId === r.source.droppableId) return;
    const next = r.destination.droppableId as GuestStatus;
    setLocal((p) => ({ ...p, [r.draggableId]: next }));
    startTransition(async () => {
      const res = await updateGuestStatus({ id: r.draggableId, status: next });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
        setLocal((p) => {
          const c = { ...p };
          delete c[r.draggableId];
          return c;
        });
      } else {
        toast.success(`→ ${GUEST_STATUS_CONFIG[next].label}`);
      }
    });
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-3 overflow-x-auto pb-4 scroll-x-contained">
        {GUEST_STATUSES.map((s) => {
          const cfg = GUEST_STATUS_CONFIG[s];
          const items = withOverrides.filter((g) => g.status === s);
          return (
            <div
              key={s}
              className="v2-card w-[260px] shrink-0 flex flex-col"
              style={{ padding: "12px" }}
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: cfg.color }} />
                  <span className="v2-mono text-[10.5px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text))" }}>
                    {cfg.label}
                  </span>
                </div>
                <span
                  className="v2-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: "hsl(var(--v2-border))", color: "hsl(var(--v2-text-dim))" }}
                >
                  {items.length}
                </span>
              </div>
              <Droppable droppableId={s}>
                {(prov, snap) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.droppableProps}
                    className="flex-1 min-h-[120px] max-h-[65vh] overflow-y-auto rounded-md p-1 transition-colors flex flex-col gap-2"
                    style={{
                      background: snap.isDraggingOver ? "hsl(var(--v2-accent) / 0.08)" : "transparent",
                      boxShadow: snap.isDraggingOver ? "inset 0 0 0 1px hsl(var(--v2-accent) / 0.4)" : "none",
                    }}
                  >
                    {items.map((g, idx) => {
                      const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "—";
                      const waDigits = (g.response_whatsapp ?? "").replace(/\D/g, "");
                      return (
                        <Draggable key={g.id} draggableId={g.id} index={idx}>
                          {(d, ds) => (
                            <Link
                              href={g.lead_id ? `${leadBasePath}/${g.lead_id}` : `#external-${g.id}`}
                              ref={d.innerRef}
                              {...d.draggableProps}
                              {...d.dragHandleProps}
                              className="block select-none"
                              style={{
                                ...d.draggableProps.style,
                                background: "hsl(var(--v2-bg-elev))",
                                border: `1px solid ${ds.isDragging ? "hsl(var(--v2-accent))" : "hsl(var(--v2-border))"}`,
                                borderRadius: "8px",
                                padding: "10px",
                                cursor: ds.isDragging ? "grabbing" : "pointer",
                                boxShadow: ds.isDragging
                                  ? "0 10px 28px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(var(--v2-accent) / 0.3)"
                                  : "none",
                              }}
                            >
                              <div className="text-[12.5px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                                {name}
                              </div>
                              {g.external_role && (
                                <div className="v2-mono text-[10.5px] truncate mt-0.5" style={{ color: "hsl(var(--v2-text-mute))" }}>
                                  {g.external_role}
                                </div>
                              )}
                              {g.response_name && (
                                <div className="flex items-center gap-1.5 mt-1.5 text-[11px]" style={{ color: "hsl(var(--v2-accent))" }}>
                                  <User className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{g.response_name}</span>
                                </div>
                              )}
                              {g.response_whatsapp && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    if (waDigits) window.open(`https://wa.me/${waDigits}`, "_blank");
                                  }}
                                  className="flex items-center gap-1.5 mt-1 text-[11px] hover:underline"
                                  style={{ color: "hsl(var(--v2-accent))" }}
                                >
                                  <MessageCircle className="w-3 h-3 shrink-0" />
                                  <span className="truncate">{g.response_whatsapp}</span>
                                </button>
                              )}
                            </Link>
                          )}
                        </Draggable>
                      );
                    })}
                    {prov.placeholder}
                    {items.length === 0 && !snap.isDraggingOver && (
                      <div
                        className="v2-mono text-[10px] text-center py-6 rounded-md"
                        style={{
                          color: "hsl(var(--v2-text-mute))",
                          border: "1px dashed hsl(var(--v2-border))",
                        }}
                      >
                        Trascina qui
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </DragDropContext>
  );
}

