"use client";

import { useRef, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable, type DropResult } from "@hello-pangea/dnd";
import { toast } from "sonner";
import { Paperclip } from "lucide-react";
import { STATUS_CONFIG, STATUSES_IN_ORDER, type Status } from "@/lib/status-config";
import { updateLeadStatus } from "@/actions/update-lead";
import type { Lead } from "@/lib/types";

const HIDDEN_BY_DEFAULT: Status[] = ["chiuso_perso", "non_interessato"];

export function KanbanBoardV2({
  leads,
  onSelect,
}: {
  leads: Lead[];
  onSelect: (id: string) => void;
}) {
  const [showClosed, setShowClosed] = useState(false);
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
    <div className="flex flex-col gap-3">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowClosed((v) => !v)}
          className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] hover:text-white transition-colors"
          style={{ color: "hsl(var(--v2-text-mute))" }}
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
                className="v2-card w-[280px] shrink-0 flex flex-col"
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
                    style={{
                      background: "hsl(var(--v2-border))",
                      color: "hsl(var(--v2-text-dim))",
                    }}
                  >
                    {items.length}
                  </span>
                </div>
                <Droppable droppableId={s}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 min-h-[120px] max-h-[60vh] overflow-y-auto rounded-md p-1 transition-colors flex flex-col gap-2"
                      style={{
                        background: snapshot.isDraggingOver ? "hsl(var(--v2-accent) / 0.08)" : "transparent",
                        boxShadow: snapshot.isDraggingOver ? `inset 0 0 0 1px hsl(var(--v2-accent) / 0.4)` : "none",
                      }}
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
                                background: "hsl(var(--v2-bg-elev))",
                                border: `1px solid ${snap.isDragging ? "hsl(var(--v2-accent))" : "hsl(var(--v2-border))"}`,
                                borderRadius: "8px",
                                padding: "10px",
                                boxShadow: snap.isDragging
                                  ? "0 10px 28px hsl(0 0% 0% / 0.5), 0 0 0 1px hsl(var(--v2-accent) / 0.3)"
                                  : "none",
                                transform: snap.isDragging ? `${prov.draggableProps.style?.transform ?? ""} scale(1.02)` : prov.draggableProps.style?.transform,
                              }}
                              className="select-none"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div className="text-[12.5px] font-medium leading-tight line-clamp-2 min-w-0 flex-1" style={{ color: "hsl(var(--v2-text))" }}>
                                  {lead.ragione_sociale}
                                </div>
                                {(lead.documents_count ?? 0) > 0 && (
                                  <span
                                    className="v2-mono inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[9.5px] font-bold rounded shrink-0"
                                    style={{
                                      background: "hsl(var(--v2-accent) / 0.12)",
                                      border: "1px solid hsl(var(--v2-accent) / 0.25)",
                                      color: "hsl(var(--v2-accent))",
                                    }}
                                    title={`${lead.documents_count} documenti`}
                                  >
                                    <Paperclip className="w-2.5 h-2.5" />
                                    {lead.documents_count}
                                  </span>
                                )}
                              </div>
                              <div className="mt-1.5 flex items-center justify-between v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
                                <span>{lead.provincia ?? "—"}</span>
                                <span>
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
    </div>
  );
}
