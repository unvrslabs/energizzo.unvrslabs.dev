"use client";

import { useRef, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
import { STATUS_CONFIG, STATUSES_IN_ORDER, type Status } from "@/lib/status-config";
import { updateLeadStatus } from "@/actions/update-lead";
import type { Lead } from "@/lib/types";

type Props = {
  leads: Lead[];
  onSelect: (id: string) => void;
};

const HIDDEN_BY_DEFAULT: Status[] = ["chiuso_perso", "non_interessato"];

export function KanbanBoard({ leads, onSelect }: Props) {
  const [showClosed, setShowClosed] = useState(false);
  // Local optimistic state that persists while RSC revalidates so the card
  // doesn't snap back to its original column before the server confirms.
  const [localOverrides, setLocalOverrides] = useState<Record<string, Status>>({});
  const [, startTransition] = useTransition();
  const draggingRef = useRef(false);

  const withOverrides: Lead[] = leads.map((l) =>
    localOverrides[l.id] ? { ...l, status: localOverrides[l.id] } : l,
  );

  const columns = STATUSES_IN_ORDER.filter((s) => showClosed || !HIDDEN_BY_DEFAULT.includes(s));

  function handleDragEnd(result: DropResult) {
    draggingRef.current = false;
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const next = destination.droppableId as Status;
    setLocalOverrides((prev) => ({ ...prev, [draggableId]: next }));
    startTransition(async () => {
      const res = await updateLeadStatus({ id: draggableId, status: next });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
        setLocalOverrides((prev) => {
          const copy = { ...prev };
          delete copy[draggableId];
          return copy;
        });
      } else {
        toast.success(`→ ${STATUS_CONFIG[next].label}`);
      }
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowClosed((v) => !v)}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showClosed ? "Nascondi stati conclusi" : "Mostra stati conclusi"}
        </button>
      </div>
      <DragDropContext
        onDragStart={() => {
          draggingRef.current = true;
        }}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 overflow-x-auto pb-4 scroll-x-contained">
          {columns.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const items = withOverrides.filter((l) => l.status === s);
            return (
              <div
                key={s}
                className="glass rounded-lg p-3 w-[280px] shrink-0 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: cfg.color }}
                    />
                    <span className="text-sm font-semibold">{cfg.label}</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">{items.length}</span>
                </div>
                <Droppable droppableId={s}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex-1 space-y-2 min-h-[120px] max-h-[60vh] overflow-y-auto rounded-md p-1 transition-colors ${
                        snapshot.isDraggingOver ? "bg-primary/10 ring-2 ring-primary/40" : ""
                      }`}
                    >
                      {items.map((lead, idx) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={(e) => {
                                if (draggingRef.current || snap.isDragging) {
                                  e.preventDefault();
                                  return;
                                }
                                onSelect(lead.id);
                              }}
                              style={{
                                ...prov.draggableProps.style,
                                cursor: snap.isDragging ? "grabbing" : "pointer",
                              }}
                              className={`liquid-glass-card-sm p-2.5 text-sm select-none ${
                                snap.isDragging
                                  ? "ring-2 ring-primary shadow-xl shadow-primary/40 scale-[1.02]"
                                  : "hover:ring-1 hover:ring-primary/30"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="font-medium leading-tight line-clamp-2 min-w-0 flex-1">
                                  {lead.ragione_sociale}
                                </div>
                                {(lead.documents_count ?? 0) > 0 && (
                                  <span
                                    className="inline-flex items-center gap-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary px-1.5 py-0.5 text-[10px] font-semibold shrink-0"
                                    title={`${lead.documents_count} documenti`}
                                  >
                                    <Paperclip className="h-2.5 w-2.5" />
                                    {lead.documents_count}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                <span>{lead.provincia ?? "—"}</span>
                                <span className="text-[10px]">
                                  {lead.tipo_servizio === "Dual (Ele+Gas)"
                                    ? "Dual"
                                    : lead.tipo_servizio.replace("Solo ", "")}
                                </span>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      {items.length === 0 && !snapshot.isDraggingOver && (
                        <div className="text-xs text-muted-foreground/50 text-center py-6 border-2 border-dashed border-border/30 rounded-md">
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
    </div>
  );
}
