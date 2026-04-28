/**
 * Fetcher PSV (Punto di Scambio Virtuale) — prezzo gas all'ingrosso Italia.
 *
 * Fonte primaria: GME MGP-Gas
 *   https://www.mercatoelettrico.org/It/MercatiGas/MPGAS/EsitiMPGAS.aspx
 *
 * GME pubblica gli esiti d'asta del Mercato del Giorno Prima per il gas (MGP-Gas).
 * La pagina e' un Web Form ASP.NET con ViewState, NON ha API pubblica REST.
 *
 * STRATEGIA 3-LIVELLI (best-effort, gracefully nullable):
 *  1. fetch+regex pubblico GME (gratis, primo tentativo, fragile)
 *  2. Fallback Firecrawl (se FIRECRAWL_API_KEY): rendering JS + bypass anti-bot
 *  3. (futuro) CSV ufficiale GME autenticato dopo registrazione account
 *
 * Tutti i livelli ritornano `null` su errore: la UI gestisce gracefully
 * mostrando "in sync" finche' non arriva il primo dato valido.
 */

export type PsvFetchResult = {
  price_day: string; // YYYY-MM-DD
  price_eur_mwh: number;
  volume_mwh: number | null;
  trades_count: number | null;
  source: string;
};

const GME_PUBLIC_URL =
  "https://www.mercatoelettrico.org/It/MercatiGas/MPGAS/EsitiMPGAS.aspx";

// ─────────────────── PARSER comune ───────────────────

/**
 * Estrae data + prezzo dal markup grezzo (HTML o Markdown).
 * Heuristica: prima data dd/mm/yyyy + primo prezzo decimale italiano entro 800 char.
 */
function parsePsvFromText(text: string, source: string): PsvFetchResult | null {
  const dateRe = /(\d{2})\/(\d{2})\/(\d{4})/;
  const dateMatch = text.match(dateRe);
  if (!dateMatch) {
    console.warn(`[psv:${source}] no date found`);
    return null;
  }
  const [, dd, mm, yyyy] = dateMatch;
  const price_day = `${yyyy}-${mm}-${dd}`;

  const afterDate = text.slice(dateMatch.index! + dateMatch[0].length);
  // Prezzo decimale italiano: "32,450" / "1.234,56" / "32.45"
  const priceMatch = afterDate
    .slice(0, 800)
    .match(/(\d{1,3}(?:\.\d{3})*,\d{2,4}|\d+,\d{2,4}|\d{1,3}\.\d{2,4})/);
  if (!priceMatch) {
    console.warn(`[psv:${source}] no price after date`);
    return null;
  }
  let priceStr = priceMatch[1];
  if (priceStr.includes(",")) {
    priceStr = priceStr.replace(/\./g, "").replace(",", ".");
  }
  const price = Number(priceStr);
  if (!Number.isFinite(price) || price <= 0 || price > 1000) {
    console.warn(`[psv:${source}] invalid price parsed: ${priceMatch[1]}`);
    return null;
  }

  return {
    price_day,
    price_eur_mwh: price,
    volume_mwh: null,
    trades_count: null,
    source,
  };
}

// ─────────────────── LIVELLO 1: fetch+regex pubblico ───────────────────

async function fetchViaPublicHttp(): Promise<PsvFetchResult | null> {
  try {
    const res = await fetch(GME_PUBLIC_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "it-IT,it;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[psv:public] GME ${res.status} ${res.statusText}`);
      return null;
    }
    const html = await res.text();
    return parsePsvFromText(html, "gme_public");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[psv:public] fetch error: ${msg}`);
    return null;
  }
}

// ─────────────────── LIVELLO 2: Apify ───────────────────

/**
 * Apify rag-web-browser actor: rendering JS + bypass anti-bot.
 * Richiede env APIFY_API_TOKEN (apify_api_*).
 *
 * Endpoint sync: lancia run, attende completion, scarica dataset items.
 * Cost: ~$0.0005 per page run, free tier $5/month → ~10k pagine/mese.
 *
 * Input actor (rag-web-browser): { query: <url>, maxResults: 1 }
 * Output: [{ url, query, crawl: { httpStatusCode, ... },
 *            metadata: { title, ... }, text, markdown }]
 */
async function fetchViaApify(): Promise<PsvFetchResult | null> {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) return null;

  try {
    const url =
      `https://api.apify.com/v2/acts/apify~rag-web-browser/run-sync-get-dataset-items?token=${encodeURIComponent(
        token,
      )}`;

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: GME_PUBLIC_URL,
        maxResults: 1,
        scrapingTool: "browser-playwright",
        outputFormats: ["markdown"],
      }),
      signal: AbortSignal.timeout(60000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      console.warn(`[psv:apify] ${res.status} ${res.statusText} ${body.slice(0, 200)}`);
      return null;
    }

    const items = (await res.json()) as Array<{
      url?: string;
      text?: string;
      markdown?: string;
      content?: { markdown?: string; text?: string };
    }>;
    if (!Array.isArray(items) || items.length === 0) {
      console.warn(`[psv:apify] empty items`);
      return null;
    }
    const item = items[0];
    const text =
      item.markdown ?? item.content?.markdown ?? item.text ?? item.content?.text ?? "";
    if (!text) {
      console.warn(`[psv:apify] empty content in item`);
      return null;
    }
    return parsePsvFromText(text, "gme_apify");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[psv:apify] error: ${msg}`);
    return null;
  }
}

// ─────────────────── ENTRY POINT ───────────────────

/**
 * Best-effort multi-source PSV fetcher. Prova in ordine:
 *  1. fetch+regex pubblico GME (gratis, primo)
 *  2. Apify rag-web-browser (se APIFY_API_TOKEN, browser headless)
 * Ritorna null se entrambi falliscono.
 */
export async function fetchLatestPsvBestEffort(): Promise<PsvFetchResult | null> {
  // Livello 1
  const direct = await fetchViaPublicHttp();
  if (direct) return direct;

  // Livello 2
  const apify = await fetchViaApify();
  if (apify) return apify;

  return null;
}
