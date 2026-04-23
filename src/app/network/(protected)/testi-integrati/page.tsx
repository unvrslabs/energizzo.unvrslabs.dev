import {
  TestiIntegratiV2Client,
  type TestoIntegratoView,
  type TiAttachment,
} from "@/components/network-v2/testi-integrati-v2-client";
import { listTestiIntegrati, type DbTestoIntegrato, deriveSectorsFromTiSettore } from "@/lib/testi-integrati/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Testi Integrati · Terminal",
};

export default async function TestiIntegratiPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string }>;
}) {
  const sp = await searchParams;
  const raw = await listTestiIntegrati();
  const testi = raw.map(dbToView);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Compliance · Testi Integrati ARERA
          </p>
          <h1
            className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1"
            style={{ color: "hsl(var(--v2-text))" }}
          >
            Testi Integrati
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {testi.length} atti vigenti · consolidati dalle delibere ARERA di riferimento
          </p>
        </div>
      </header>
      <TestiIntegratiV2Client testi={testi} initialCode={sp.open} />
    </div>
  );
}

function dbToView(d: DbTestoIntegrato): TestoIntegratoView {
  const sectors = deriveSectorsFromTiSettore(d.settore, d.codice);
  const attachments: TiAttachment[] = (d.documenti_urls ?? []).map((url, i) => ({
    label: `Documento ${i + 1}`,
    url,
    kind: kindFromUrl(url),
  }));
  return {
    id: d.id,
    codice: d.codice,
    titolo: d.titolo,
    descrizione: d.descrizione,
    delibera_riferimento: d.delibera_riferimento,
    dataVigore: d.data_entrata_vigore ?? d.api_created_at ?? d.created_at,
    sectors,
    stato: d.stato,
    url: d.url_riferimento,
    attachments,
  };
}

function kindFromUrl(url: string): TiAttachment["kind"] {
  const u = url.toLowerCase();
  if (u.endsWith(".pdf")) return "pdf";
  if (u.endsWith(".xlsx") || u.endsWith(".xls")) return "xlsx";
  if (u.endsWith(".docx") || u.endsWith(".doc")) return "docx";
  if (u.endsWith(".zip")) return "zip";
  return "other";
}
