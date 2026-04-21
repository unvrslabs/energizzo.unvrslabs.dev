"use client";

import { useState } from "react";
import { toast } from "sonner";

export function InviteConfirmForm({
  token,
  defaultName,
}: {
  token: string;
  defaultName?: string;
}) {
  const [name, setName] = useState(defaultName ?? "");
  const [whatsapp, setWhatsapp] = useState("");
  const [availability, setAvailability] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !whatsapp.trim()) {
      toast.error("Nome e WhatsApp sono obbligatori");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/podcast-invite-confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          name: name.trim(),
          whatsapp: whatsapp.trim(),
          availability: availability.trim() || null,
        }),
      });
      const payload = await res.json();
      if (!res.ok || !payload.ok) {
        toast.error(payload.error ?? "Errore");
        return;
      }
      setDone(true);
      toast.success("Grazie! Ti contatteremo a breve.");
    } catch {
      toast.error("Errore di rete");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 p-4 text-sm">
        <p className="font-semibold text-emerald-300">Grazie {name}!</p>
        <p className="text-emerald-200/80 mt-1">
          Ti contatteremo a breve su WhatsApp per fissare la registrazione.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <label className="block text-sm space-y-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Nome e cognome di chi partecipa *
        </span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Es. Mario Rossi"
          className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10"
        />
      </label>
      <label className="block text-sm space-y-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Recapito WhatsApp *
        </span>
        <input
          required
          type="tel"
          placeholder="+39 ..."
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10"
        />
      </label>
      <label className="block text-sm space-y-1">
        <span className="text-xs text-muted-foreground uppercase tracking-wide">
          Disponibilità (facoltativo)
        </span>
        <textarea
          rows={3}
          placeholder="Es. la prossima settimana, preferibilmente mattina..."
          value={availability}
          onChange={(e) => setAvailability(e.target.value)}
          className="w-full bg-white/5 rounded-lg px-3 py-2 border border-white/10"
        />
      </label>
      <button
        type="submit"
        disabled={submitting}
        className="w-full h-11 rounded-full text-sm font-semibold bg-primary text-primary-foreground disabled:opacity-60"
      >
        {submitting ? "Invio…" : "Confermo la disponibilità"}
      </button>
    </form>
  );
}
