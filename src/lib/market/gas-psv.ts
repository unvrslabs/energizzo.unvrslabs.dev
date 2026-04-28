/**
 * Fetcher PSV (Punto di Scambio Virtuale) — prezzo gas all'ingrosso Italia.
 *
 * Fonte primaria: GME MGP-Gas
 *   https://www.mercatoelettrico.org/It/MercatiGas/MPGAS/EsitiMPGAS.aspx
 *
 * GME pubblica gli esiti d'asta del Mercato del Giorno Prima per il gas (MGP-Gas).
 * La pagina e' un Web Form ASP.NET con ViewState, NON ha API pubblica REST.
 *
 * STRATEGIA fetcher (best-effort, gracefully nullable):
 *  1. GET pagina pubblica con UA realistico
 *  2. Estrae prima riga della tabella esiti (data piu' recente)
 *  3. Parsing regex su HTML grezzo (cheerio non installato)
 *  4. Se fallisce: ritorna null e si saltera' upsert
 *
 * Quando avremo credenziali GME (account registrato), passeremo a:
 *  - Download CSV ufficiale: https://www.mercatoelettrico.org/It/Download/DatiStorici.aspx
 *  - Auth via cookie ASP.NET dopo login form
 *  - Parsing CSV deterministico (no piu' regex su HTML)
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

/**
 * Tenta lo scraping pubblico GME. In caso di fallimento ritorna null.
 * Nota: GME ha protezioni anti-scrape (User-Agent check, ViewState),
 * quindi il successo non e' garantito. La UI deve gestire null gracefully.
 */
export async function fetchLatestPsvBestEffort(): Promise<PsvFetchResult | null> {
  try {
    const res = await fetch(GME_PUBLIC_URL, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "it-IT,it;q=0.9",
      },
      // Timeout via AbortController
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(`[psv] GME ${res.status} ${res.statusText}`);
      return null;
    }

    const html = await res.text();

    // Pattern atteso (best effort): tabella con colonne Data | Prezzo | Volume
    // Esempio HTML grezzo cercato:
    //   <td>27/04/2026</td><td>32,450</td><td>1.234.567</td>
    //
    // Adottiamo una euristica: cerca la prima occorrenza di una data in formato
    // dd/mm/yyyy seguita da un numero decimale italiano (virgola) entro 200 char.
    const dateRe = /(\d{2})\/(\d{2})\/(\d{4})/;
    const dateMatch = html.match(dateRe);
    if (!dateMatch) {
      console.warn("[psv] no date found in GME HTML");
      return null;
    }
    const [, dd, mm, yyyy] = dateMatch;
    const price_day = `${yyyy}-${mm}-${dd}`;

    // Cerca il primo numero decimale dopo la data (pattern italiano: "32,450" o "32.450")
    const afterDate = html.slice(dateMatch.index! + dateMatch[0].length);
    const priceMatch = afterDate
      .slice(0, 800)
      .match(/(\d{1,3}(?:\.\d{3})*,\d{2,4}|\d+,\d{2,4})/);
    if (!priceMatch) {
      console.warn("[psv] no price after date in GME HTML");
      return null;
    }
    const priceStr = priceMatch[1].replace(/\./g, "").replace(",", ".");
    const price = Number(priceStr);
    if (!Number.isFinite(price) || price <= 0 || price > 1000) {
      console.warn(`[psv] invalid price parsed: ${priceMatch[1]}`);
      return null;
    }

    return {
      price_day,
      price_eur_mwh: price,
      volume_mwh: null,
      trades_count: null,
      source: "gme_public",
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.warn(`[psv] fetch error: ${msg}`);
    return null;
  }
}
