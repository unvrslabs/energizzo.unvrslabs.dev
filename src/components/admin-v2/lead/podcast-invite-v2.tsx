"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, Copy, Loader2, MessageCircle, Radio, Send, User } from "lucide-react";
import { createGuestFromLead, updateGuest } from "@/actions/podcast-guest";
import { getPodcastInviteUrl } from "@/lib/public-urls";
import type { PodcastGuest } from "@/lib/types";

const EPISODES: { slug: string; label: string }[] = [
  { slug: "01-transizione-stg-mercato-libero", label: "01 · STG verso libero" },
  { slug: "02-aste-stg-aggressive", label: "02 · Aste STG aggressive" },
  { slug: "03-concentrazione-m-and-a", label: "03 · Concentrazione & M&A" },
  { slug: "04-nuova-bolletta-2025", label: "04 · Nuova bolletta 2025" },
  { slug: "05-ai-leva-di-margine", label: "05 · AI leva di margine" },
  { slug: "06-recupero-crediti-post-2022", label: "06 · Recupero crediti" },
  { slug: "07-cer-comunita-energetiche", label: "07 · CER" },
  { slug: "08-telemarketing-teleselling", label: "08 · Telemarketing" },
  { slug: "09-unbundling-marchio", label: "09 · Unbundling marchio" },
  { slug: "10-smart-meter-gas", label: "10 · Smart meter gas" },
];

export function LeadPodcastInviteV2({
  leadId,
  initialGuest = null,
}: {
  leadId: string;
  initialGuest?: PodcastGuest | null;
}) {
  const router = useRouter();
  const [guest, setGuest] = useState<PodcastGuest | null>(initialGuest);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  // Sync con props quando il server revalida
  useEffect(() => {
    setGuest(initialGuest);
  }, [initialGuest]);

  async function addGuest() {
    setCreating(true);
    const res = await createGuestFromLead({ lead_id: leadId });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else {
      toast.success("Aggiunto agli ospiti podcast");
      router.refresh();
    }
    setCreating(false);
  }

  async function setEpisode(slug: string) {
    if (!guest) return;
    const res = await updateGuest({ id: guest.id, patch: { selected_episode_slug: slug || null } });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else {
      toast.success("Episodio aggiornato");
      router.refresh();
    }
  }

  const inviteUrl = guest?.invite_token ? getPodcastInviteUrl(guest.invite_token) : null;

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success("Link invito copiato");
    setTimeout(() => setCopied(false), 2000);
  }

  if (!guest) {
    return (
      <div className="flex flex-col gap-3">
        <p className="text-[12.5px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
          Questo lead non è ancora nella pipeline podcast.
          Aggiungilo per generare un link di invito nominale.
        </p>
        <button
          type="button"
          onClick={addGuest}
          disabled={creating}
          className="v2-btn v2-btn--primary w-fit"
        >
          {creating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          Aggiungi a ospiti podcast
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Episodio assegnato
        </span>
        <select
          value={guest.selected_episode_slug ?? ""}
          onChange={(e) => setEpisode(e.target.value)}
          className="rounded-md px-3 py-2 text-[13px] outline-none"
          style={{
            background: "hsl(var(--v2-bg-elev))",
            border: "1px solid hsl(var(--v2-border))",
            color: "hsl(var(--v2-text))",
          }}
        >
          <option value="">— Nessuno —</option>
          {EPISODES.map((ep) => (
            <option key={ep.slug} value={ep.slug}>
              {ep.label}
            </option>
          ))}
        </select>
      </div>

      {inviteUrl && (
        <div className="flex flex-col gap-1.5">
          <span className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Link invito (pubblico)
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            <code
              className="flex-1 min-w-[200px] truncate rounded px-2 py-1.5 v2-mono text-[11px]"
              style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))", color: "hsl(var(--v2-text-dim))" }}
            >
              {inviteUrl}
            </code>
            <button type="button" onClick={copyLink} className="v2-btn">
              {copied ? <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? "Copiato" : "Copia"}
            </button>
            <a href={inviteUrl} target="_blank" rel="noreferrer" className="v2-btn">
              <Radio className="w-3.5 h-3.5" />
              Apri
            </a>
          </div>
          <p className="text-[11px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Invia via WhatsApp, QR code o email. Pagina pubblica, no login.
          </p>
        </div>
      )}

      {guest.response_confirmed_at ? (
        <div
          className="p-3 rounded-md flex flex-col gap-1.5"
          style={{
            background: "hsl(var(--v2-accent) / 0.1)",
            border: "1px solid hsl(var(--v2-accent) / 0.3)",
          }}
        >
          <p className="v2-mono text-[11px] font-bold uppercase tracking-[0.14em] inline-flex items-center gap-1.5" style={{ color: "hsl(var(--v2-accent))" }}>
            <Check className="w-3 h-3" />
            Confermato {new Date(guest.response_confirmed_at).toLocaleDateString("it-IT")}
          </p>
          {guest.response_name && (
            <div className="flex items-center gap-1.5 text-[12px]" style={{ color: "hsl(var(--v2-text))" }}>
              <User className="w-3 h-3" />
              {guest.response_name}
            </div>
          )}
          {guest.response_whatsapp && (
            <a
              href={`https://wa.me/${guest.response_whatsapp.replace(/\D/g, "")}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-[12px] hover:underline"
              style={{ color: "hsl(var(--v2-accent))" }}
            >
              <MessageCircle className="w-3 h-3" />
              {guest.response_whatsapp}
            </a>
          )}
          {guest.response_availability && (
            <p className="text-[11.5px] italic" style={{ color: "hsl(var(--v2-text-dim))" }}>
              &ldquo;{guest.response_availability}&rdquo;
            </p>
          )}
        </div>
      ) : (
        <p className="text-[11px] italic" style={{ color: "hsl(var(--v2-text-mute))" }}>
          In attesa di conferma. Lo stato passerà a &quot;Confermato&quot; al submit del form pubblico.
        </p>
      )}
    </div>
  );
}
