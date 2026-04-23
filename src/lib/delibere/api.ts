/**
 * Client Energizzo public delibere API.
 * Endpoint: https://api8055.energizzo.it/api/public/delibere
 */

const API_BASE = "https://api8055.energizzo.it/api/public/delibere";
const DEFAULT_PER_PAGE = 25;

export type EnergizzoDelibera = {
  id: number;
  numero: string;
  titolo: string;
  descrizione: string | null;
  tipo: string | null;
  settore: string | null;
  data_delibera: string | null;
  data_scadenza: string | null;
  data_pubblicazione: string | null;
  fonte: string | null;
  url_riferimento: string | null;
  documento: string | null;
  documenti: string[] | null;
  stato: string | null;
  note: string | null;
  created_by: number | null;
  created_at: string | null;
  updated_at: string | null;
  documento_url: string | null;
  documenti_urls: string[] | null;
  autore: { id: number; name: string } | null;
};

type ApiResponse = {
  success: boolean;
  data: EnergizzoDelibera[];
  total: number;
  per_page: number;
  current_page: number;
};

export async function fetchDeliberePage(
  page: number,
  perPage = DEFAULT_PER_PAGE,
): Promise<ApiResponse> {
  const url = `${API_BASE}?per_page=${perPage}&page=${page}`;
  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error(`Energizzo API ${res.status}: ${await res.text()}`);
  }
  const json = (await res.json()) as ApiResponse;
  if (!json.success) {
    throw new Error(`Energizzo API success=false`);
  }
  return json;
}

/**
 * Fetch all delibere paginating through the API.
 * Returns a flat array of records.
 */
export async function fetchAllDelibere(
  perPage = DEFAULT_PER_PAGE,
): Promise<EnergizzoDelibera[]> {
  const first = await fetchDeliberePage(1, perPage);
  const total = first.total;
  const pages = Math.ceil(total / perPage);
  const all: EnergizzoDelibera[] = [...first.data];

  for (let p = 2; p <= pages; p++) {
    const page = await fetchDeliberePage(p, perPage);
    all.push(...page.data);
  }

  return all;
}

/**
 * Map API settore text to internal sector enum used by UI.
 */
export type UiSector = "eel" | "gas";

export function mapSettoreToSector(
  settore: string | null | undefined,
): UiSector[] {
  if (!settore) return [];
  const s = settore.toLowerCase();
  const result: UiSector[] = [];
  if (s.includes("luce") || s.includes("elett") || s.includes("eel") || s.includes("energia")) {
    result.push("eel");
  }
  if (s.includes("gas")) {
    result.push("gas");
  }
  return result;
}
