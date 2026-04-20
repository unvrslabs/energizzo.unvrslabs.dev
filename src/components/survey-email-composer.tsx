"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ExternalLink,
  Copy,
  FileCode,
  FileText,
  Mail,
  RefreshCw,
  Video,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Props = {
  leadId: string;
  companyName: string;
  defaultRecipientName?: string;
};

export function SurveyEmailComposer({ leadId, companyName, defaultRecipientName }: Props) {
  const [open, setOpen] = useState(false);
  const [recipientName, setRecipientName] = useState(defaultRecipientName ?? "");
  const [customMessage, setCustomMessage] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState("");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams({ lead_id: leadId });
    if (recipientName) params.set("recipient_name", recipientName);
    if (customMessage) params.set("custom_message", customMessage);
    if (videoUrl) params.set("video_url", videoUrl);
    if (videoThumbnailUrl) params.set("video_thumbnail_url", videoThumbnailUrl);
    return `/api/email-preview?${params.toString()}`;
  }, [leadId, recipientName, customMessage, videoUrl, videoThumbnailUrl]);

  const textUrl = previewUrl + "&format=text";

  useEffect(() => {
    if (!open) return;
    const id = setTimeout(() => setIframeKey((k) => k + 1), 400);
    return () => clearTimeout(id);
  }, [previewUrl, open]);

  async function copy(url: string, setFlag: (v: boolean) => void) {
    try {
      const resp = await fetch(url);
      const body = await resp.text();
      await navigator.clipboard.writeText(body);
      setFlag(true);
      toast.success("Copiato negli appunti");
      setTimeout(() => setFlag(false), 2000);
    } catch {
      toast.error("Impossibile copiare");
    }
  }

  if (!open) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Mail className="h-3.5 w-3.5" /> Componi email survey
      </Button>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-display text-xs font-semibold uppercase tracking-widest text-primary">
          Componi email survey
        </h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-[11px] text-muted-foreground hover:text-foreground"
        >
          Chiudi
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Nome destinatario (opz.)
          </Label>
          <Input
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Es. Sergio"
            className="h-9 rounded-xl text-sm"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Video URL (opz.)
          </Label>
          <div className="relative">
            <Video className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://loom.com/share/..."
              className="h-9 rounded-xl text-sm pl-8"
            />
          </div>
        </div>
      </div>

      {videoUrl && (
        <div className="space-y-1">
          <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
            Thumbnail video URL
          </Label>
          <Input
            value={videoThumbnailUrl}
            onChange={(e) => setVideoThumbnailUrl(e.target.value)}
            placeholder="https://.../thumb.jpg (obbligatorio se c'è un video)"
            className="h-9 rounded-xl text-sm"
          />
        </div>
      )}

      <div className="space-y-1">
        <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">
          Messaggio personalizzato (opz.)
        </Label>
        <Textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder={`Sostituisce il paragrafo standard. Lascia vuoto per il default che menziona "${companyName}".`}
          rows={3}
          className="text-sm rounded-xl"
        />
      </div>

      <div className="liquid-glass rounded-2xl overflow-hidden border-white/10">
        <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/5">
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-semibold">
            Anteprima email
          </span>
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="inline-flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="h-3 w-3" />
            Aggiorna
          </button>
        </div>
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-[420px] bg-[#0a1420]"
          sandbox="allow-same-origin"
          title="Anteprima email survey"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3 h-9 text-xs font-semibold text-foreground hover:bg-white/10 hover:border-primary/50 transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Apri in tab
        </a>
        <button
          type="button"
          onClick={() => copy(previewUrl, setCopiedHtml)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3 h-9 text-xs font-semibold text-foreground hover:bg-white/10 hover:border-primary/50 transition-all"
        >
          {copiedHtml ? <Check className="h-3.5 w-3.5 text-primary" /> : <FileCode className="h-3.5 w-3.5" />}
          Copia HTML
        </button>
        <button
          type="button"
          onClick={() => copy(textUrl, setCopiedText)}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 backdrop-blur-md px-3 h-9 text-xs font-semibold text-foreground hover:bg-white/10 hover:border-primary/50 transition-all"
        >
          {copiedText ? <Check className="h-3.5 w-3.5 text-primary" /> : <FileText className="h-3.5 w-3.5" />}
          Copia testo
        </button>
      </div>

      <p className="text-[11px] text-muted-foreground leading-relaxed">
        💡 <strong>Come usarlo</strong>: clicca &quot;Copia HTML&quot; e incolla in Gmail/Outlook/Superhuman (modalità HTML). Oppure
        &quot;Apri in tab&quot; → tasto destro → Salva pagina con nome, poi allega.
      </p>
    </div>
  );
}
