"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Copy, Check, Mic, Radio, Send, MessageCircle, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { createGuestFromLead, updateGuest } from "@/actions/podcast-guest";
import type { PodcastGuest } from "@/lib/types";

const EPISODES: { slug: string; label: string }[] = [
  { slug: "01-transizione-stg-mercato-libero", label: "01 · STG verso libero" },
  { slug: "02-aste-stg-aggressive", label: "02 · Aste STG aggressive" },
  { slug: "03-concentrazione-m-and-a", label: "03 · Concentrazione & M&A" },
  { slug: "04-nuova-bolletta-2025", label: "04 · Nuova bolletta 2025" },
  { slug: "05-ai-leva-di-margine", label: "05 · AI leva di margine" },
  { slug: "06-recupero-crediti-post-2022", label: "06 · Recupero crediti post-2022" },
  { slug: "07-cer-comunita-energetiche", label: "07 · CER" },
  { slug: "08-telemarketing-teleselling", label: "08 · Telemarketing" },
  { slug: "09-unbundling-marchio", label: "09 · Unbundling marchio" },
  { slug: "10-smart-meter-gas", label: "10 · Smart meter gas" },
];

export function LeadPodcastInvite({ leadId }: { leadId: string }) {
  const [guest, setGuest] = useState<PodcastGuest | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("podcast_guests")
      .select("*")
      .eq("lead_id", leadId)
      .maybeSingle();
    setGuest((data as PodcastGuest | null) ?? null);
    setLoading(false);
  }

  useEffect(() => {
    void load();
  }, [leadId]);

  async function addGuest() {
    setCreating(true);
    const res = await createGuestFromLead({ lead_id: leadId });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else {
      toast.success("Aggiunto agli ospiti podcast");
      await load();
    }
    setCreating(false);
  }

  async function setEpisode(slug: string) {
    if (!guest) return;
    const res = await updateGuest({
      id: guest.id,
      patch: { selected_episode_slug: slug || null },
    });
    if (!res.ok) toast.error(res.error ?? "Errore");
    else {
      toast.success("Episodio aggiornato");
      await load();
    }
  }

  const origin =
    typeof window !== "undefined"
      ? window.location.origin
      : "https://leads.energizzo.it";
  const inviteUrl = guest?.invite_token
    ? `${origin}/podcast/invito/${guest.invite_token}`
    : null;

  async function copyLink() {
    if (!inviteUrl) return;
    await navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <section className="space-y-3">
      <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Mic className="h-3.5 w-3.5" /> Podcast &quot;Il Reseller&quot;
      </h3>

      {loading && (
        <div className="glass rounded-md p-3 text-xs text-muted-foreground">Carico…</div>
      )}

      {!loading && !guest && (
        <div className="glass rounded-md p-3 space-y-2">
          <p className="text-xs text-muted-foreground">
            Questo lead non è ancora nella pipeline podcast.
          </p>
          <Button size="sm" variant="outline" onClick={addGuest} disabled={creating}>
            <Send className="h-3.5 w-3.5" />
            {creating ? "Aggiungo…" : "Aggiungi a ospiti podcast"}
          </Button>
        </div>
      )}

      {!loading && guest && (
        <div className="glass rounded-md p-3 space-y-3">
          <label className="block text-xs space-y-1">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Episodio assegnato
            </span>
            <select
              value={guest.selected_episode_slug ?? ""}
              onChange={(e) => setEpisode(e.target.value)}
              className="block w-full bg-background/40 border border-border/40 rounded-sm px-2 py-1.5 text-xs"
            >
              <option value="">— Nessuno —</option>
              {EPISODES.map((ep) => (
                <option key={ep.slug} value={ep.slug}>
                  {ep.label}
                </option>
              ))}
            </select>
          </label>

          {inviteUrl && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <code className="flex-1 min-w-0 truncate rounded-sm bg-background/40 border border-border/40 px-2 py-1.5 text-[11px] font-mono text-muted-foreground">
                  {inviteUrl}
                </code>
                <Button size="sm" variant="outline" onClick={copyLink}>
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copiato" : "Copia"}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <a href={inviteUrl} target="_blank" rel="noreferrer">
                    <Radio className="h-3.5 w-3.5" /> Apri
                  </a>
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground">
                Invia questo link (WhatsApp, QR code, email). Pagina pubblica, no login.
              </p>
            </div>
          )}

          {guest.response_confirmed_at ? (
            <div className="rounded-md bg-emerald-500/10 border border-emerald-500/30 p-2 space-y-1">
              <p className="text-[11px] font-semibold text-emerald-300 flex items-center gap-1.5">
                <Check className="h-3 w-3" /> Confermato{" "}
                {new Date(guest.response_confirmed_at).toLocaleDateString("it-IT")}
              </p>
              {guest.response_name && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-200/80">
                  <User className="h-3 w-3" /> {guest.response_name}
                </div>
              )}
              {guest.response_whatsapp && (
                <a
                  href={`https://wa.me/${guest.response_whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-[11px] text-emerald-300 hover:underline"
                >
                  <MessageCircle className="h-3 w-3" /> {guest.response_whatsapp}
                </a>
              )}
              {guest.response_availability && (
                <p className="text-[11px] italic text-emerald-200/80">
                  &ldquo;{guest.response_availability}&rdquo;
                </p>
              )}
            </div>
          ) : (
            <p className="text-[10px] text-muted-foreground italic">
              In attesa di conferma. Lo stato passerà a &quot;Confermato&quot; al submit del
              form.
            </p>
          )}
        </div>
      )}
    </section>
  );
}
