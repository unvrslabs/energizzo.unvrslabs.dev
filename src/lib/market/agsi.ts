/**
 * AGSI+ (GIE) API client - Italia stoccaggi gas.
 * Docs: https://agsi.gie.eu/
 */

const BASE = "https://agsi.gie.eu/api";

export type AgsiPoint = {
  name: string;
  code: string;
  url: string;
  updatedAt: string;
  gasDayStart: string;
  gasDayEnd: string;
  gasInStorage: string; // TWh
  consumption: string;
  consumptionFull: string;
  injection: string; // GWh/d
  withdrawal: string;
  netWithdrawal: string;
  workingGasVolume: string; // TWh
  injectionCapacity: string; // GWh/d
  withdrawalCapacity: string;
  contractedCapacity: string;
  availableCapacity: string;
  coveredCapacity: string;
  status: string;
  trend: string; // delta giornaliero %
  full: string; // % riempimento
  info: unknown[];
};

type AgsiResponse = {
  last_page: number;
  total: number;
  gas_day: string;
  data: AgsiPoint[];
};

export async function fetchAgsiItaly(
  apiKey: string,
  opts: { from?: string; to?: string; size?: number } = {},
): Promise<AgsiResponse> {
  const params = new URLSearchParams({
    country: "IT",
    size: String(opts.size ?? 300),
  });
  if (opts.from) params.set("from", opts.from);
  if (opts.to) params.set("to", opts.to);

  const res = await fetch(`${BASE}?${params.toString()}`, {
    headers: { "x-key": apiKey, Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`AGSI ${res.status}: ${await res.text()}`);
  }
  return (await res.json()) as AgsiResponse;
}

function num(v: string | undefined | null): number | null {
  if (v === undefined || v === null || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

export function agsiPointToRow(p: AgsiPoint) {
  return {
    country: p.code ?? "IT",
    company: "aggregate",
    gas_day: p.gasDayStart,
    gas_in_storage_twh: num(p.gasInStorage),
    working_gas_volume_twh: num(p.workingGasVolume),
    injection_gwh: num(p.injection),
    withdrawal_gwh: num(p.withdrawal),
    net_withdrawal_gwh: num(p.netWithdrawal),
    injection_capacity_gwh: num(p.injectionCapacity),
    withdrawal_capacity_gwh: num(p.withdrawalCapacity),
    full_pct: num(p.full),
    trend_pct: num(p.trend),
    status: p.status ?? null,
    consumption_gwh: num(p.consumption),
    consumption_full_pct: num(p.consumptionFull),
    source: "AGSI" as const,
    raw_updated_at: p.updatedAt ? new Date(p.updatedAt).toISOString() : null,
    synced_at: new Date().toISOString(),
  };
}
