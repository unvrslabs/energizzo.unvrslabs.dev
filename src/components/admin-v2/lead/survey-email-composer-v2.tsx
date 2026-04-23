"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { Check, Copy, ExternalLink, FileCode, FileText, Mail, RefreshCw, Video } from "lucide-react";

type Props = {
  leadId: string;
  companyName: string;
  defaultRecipientName?: string;
};

export function SurveyEmailComposerV2({ leadId, companyName, defaultRecipientName }: Props) {
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
      <button type="button" onClick={() => setOpen(true)} className="v2-btn w-fit">
        <Mail className="w-3.5 h-3.5" />
        Componi email survey
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-3 rounded-md" style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}>
      <div className="flex items-center justify-between">
        <h4 className="v2-mono text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: "hsl(var(--v2-accent))" }}>
          Componi email survey
        </h4>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="v2-mono text-[10px] hover:text-white transition-colors"
          style={{ color: "hsl(var(--v2-text-mute))" }}
        >
          Chiudi
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Nome destinatario (opz.)">
          <input
            type="text"
            value={recipientName}
            onChange={(e) => setRecipientName(e.target.value)}
            placeholder="Es. Sergio"
            className="rounded-md px-3 py-1.5 text-[12.5px] outline-none w-full"
            style={{ background: "hsl(var(--v2-card))", border: "1px solid hsl(var(--v2-border))", color: "hsl(var(--v2-text))" }}
          />
        </Field>

        <Field label="Video URL (opz.)">
          <div className="relative">
            <Video className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://loom.com/share/..."
              className="rounded-md pl-8 pr-3 py-1.5 text-[12.5px] outline-none w-full"
              style={{ background: "hsl(var(--v2-card))", border: "1px solid hsl(var(--v2-border))", color: "hsl(var(--v2-text))" }}
            />
          </div>
        </Field>
      </div>

      {videoUrl && (
        <Field label="Thumbnail video URL">
          <input
            type="text"
            value={videoThumbnailUrl}
            onChange={(e) => setVideoThumbnailUrl(e.target.value)}
            placeholder="https://.../thumb.jpg (obbligatorio se c'è un video)"
            className="rounded-md px-3 py-1.5 text-[12.5px] outline-none w-full"
            style={{ background: "hsl(var(--v2-card))", border: "1px solid hsl(var(--v2-border))", color: "hsl(var(--v2-text))" }}
          />
        </Field>
      )}

      <Field label="Messaggio personalizzato (opz.)">
        <textarea
          value={customMessage}
          onChange={(e) => setCustomMessage(e.target.value)}
          placeholder={`Sostituisce il paragrafo standard. Lascia vuoto per il default che menziona "${companyName}".`}
          rows={3}
          className="rounded-md px-3 py-2 text-[12.5px] outline-none w-full resize-y"
          style={{
            background: "hsl(var(--v2-card))",
            border: "1px solid hsl(var(--v2-border))",
            color: "hsl(var(--v2-text))",
            fontFamily: "inherit",
          }}
        />
      </Field>

      <div className="rounded-md overflow-hidden" style={{ background: "hsl(var(--v2-card))", border: "1px solid hsl(var(--v2-border))" }}>
        <div
          className="flex items-center justify-between px-3 py-2"
          style={{ borderBottom: "1px solid hsl(var(--v2-border))", background: "hsl(var(--v2-bg-elev))" }}
        >
          <span className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            Anteprima email
          </span>
          <button
            type="button"
            onClick={() => setIframeKey((k) => k + 1)}
            className="v2-mono text-[10px] inline-flex items-center gap-1 hover:text-white transition-colors"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            <RefreshCw className="w-3 h-3" />
            Aggiorna
          </button>
        </div>
        <iframe
          key={iframeKey}
          ref={iframeRef}
          src={previewUrl}
          className="w-full h-[420px]"
          style={{ background: "hsl(215 30% 6%)" }}
          sandbox="allow-same-origin"
          title="Anteprima email survey"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <a href={previewUrl} target="_blank" rel="noreferrer" className="v2-btn">
          <ExternalLink className="w-3.5 h-3.5" />
          Apri in tab
        </a>
        <button type="button" onClick={() => copy(previewUrl, setCopiedHtml)} className="v2-btn">
          {copiedHtml ? <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} /> : <FileCode className="w-3.5 h-3.5" />}
          Copia HTML
        </button>
        <button type="button" onClick={() => copy(textUrl, setCopiedText)} className="v2-btn">
          {copiedText ? <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} /> : <FileText className="w-3.5 h-3.5" />}
          Copia testo
        </button>
      </div>

      <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--v2-text-mute))" }}>
        💡 <strong style={{ color: "hsl(var(--v2-text-dim))" }}>Come usarlo</strong>: clicca &quot;Copia HTML&quot; e incolla in Gmail/Outlook/Superhuman (modalità HTML). Oppure &quot;Apri in tab&quot; → tasto destro → Salva pagina con nome, poi allega.
      </p>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="v2-mono text-[10px] font-bold uppercase tracking-[0.14em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
        {label}
      </label>
      {children}
    </div>
  );
}
