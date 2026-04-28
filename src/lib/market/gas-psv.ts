/**
 * Fetcher PSV (Punto di Scambio Virtuale) — prezzo gas all'ingrosso Italia.
 *
 * Fonte: GME MGP-Gas pagina Negoziazione Continua "Prezzo".
 *   https://www.mercatoelettrico.org/it-it/Home/Esiti/Gas/MGP-GAS/Esiti/NegoziazioneContinua/Prezzo
 *
 * GME serve la pagina come SPA Angular: il widget tabella esiti viene
 * popolato via AJAX dopo il render. Curl plain non funziona (XSRF cookie
 * impostato solo lato browser → API interna 401).
 *
 * Soluzione: Apify web-scraper actor con pageFunction custom che:
 *  1. Carica la pagina dentro browser headless
 *  2. Clicca "CONTINUA" sul modal di accettazione condizioni
 *  3. Aspetta che Angular popoli la tabella (~9s)
 *  4. Legge la prima riga MGP-YYYY-MM-DD ed estrae prezzo "Rifer."
 *
 * Output tabella attuale (esempio reale 2026-04-28):
 *   MGP-2026-04-28 | First 45,500 | Last 44,950 | Min 44,200 | Max 45,850 |
 *   Rifer. 44,917 | Controllo 45,080 | MW 16.804 | MWh 403.296
 *
 * "Rifer." = media ponderata dei prezzi su contratti conclusi → equivale
 * al PSV come riferimento di mercato per il giorno.
 */

export type PsvFetchResult = {
  price_day: string; // YYYY-MM-DD
  price_eur_mwh: number;
  volume_mwh: number | null;
  trades_count: number | null;
  source: string;
};

const GME_GAS_URL =
  "https://www.mercatoelettrico.org/it-it/Home/Esiti/Gas/MGP-GAS/Esiti/NegoziazioneContinua/Prezzo";

const APIFY_ACTOR = "apify~web-scraper";

// pageFunction eseguita dentro browser headless di Apify.
// Estrae la prima riga MGP-YYYY-MM-DD dalla tabella esiti e ritorna un oggetto
// con date e prezzi gia' parsati (numero IT con virgola).
const PAGE_FUNCTION = `async function pageFunction(ctx) {
  // 1. Click modal "CONTINUA" se presente (accettazione condizioni)
  try {
    const accept = Array.from(document.querySelectorAll("a, button"))
      .find(el => /CONTINUA|ACCETTO/i.test(el.innerText || ""));
    if (accept) accept.click();
  } catch {}

  // 2. Wait Angular hydration + AJAX populate tabella
  await new Promise(r => setTimeout(r, 9000));

  // 3. Parsing tabella: cerca prima riga "MGP-YYYY-MM-DD"
  const text = document.body.innerText || "";
  // Pattern riga: codice prodotto seguito da 6-8 numeri decimali italiani separati da tab/newline
  // Esempio: "MGP-2026-04-28\\t45,500\\t44,950\\t44,200\\t45,850\\t44,917\\t45,080\\t16.804\\t403.296"
  const rowRegex = /MGP-(\\d{4})-(\\d{2})-(\\d{2})[\\s\\t\\n]+([0-9.,\\-\\s\\t\\n]+)/;
  const m = text.match(rowRegex);
  if (!m) {
    return { ok: false, reason: "no row matched", textPreview: text.slice(0, 2000) };
  }
  const price_day = m[1] + "-" + m[2] + "-" + m[3];
  // Splitta i campi numerici della riga (whitespace separator, tiene "-" come placeholder)
  const fields = m[4]
    .split(/[\\s\\t\\n]+/)
    .filter(s => s.length > 0)
    .slice(0, 8);

  // Conversione numero IT: "45,500" -> 45.500 ; "16.804" (tabular) -> 16.804 (volume MW intero)
  // I prezzi hanno formato XX,YYY (virgola decimale) ; i volumi possono avere "." come migliaia
  const parsePrice = (s) => {
    if (!s || s === "-") return null;
    // Normalizza: rimuovi punti migliaia se presenti, sostituisci virgola con punto
    const normalized = s.replace(/\\./g, "").replace(",", ".");
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  };
  const parseVolume = (s) => {
    if (!s || s === "-") return null;
    // Volumi GME formato US-like: "." e' decimale (NON migliaia).
    // Esempio reale: 16.804 MW (potenza media) × 24h = 403.296 MWh (energia daily).
    // Il rapporto verifica: i punti sono decimali, non migliaia.
    const n = Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const [first, last, min, max, rifer, controllo, mw, mwh] = fields;
  const price = parsePrice(rifer); // "Rifer." = media ponderata
  if (price === null || price <= 0) {
    return { ok: false, reason: "rifer not parseable", fields };
  }

  return {
    ok: true,
    price_day,
    price_eur_mwh: price,
    first: parsePrice(first),
    last: parsePrice(last),
    min: parsePrice(min),
    max: parsePrice(max),
    controllo: parsePrice(controllo),
    volume_mw: parseVolume(mw),
    volume_mwh: parseVolume(mwh),
  };
}`;

/**
 * Apify web-scraper run-sync. Free tier $5/mese → ~10k page run.
 * Una run/giorno = ~30/mese ≪ tier.
 */
export async function fetchLatestPsvBestEffort(): Promise<PsvFetchResult | null> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) {
    console.warn("[psv] APIFY_API_TOKEN missing");
    return null;
  }

  try {
    const url = `https://api.apify.com/v2/acts/${APIFY_ACTOR}/run-sync-get-dataset-items?token=${encodeURIComponent(token)}`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        startUrls: [{ url: GME_GAS_URL }],
        pageFunction: PAGE_FUNCTION,
        proxyConfiguration: { useApifyProxy: true },
        maxRequestsPerCrawl: 1,
      }),
      signal: AbortSignal.timeout(90000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[psv] apify ${res.status} ${res.statusText} ${body.slice(0, 200)}`);
      return null;
    }

    const items = (await res.json()) as Array<{
      ok?: boolean;
      reason?: string;
      price_day?: string;
      price_eur_mwh?: number;
      volume_mwh?: number | null;
      fields?: unknown;
      textPreview?: string;
    }>;

    if (!Array.isArray(items) || items.length === 0) {
      console.warn("[psv] apify empty items");
      return null;
    }
    const item = items[0];
    if (!item.ok || !item.price_day || typeof item.price_eur_mwh !== "number") {
      console.warn(
        `[psv] apify pageFunction reported not-ok: ${item.reason ?? "unknown"}`,
      );
      return null;
    }

    return {
      price_day: item.price_day,
      price_eur_mwh: item.price_eur_mwh,
      volume_mwh: typeof item.volume_mwh === "number" ? item.volume_mwh : null,
      trades_count: null,
      source: "gme_apify",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[psv] fetch error: ${msg}`);
    return null;
  }
}
