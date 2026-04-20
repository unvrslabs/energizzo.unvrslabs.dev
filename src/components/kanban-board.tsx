"use client";

import { useOptimistic, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
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
  const [optimistic, setOptimistic] = useOptimistic(
    leads,
    (state, update: { id: string; status: Status }) =>
      state.map((l) => (l.id === update.id ? { ...l, status: update.status } : l)),
  );
  const [, startTransition] = useTransition();

  const columns = STATUSES_IN_ORDER.filter((s) => showClosed || !HIDDEN_BY_DEFAULT.includes(s));

  function handleDragEnd(result: DropResult) {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId) return;
    const next = destination.droppableId as Status;
    startTransition(async () => {
      setOptimistic({ id: draggableId, status: next });
      const res = await updateLeadStatus({ id: draggableId, status: next });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
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
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-3 overflow-x-auto pb-4">
          {columns.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const items = optimistic.filter((l) => l.status === s);
            return (
              <Droppable key={s} droppableId={s}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`glass rounded-lg p-3 w-[280px] shrink-0 flex flex-col ${
                      snapshot.isDraggingOver ? "ring-2 ring-primary/50" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                        <span className="text-sm font-semibold">{cfg.label}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono">{items.length}</span>
                    </div>
                    <div className="flex-1 space-y-2 min-h-[100px] max-h-[60vh] overflow-y-auto">
                      {items.map((lead, idx) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={idx}>
                          {(prov, snap) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              onClick={() => onSelect(lead.id)}
                              className={`glass rounded-md p-2.5 text-sm cursor-pointer hover:ring-1 hover:ring-primary/30 transition-all ${
                                snap.isDragging ? "ring-2 ring-primary shadow-lg shadow-primary/30 scale-[1.02]" : ""
                              }`}
                            >
                              <div className="font-medium leading-tight line-clamp-2">
                                {lead.ragione_sociale}
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
                      {items.length === 0 && (
                        <div className="text-xs text-muted-foreground/50 text-center py-4">
                          Vuoto
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
}
