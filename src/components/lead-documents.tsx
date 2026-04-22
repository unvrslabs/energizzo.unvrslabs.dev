"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Upload,
  Loader2,
  Paperclip,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { it } from "date-fns/locale";

type Document = {
  id: string;
  file_name: string;
  file_size: number;
  mime_type: string | null;
  tag: string | null;
  uploaded_by_name: string | null;
  created_at: string;
};

const TAG_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "Nessun tag" },
  { value: "proposta", label: "Proposta" },
  { value: "contratto_da_firmare", label: "Contratto da firmare" },
  { value: "contratto_firmato", label: "Contratto firmato" },
  { value: "documento_identita", label: "Documento d'identità" },
  { value: "verbale", label: "Verbale" },
  { value: "altro", label: "Altro" },
];

const TAG_STYLES: Record<string, { label: string; className: string }> = {
  proposta: {
    label: "Proposta",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-300",
  },
  contratto_da_firmare: {
    label: "Contratto da firmare",
    className: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  contratto_firmato: {
    label: "Contratto firmato",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  documento_identita: {
    label: "Doc. identità",
    className: "border-white/15 bg-white/[0.05] text-muted-foreground",
  },
  verbale: {
    label: "Verbale",
    className: "border-violet-400/30 bg-violet-400/10 text-violet-300",
  },
  altro: {
    label: "Altro",
    className: "border-white/15 bg-white/[0.05] text-muted-foreground",
  },
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function LeadDocuments({ leadId }: { leadId: string }) {
  const [docs, setDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [tag, setTag] = useState("");
  const [, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/dashboard/leads/${leadId}/documents`);
        const data = await res.json();
        if (!cancelled && res.ok && data.ok) {
          setDocs(data.documents as Document[]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId]);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (tag) fd.append("tag", tag);
      const res = await fetch(`/api/dashboard/leads/${leadId}/documents`, {
        method: "POST",
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error ?? "Upload fallito");
      }
      setDocs((prev) => [data.document as Document, ...prev]);
      toast.success("Documento caricato");
      setTag("");
      if (inputRef.current) inputRef.current.value = "";
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore imprevisto");
    } finally {
      setUploading(false);
    }
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
  }

  async function handleDelete(doc: Document) {
    if (!confirm(`Elimina "${doc.file_name}"?`)) return;
    startTransition(async () => {
      const res = await fetch(
        `/api/dashboard/leads/${leadId}/documents/${doc.id}`,
        { method: "DELETE" },
      );
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== doc.id));
        toast.success("Documento eliminato");
      } else {
        toast.error("Eliminazione fallita");
      }
    });
  }

  async function getSignedUrl(doc: Document, mode: "view" | "download") {
    const res = await fetch(
      `/api/dashboard/leads/${leadId}/documents/${doc.id}?mode=${mode}`,
    );
    const data = await res.json();
    if (!res.ok || !data.ok) throw new Error(data.error ?? "Errore");
    return data.url as string;
  }

  async function handleOpen(doc: Document) {
    try {
      const url = await getSignedUrl(doc, "view");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore apertura");
    }
  }

  async function handleDownload(doc: Document) {
    try {
      const url = await getSignedUrl(doc, "download");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Errore download");
    }
  }

  return (
    <section className="space-y-3">
      <h3 className="font-display text-xs font-semibold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
        <Paperclip className="h-3.5 w-3.5" /> Documenti
        {docs.length > 0 && (
          <span className="inline-flex items-center justify-center rounded-full bg-white/10 px-1.5 min-w-[1.25rem] h-5 text-[10px] font-bold">
            {docs.length}
          </span>
        )}
      </h3>

      <div className="glass rounded-md p-3 space-y-2">
        <div className="flex items-center gap-2">
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value)}
            disabled={uploading}
            className="rounded-md border border-border/60 bg-background/40 px-2 py-1.5 text-xs outline-none focus:border-primary/60 disabled:opacity-60"
          >
            {TAG_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <label
            className={`inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/40 hover:bg-background/60 px-3 py-1.5 text-xs font-semibold cursor-pointer transition-colors ${uploading ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {uploading ? "Caricamento…" : "Carica file"}
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={onFileChange}
              disabled={uploading}
            />
          </label>
          <span className="text-[10px] text-muted-foreground/70">
            max 25MB
          </span>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <p className="text-[11px] text-muted-foreground/70 text-center py-3">
          Nessun documento. Carica contratti, proposte o altro materiale
          associato a questo lead.
        </p>
      ) : (
        <ol className="space-y-2">
          {docs.map((d) => {
            const tagStyle = d.tag ? TAG_STYLES[d.tag] : null;
            return (
              <li
                key={d.id}
                className="glass rounded-md p-3 flex items-start gap-3"
              >
                <div className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary/15 border border-primary/30 text-primary shrink-0">
                  <FileText className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground truncate">
                      {d.file_name}
                    </span>
                    {tagStyle && (
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${tagStyle.className}`}
                      >
                        {tagStyle.label}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {formatSize(d.file_size)}
                    {" · "}
                    {formatDistanceToNow(new Date(d.created_at), {
                      locale: it,
                      addSuffix: true,
                    })}
                    {d.uploaded_by_name && ` · ${d.uploaded_by_name}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpen(d)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 hover:border-primary hover:text-primary transition-colors"
                    title="Apri nel browser"
                  >
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(d)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 hover:border-primary hover:text-primary transition-colors"
                    title="Scarica"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d)}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border/60 hover:border-red-500 hover:text-red-400 transition-colors"
                    title="Elimina"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
