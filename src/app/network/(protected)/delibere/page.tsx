import { DelibereV2Client, type DeliberaView, type UiAttachment, type UiSector } from "@/components/network-v2/delibere-v2-client";
import { listDelibere, type DbDelibera } from "@/lib/delibere/db";
import { mapSettoreToSector } from "@/lib/delibere/api";

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
  const delibere = raw.map(dbToView);
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
  const sectors: UiSector[] =
    Array.isArray(d.ai_sectors) && d.ai_sectors.length > 0
      ? d.ai_sectors
      : mapSettoreToSector(d.settore);

  const attachments: UiAttachment[] = (d.documenti_urls ?? []).map((url, i) => ({
    label: `Documento ${i + 1}`,
    url,
    kind: kindFromUrl(url),
  }));

  const date =
    d.data_delibera ?? d.data_pubblicazione ?? d.api_created_at ?? d.created_at;

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
    hasSummary: !!d.ai_generated_at && !!d.ai_summary,
    aiError: d.ai_error,
    aiSource: d.ai_source === "pdf" || d.ai_source === "url" ? d.ai_source : null,
    aiGeneratedAt: d.ai_generated_at,
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
