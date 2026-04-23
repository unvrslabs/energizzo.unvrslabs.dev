import { DelibereV2Client, type DeliberaView, type UiAttachment, type UiSector, type Importanza } from "@/components/network-v2/delibere-v2-client";
import { listDelibere, type DbDelibera } from "@/lib/delibere/db";
import { deriveSectorsFromNumero } from "@/lib/delibere/api";
import { heuristicTagFromTitle } from "@/lib/delibere/heuristics";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Delibere ARERA · Terminal",
};

export default async function DelibereV2Page({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const sp = await searchParams;
  const raw = await listDelibere();
  // Solo delibere pertinenti per reseller energia (suffisso eel/gas/com nel numero).
  // Escluse: /efr (efficienza), /rif (rifiuti), numeri senza suffisso.
  const delibere = raw
    .map(dbToView)
    .filter((d) => d.sectors.length > 0);
  const withSummary = delibere.filter((d) => d.hasSummary).length;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Compliance · Delibere ARERA
          </p>
          <h1
            className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1"
            style={{ color: "hsl(var(--v2-text))" }}
          >
            Archivio delibere
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {delibere.length} atti indicizzati · {withSummary} con sommario AI pronto · bullet operativi generati sul PDF
          </p>
        </div>
      </header>
      <DelibereV2Client delibere={delibere} initialCode={sp.open} />
    </div>
  );
}

function dbToView(d: DbDelibera): DeliberaView {
  // Priorità: suffisso del numero delibera (fonte di verità ARERA).
  // ai_sectors da Claude usato solo come integrazione se il numero non ha suffisso valido.
  const fromNumero = deriveSectorsFromNumero(d.numero);
  const sectors: UiSector[] =
    fromNumero.length > 0
      ? fromNumero
      : Array.isArray(d.ai_sectors)
      ? (d.ai_sectors as UiSector[])
      : [];

  const attachments: UiAttachment[] = (d.documenti_urls ?? []).map((url, i) => ({
    label: `Documento ${i + 1}`,
    url,
    kind: kindFromUrl(url),
  }));

  // Priorità: scraping ARERA (data reale) → fallback a metadati API (spesso errati).
  const date =
    d.scraped_data_pubblicazione ??
    d.data_pubblicazione ??
    d.data_delibera ??
    d.api_created_at ??
    d.created_at;

  const hasSummary = !!d.ai_generated_at && !!d.ai_summary;
  return {
    id: d.id,
    code: d.numero,
    title: d.titolo,
    date,
    sectors,
    settoreLabel: d.settore,
    tipo: d.tipo,
    summary: d.ai_summary,
    bullets: d.ai_bullets,
    attachments,
    url: d.url_riferimento,
    hasSummary,
    aiError: d.ai_error,
    aiSource: d.ai_source === "pdf" || d.ai_source === "url" ? d.ai_source : null,
    aiGeneratedAt: d.ai_generated_at,
    importanza: (d.ai_importanza ?? null) as Importanza | null,
    categoriaImpatto: d.ai_categoria_impatto,
    // Heuristic: mostra tag solo per delibere senza analisi AI
    heuristicTag: hasSummary ? null : heuristicTagFromTitle(d.titolo),
  };
}

function kindFromUrl(url: string): UiAttachment["kind"] {
  const u = url.toLowerCase();
  if (u.endsWith(".pdf")) return "pdf";
  if (u.endsWith(".xlsx") || u.endsWith(".xls")) return "xlsx";
  if (u.endsWith(".docx") || u.endsWith(".doc")) return "docx";
  if (u.endsWith(".zip")) return "zip";
  return "other";
}
