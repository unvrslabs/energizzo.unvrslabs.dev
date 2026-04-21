"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createGuestFromLead } from "@/actions/podcast-guest";
import { useRouter } from "next/navigation";
import type { Lead } from "@/lib/types";

type LeadMini = Pick<Lead, "id" | "ragione_sociale" | "piva" | "provincia">;

export function GuestAddFromLead({
  open,
  onOpenChange,
  leads,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  leads: LeadMini[];
}) {
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const router = useRouter();

  const matches = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return leads.slice(0, 30);
    return leads
      .filter((l) => l.ragione_sociale.toLowerCase().includes(needle) || l.piva.includes(needle))
      .slice(0, 30);
  }, [q, leads]);

  async function confirm() {
    if (!selected) return;
    const res = await createGuestFromLead({ lead_id: selected });
    if (!res.ok) {
      toast.error(res.error ?? "Errore creazione");
      return;
    }
    toast.success("Ospite aggiunto");
    onOpenChange(false);
    router.push(`/dashboard/podcast/ospiti/${res.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Aggiungi ospite da lead CRM</DialogTitle>
        </DialogHeader>
        <input
          autoFocus
          placeholder="Cerca ragione sociale o P.IVA…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="w-full bg-white/5 rounded-lg px-3 py-2 text-sm outline-none border border-white/10"
        />
        <div className="max-h-64 overflow-auto space-y-1">
          {matches.map((l) => (
            <button
              key={l.id}
              onClick={() => setSelected(l.id)}
              className={`w-full text-left rounded-lg px-3 py-2 text-sm ${
                selected === l.id ? "bg-primary/20 text-primary" : "hover:bg-white/5"
              }`}
            >
              <div className="font-semibold">{l.ragione_sociale}</div>
              <div className="text-xs text-muted-foreground">
                {l.piva} {l.provincia ? `· ${l.provincia}` : ""}
              </div>
            </button>
          ))}
          {matches.length === 0 && (
            <div className="text-center text-sm text-muted-foreground py-4">
              Nessun lead trovato.
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            className="px-4 h-9 rounded-full text-sm bg-white/5"
            onClick={() => onOpenChange(false)}
          >
            Annulla
          </button>
          <button
            onClick={confirm}
            disabled={!selected}
            className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-50"
          >
            Aggiungi
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
