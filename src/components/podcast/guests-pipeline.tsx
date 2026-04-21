"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Building2, UserSquare2 } from "lucide-react";
import { toast } from "sonner";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { cn } from "@/lib/utils";
import {
  GUEST_STATUS_CONFIG,
  GUEST_CATEGORY_LABEL,
  GUEST_STATUSES,
  type GuestStatus,
} from "@/lib/podcast-config";
import { updateGuestStatus } from "@/actions/podcast-guest";
import { GuestAddFromLead } from "./guest-add-from-lead";
import { GuestAddExternal } from "./guest-add-external";
import type { PodcastGuest, Lead } from "@/lib/types";

type LeadMini = Pick<Lead, "id" | "ragione_sociale" | "piva" | "provincia" | "email" | "telefoni">;

type Props = {
  guests: PodcastGuest[];
  leads: LeadMini[];
};

export function GuestsPipeline({ guests, leads }: Props) {
  const [view, setView] = useState<"tabella" | "kanban">("kanban");
  const [query, setQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<number | null>(null);
  const [addLeadOpen, setAddLeadOpen] = useState(false);
  const [addExternalOpen, setAddExternalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return guests.filter((g) => {
      if (tierFilter !== null && g.tier !== tierFilter) return false;
      if (!q) return true;
      const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "";
      return name.toLowerCase().includes(q);
    });
  }, [guests, query, tierFilter]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-2xl tracking-wide">Pipeline ospiti</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAddLeadOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Da lead CRM
          </button>
          <button
            onClick={() => setAddExternalOpen(true)}
            className="inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold bg-white/5 hover:bg-white/10"
          >
            <Plus className="h-4 w-4" /> Esterno
          </button>
        </div>
      </div>

      <div className="liquid-glass rounded-2xl p-3 flex items-center gap-3 flex-wrap">
        <input
          type="search"
          placeholder="Cerca ospite…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 min-w-[200px] bg-transparent outline-none text-sm px-3"
        />
        <select
          value={tierFilter ?? ""}
          onChange={(e) => setTierFilter(e.target.value ? Number(e.target.value) : null)}
          className="bg-transparent text-sm border border-white/10 rounded-full px-3 h-9"
        >
          <option value="">Tutti i tier</option>
          <option value="1">Tier 1</option>
          <option value="2">Tier 2</option>
          <option value="3">Tier 3</option>
        </select>
        <div className="flex rounded-full border border-white/10 p-0.5">
          {(["tabella", "kanban"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={cn(
                "px-3 h-8 rounded-full text-xs font-semibold",
                view === v ? "bg-primary text-primary-foreground" : "text-muted-foreground",
              )}
            >
              {v === "tabella" ? "Tabella" : "Kanban"}
            </button>
          ))}
        </div>
      </div>

      {view === "tabella" ? <GuestsTable guests={filtered} /> : <GuestsKanban guests={filtered} />}

      <GuestAddFromLead open={addLeadOpen} onOpenChange={setAddLeadOpen} leads={leads} />
      <GuestAddExternal open={addExternalOpen} onOpenChange={setAddExternalOpen} />
    </div>
  );
}

function GuestsTable({ guests }: { guests: PodcastGuest[] }) {
  if (guests.length === 0) {
    return (
      <div className="liquid-glass rounded-2xl py-14 text-center text-muted-foreground text-sm">
        Nessun ospite ancora. Inizia aggiungendone uno dal CRM.
      </div>
    );
  }
  return (
    <div className="liquid-glass rounded-2xl overflow-hidden">
      <div className="grid grid-cols-[24px_1.5fr_100px_120px_140px_140px] items-center gap-0 bg-[hsl(215_35%_14%)] border-b border-primary/25 text-[10px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
        <div className="px-3 py-3" />
        <div className="px-4 py-3">Ospite / Azienda</div>
        <div className="px-4 py-3">Tier</div>
        <div className="px-4 py-3">Categoria</div>
        <div className="px-4 py-3">Stato</div>
        <div className="px-4 py-3">Registrazione</div>
      </div>
      {guests.map((g, i) => {
        const name = g.lead?.ragione_sociale ?? g.external_company ?? g.external_name ?? "—";
        const sourceIcon = g.lead_id ? (
          <Building2 className="h-3.5 w-3.5" />
        ) : (
          <UserSquare2 className="h-3.5 w-3.5" />
        );
        const status = GUEST_STATUS_CONFIG[g.status];
        return (
          <Link
            key={g.id}
            href={`/dashboard/podcast/ospiti/${g.id}`}
            className={cn(
              "grid grid-cols-[24px_1.5fr_100px_120px_140px_140px] items-center gap-0 border-b border-white/5 hover:bg-primary/5 transition-colors text-sm",
              i % 2 === 0 ? "bg-white/[0.015]" : "bg-transparent",
            )}
          >
            <div className="px-3 py-3 text-muted-foreground">{sourceIcon}</div>
            <div className="px-4 py-3 font-semibold truncate">{name}</div>
            <div className="px-4 py-3 text-muted-foreground">{g.tier ? `T${g.tier}` : "—"}</div>
            <div className="px-4 py-3 text-muted-foreground text-xs truncate">
              {g.category ? GUEST_CATEGORY_LABEL[g.category].split(" ")[0] : "—"}
            </div>
            <div className="px-4 py-3">
              <span
                className="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                style={{
                  backgroundColor: `${status.color}20`,
                  color: status.color,
                  border: `1px solid ${status.color}50`,
                }}
              >
                {status.label}
              </span>
            </div>
            <div className="px-4 py-3 text-xs text-muted-foreground">
              {g.recorded_at ? new Date(g.recorded_at).toLocaleDateString("it-IT") : "—"}
            </div>
          </Link>
        );
      })}
    </div>
  );
}

function GuestsKanban({ guests }: { guests: PodcastGuest[] }) {
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
          const items = withOverrides.filter((g) => g.status === s);
          return (
            <div key={s} className="glass rounded-lg p-3 w-[280px] shrink-0 flex flex-col">
              <div className="flex items-center justify-between mb-3 px-1">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: GUEST_STATUS_CONFIG[s].color }}
                >
                  {GUEST_STATUS_CONFIG[s].label}
                </span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <Droppable droppableId={s}>
                {(prov) => (
                  <div
                    ref={prov.innerRef}
                    {...prov.droppableProps}
                    className="space-y-2 min-h-[40px]"
                  >
                    {items.map((g, idx) => {
                      const name =
                        g.lead?.ragione_sociale ??
                        g.external_company ??
                        g.external_name ??
                        "—";
                      return (
                        <Draggable key={g.id} draggableId={g.id} index={idx}>
                          {(d) => (
                            <Link
                              href={`/dashboard/podcast/ospiti/${g.id}`}
                              ref={d.innerRef}
                              {...d.draggableProps}
                              {...d.dragHandleProps}
                              className="block rounded-lg bg-white/5 p-3 text-sm hover:bg-white/10 transition-colors"
                            >
                              <div className="font-semibold truncate">{name}</div>
                              {g.tier && (
                                <div className="text-[10px] text-muted-foreground mt-1">
                                  Tier {g.tier}
                                </div>
                              )}
                            </Link>
                          )}
                        </Draggable>
                      );
                    })}
                    {prov.placeholder}
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
