import {
  TestiIntegratiV2Client,
  type TestoIntegratoView,
  type TiAttachment,
  type DeliberaRefView,
} from "@/components/network-v2/testi-integrati-v2-client";
import {
  listTestiIntegrati,
  resolveDelibereRefs,
  buildAreraDetailUrl,
  deriveSectorsFromTiSettore,
  type DbTestoIntegrato,
} from "@/lib/testi-integrati/db";

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

  // Prefetch delibere di riferimento in un'unica query.
  const refsCodici = raw
    .map((d) => d.delibera_riferimento)
    .filter((c): c is string => !!c);
  const refsMap = await resolveDelibereRefs(refsCodici);

  const testi = raw.map((d) => dbToView(d, refsMap));

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

function dbToView(
  d: DbTestoIntegrato,
  refsMap: Map<string, { numero: string; titolo: string; settore: string | null; data_pubblicazione: string | null; in_cache: boolean }>,
): TestoIntegratoView {
  const sectors = deriveSectorsFromTiSettore(d.settore, d.codice);
  const attachments: TiAttachment[] = (d.documenti_urls ?? []).map((url, i) => ({
    label: `Documento ${i + 1}`,
    url,
    kind: kindFromUrl(url),
  }));

  let deliberaRef: DeliberaRefView | null = null;
  if (d.delibera_riferimento) {
    const cached = refsMap.get(d.delibera_riferimento);
    if (cached) {
      deliberaRef = {
        codice: cached.numero,
        titolo: cached.titolo,
        settore: cached.settore,
        dataPubblicazione: cached.data_pubblicazione,
        internalHref: `/network/delibere?open=${encodeURIComponent(cached.numero)}`,
        areraHref: null,
      };
    } else {
      deliberaRef = {
        codice: d.delibera_riferimento,
        titolo: null,
        settore: null,
        dataPubblicazione: null,
        internalHref: null,
        areraHref: buildAreraDetailUrl(d.delibera_riferimento),
      };
    }
  }

  return {
    id: d.id,
    codice: d.codice,
    titolo: d.titolo,
    descrizione: d.descrizione,
    deliberaRef,
    dataVigore: d.data_entrata_vigore ?? d.api_created_at ?? d.created_at,
    sectors,
    stato: d.stato,
    url: d.url_riferimento,
    attachments,
    summary: d.ai_summary,
    bullets: d.ai_bullets,
    hasSummary: !!d.ai_generated_at && !!d.ai_summary,
    aiSource: d.ai_source === "pdf" || d.ai_source === "metadata" ? d.ai_source : null,
    aiError: d.ai_error,
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
