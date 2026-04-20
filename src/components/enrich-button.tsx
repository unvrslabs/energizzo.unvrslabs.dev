"use client";

import { useTransition } from "react";
import { UserSearch, Loader2, Linkedin } from "lucide-react";
import { toast } from "sonner";
import { enrichContacts } from "@/actions/enrich-contacts";
import { cn } from "@/lib/utils";

type Props = {
  leadId: string;
  piva: string;
  enrichedAt: string | null;
  notesCount?: number;
};

export function EnrichButton({ leadId, piva, enrichedAt }: Props) {
  const [pending, startTransition] = useTransition();

  function handle(e: React.MouseEvent) {
    e.stopPropagation();
    startTransition(async () => {
      const res = await enrichContacts({ lead_id: leadId, piva });
      if (!res.ok) toast.error(`Errore: ${res.error}`);
      else if (res.count === 0) toast.info("Nessun titolare trovato");
      else toast.success(`${res.count} titolari trovati`);
    });
  }

  return (
    <button
      type="button"
      onClick={handle}
      disabled={pending}
      title={enrichedAt ? `Aggiornato ${new Date(enrichedAt).toLocaleDateString("it-IT")}` : "Cerca titolari"}
      className={cn(
        "inline-flex h-7 w-7 items-center justify-center rounded-md border transition-all",
        enrichedAt
          ? "border-primary/50 bg-primary/10 text-primary hover:bg-primary/20"
          : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary",
        pending && "opacity-60",
      )}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserSearch className="h-3.5 w-3.5" />}
    </button>
  );
}

export function LinkedInLink({ url, name }: { url: string; name: string }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      title={`Cerca ${name} su LinkedIn`}
      className="inline-flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:text-[#0A66C2] hover:bg-[#0A66C2]/10 transition-colors"
      onClick={(e) => e.stopPropagation()}
    >
      <Linkedin className="h-3.5 w-3.5" />
    </a>
  );
}
