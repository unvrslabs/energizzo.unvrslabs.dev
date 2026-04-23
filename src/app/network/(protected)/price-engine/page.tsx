import { PriceEngineClient, type PeriodOption } from "@/components/network-v2/price-engine-client";
import {
  listAvailablePeriods,
  getOneriByPeriod,
  getLatestOneri,
} from "@/lib/oneri/db";
import type { Commodity } from "@/lib/oneri/meta";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata = {
  title: "Price Engine · Terminal",
};

export default async function PriceEnginePage({
  searchParams,
}: {
  searchParams: Promise<{ commodity?: string; mese?: string }>;
}) {
  const sp = await searchParams;
  const commodity: Commodity = sp.commodity === "gas" ? "gas" : "luce";
  const periods: PeriodOption[] = await listAvailablePeriods(commodity);

  // Default: il periodo più recente disponibile. Nel dominio ARERA il "mese
  // corrente" è ambiguo: ad aprile si fattura competenza marzo, quindi il
  // dato marzo è quello operativo. Lasciamo all'utente la scelta esplicita.
  const requested = sp.mese;
  const hasRequested = periods.find((p) => p.key === requested);
  const selectedKey = hasRequested?.key ?? periods[0]?.key ?? null;

  let row = null;
  if (selectedKey) {
    row = await getOneriByPeriod(commodity, selectedKey);
  }
  if (!row) {
    row = await getLatestOneri(commodity);
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <p
            className="v2-mono text-[10.5px] font-semibold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            Mercato · Oneri tariffari
          </p>
          <h1
            className="text-2xl md:text-[28px] font-semibold tracking-tight mt-1"
            style={{ color: "hsl(var(--v2-text))" }}
          >
            Price Engine · oneri ARERA vigenti
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--v2-text-dim))" }}>
            Componenti tariffarie ufficiali per tipologia cliente · il mese di competenza è quello che si usa nelle fatture del mese successivo
          </p>
        </div>
      </header>
      <PriceEngineClient
        commodity={commodity}
        periods={periods}
        selectedPeriodKey={row?.periodo_key ?? null}
        data={(row?.data as Record<string, Record<string, unknown>>) ?? null}
      />
    </div>
  );
}
