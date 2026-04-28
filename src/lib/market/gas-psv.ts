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

// ─────────────────── LIVELLO 2: Firecrawl ───────────────────

/**
 * Firecrawl scrape API: rendering JS + anti-bot bypass.
 * Free tier 500 page/mese (sufficiente per 1 run daily = ~30/mese).
 * Richiede env FIRECRAWL_API_KEY (https://firecrawl.dev/dashboard).
 */
async function fetchViaFirecrawl(): Promise<PsvFetchResult | null> {
  const apiKey = process.env.FIRECRAWL_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        url: GME_PUBLIC_URL,
        formats: ["markdown"],
        onlyMainContent: true,
        // Aspetta che la pagina ASP.NET completi il rendering
        waitFor: 1500,
      }),
      signal: AbortSignal.timeout(20000),
    });

    if (!res.ok) {
      console.warn(`[psv:firecrawl] ${res.status} ${res.statusText}`);
      return null;
    }

    const json = (await res.json()) as {
      success?: boolean;
      data?: { markdown?: string; html?: string };
    };
    if (!json.success) {
      console.warn(`[psv:firecrawl] success=false`);
      return null;
    }
    const text = json.data?.markdown ?? json.data?.html ?? "";
    if (!text) {
      console.warn(`[psv:firecrawl] empty content`);
      return null;
    }
    return parsePsvFromText(text, "gme_firecrawl");
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[psv:firecrawl] error: ${msg}`);
    return null;
  }
}

// ─────────────────── ENTRY POINT ───────────────────

/**
 * Best-effort multi-source PSV fetcher. Prova in ordine:
 *  1. fetch+regex pubblico GME (gratis, primo)
 *  2. Firecrawl scrape (se FIRECRAWL_API_KEY)
 * Ritorna null se entrambi falliscono.
 */
export async function fetchLatestPsvBestEffort(): Promise<PsvFetchResult | null> {
  // Livello 1
  const direct = await fetchViaPublicHttp();
  if (direct) return direct;

  // Livello 2
  const firecrawl = await fetchViaFirecrawl();
  if (firecrawl) return firecrawl;

  return null;
}
