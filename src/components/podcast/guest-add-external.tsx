"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createExternalGuest } from "@/actions/podcast-guest";

export function GuestAddExternal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [form, setForm] = useState({
    external_name: "",
    external_company: "",
    external_role: "",
    external_email: "",
    external_linkedin: "",
  });
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.external_name.trim()) {
      toast.error("Il nome è obbligatorio");
      return;
    }
    const payload = {
      external_name: form.external_name.trim(),
      external_company: form.external_company.trim() || undefined,
      external_role: form.external_role.trim() || undefined,
      external_email: form.external_email.trim() || undefined,
      external_linkedin: form.external_linkedin.trim() || undefined,
    };
    const res = await createExternalGuest(payload);
    if (!res.ok) {
      toast.error(res.error ?? "Errore");
      return;
    }
    toast.success("Ospite esterno creato");
    onOpenChange(false);
    router.push(`/dashboard/podcast/ospiti/${res.id}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Aggiungi ospite esterno</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3">
          {(
            [
              ["external_name", "Nome *"],
              ["external_company", "Azienda"],
              ["external_role", "Ruolo"],
              ["external_email", "Email"],
              ["external_linkedin", "LinkedIn URL"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="block text-sm space-y-1">
              <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
              <input
                type={key === "external_email" ? "email" : key === "external_linkedin" ? "url" : "text"}
                value={form[key]}
                onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                className="w-full bg-white/5 rounded-lg px-3 py-2 outline-none border border-white/10"
              />
            </label>
          ))}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 h-9 rounded-full text-sm bg-white/5"
            >
              Annulla
            </button>
            <button
              type="submit"
              className="px-4 h-9 rounded-full text-sm font-semibold bg-primary text-primary-foreground"
            >
              Crea ospite
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
