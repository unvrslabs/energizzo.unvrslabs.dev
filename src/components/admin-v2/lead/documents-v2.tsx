"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { Download, Eye, FileText, Loader2, Trash2, Upload } from "lucide-react";
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

const TAG_COLOR: Record<string, string> = {
  proposta: "hsl(200 70% 65%)",
  contratto_da_firmare: "hsl(var(--v2-warn))",
  contratto_firmato: "hsl(var(--v2-accent))",
  documento_identita: "hsl(var(--v2-text-dim))",
  verbale: "hsl(270 50% 68%)",
  altro: "hsl(var(--v2-text-dim))",
};

const TAG_LABEL: Record<string, string> = {
  proposta: "Proposta",
  contratto_da_firmare: "Da firmare",
  contratto_firmato: "Firmato",
  documento_identita: "Doc. identità",
  verbale: "Verbale",
  altro: "Altro",
};

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export function LeadDocumentsV2({ leadId }: { leadId: string }) {
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
      if (!res.ok || !data.ok) throw new Error(data.error ?? "Upload fallito");
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
      const res = await fetch(`/api/dashboard/leads/${leadId}/documents/${doc.id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDocs((prev) => prev.filter((d) => d.id !== doc.id));
        toast.success("Documento eliminato");
      } else {
        toast.error("Eliminazione fallita");
      }
    });
  }

  async function getSignedUrl(doc: Document, mode: "view" | "download") {
    const res = await fetch(`/api/dashboard/leads/${leadId}/documents/${doc.id}?mode=${mode}`);
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
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 flex-wrap">
        <select
          value={tag}
          onChange={(e) => setTag(e.target.value)}
          disabled={uploading}
          className="rounded-md px-2 py-1.5 text-[12px] outline-none"
          style={{
            background: "hsl(var(--v2-bg-elev))",
            border: "1px solid hsl(var(--v2-border))",
            color: "hsl(var(--v2-text))",
          }}
        >
          {TAG_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <label className={`v2-btn ${uploading ? "opacity-60 pointer-events-none" : ""}`}>
          {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          {uploading ? "Carico…" : "Carica file"}
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={onFileChange}
            disabled={uploading}
          />
        </label>
        <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
          max 25MB
        </span>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6" style={{ color: "hsl(var(--v2-text-mute))" }}>
          <Loader2 className="w-4 h-4 animate-spin" />
        </div>
      ) : docs.length === 0 ? (
        <p className="text-[12.5px] italic py-3 text-center" style={{ color: "hsl(var(--v2-text-mute))" }}>
          Nessun documento. Carica contratti, proposte o altro materiale.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {docs.map((d) => {
            const tagColor = d.tag ? TAG_COLOR[d.tag] : null;
            const tagLabel = d.tag ? TAG_LABEL[d.tag] : null;
            return (
              <li
                key={d.id}
                className="flex items-start gap-3 p-3 rounded-md"
                style={{ background: "hsl(var(--v2-bg-elev))", border: "1px solid hsl(var(--v2-border))" }}
              >
                <div
                  className="w-9 h-9 rounded-md grid place-items-center shrink-0"
                  style={{
                    background: "hsl(var(--v2-accent) / 0.12)",
                    border: "1px solid hsl(var(--v2-accent) / 0.3)",
                    color: "hsl(var(--v2-accent))",
                  }}
                >
                  <FileText className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[13px] font-medium truncate" style={{ color: "hsl(var(--v2-text))" }}>
                      {d.file_name}
                    </span>
                    {tagColor && tagLabel && (
                      <span
                        className="v2-mono text-[9.5px] font-bold uppercase tracking-[0.1em] px-1.5 py-0.5 rounded"
                        style={{
                          background: `${tagColor}18`,
                          color: tagColor,
                          border: `1px solid ${tagColor}44`,
                        }}
                      >
                        {tagLabel}
                      </span>
                    )}
                  </div>
                  <p className="v2-mono text-[10.5px] mt-1" style={{ color: "hsl(var(--v2-text-mute))" }}>
                    {formatSize(d.file_size)}
                    {" · "}
                    {formatDistanceToNow(new Date(d.created_at), { locale: it, addSuffix: true })}
                    {d.uploaded_by_name && ` · ${d.uploaded_by_name}`}
                  </p>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpen(d)}
                    className="v2-btn v2-btn--ghost"
                    style={{ padding: "6px 8px" }}
                    title="Apri"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownload(d)}
                    className="v2-btn v2-btn--ghost"
                    style={{ padding: "6px 8px" }}
                    title="Scarica"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(d)}
                    className="v2-btn v2-btn--ghost"
                    style={{ padding: "6px 8px", color: "hsl(var(--v2-danger))" }}
                    title="Elimina"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
