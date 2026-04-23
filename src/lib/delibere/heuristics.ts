/**
 * Pre-classificatore euristico sul titolo delibera.
 * Zero AI, zero costi. Serve a dare un indicatore immediato "probabile
 * cambio tariffario" sulle delibere NUOVE non ancora analizzate dalla AI.
 *
 * Per delibere già analizzate, usa invece ai_importanza (più accurato).
 */

const KEYWORDS_CRITICO: RegExp[] = [
  // Componenti tariffarie gas
  /\bQVD\b/i,
  /\bCMEM\b/i,
  /\bCCR\b/i,
  // Tariffe elettriche
  /\bTRAS\b/i,
  /\bDIS\b/i,
  /\bMIS\b/i,
  // Oneri
  /\bASOS\b/i,
  /\bARIM\b/i,
  /\bUC3\b/i,
  /\bUC6\b/i,
  // Componenti
  /\baliquot[ae]\s+di\s+integrazione/i,
  /\bquadro\s+(energia|energetico)/i,
  /\bQE\b/i,
  // Aggiornamenti tariffe regolate
  /aggiornamento.{0,40}(tariff|component|prezz|oner)/i,
  /determinazione.{0,40}component/i,
  /tariff[ae].{0,40}(distribuzione|trasmission|misur|obbligator)/i,
  /(per|dal|nel)\s+(il\s+)?(primo|secondo|terzo|quarto)\s+trimestre/i,
  /\b[IVX]+°?\s+trimestre\s+20\d\d/i,
];

const KEYWORDS_OPERATIVO: RegExp[] = [
  /\bSTG\b/i,
  /\basta\b/i,
  /\bSII\b/i,
  /switching/i,
  /morosit/i,
  /recupero\s+credit/i,
  /bonus\s+sociale/i,
  /clienti\s+vulnerabili/i,
  /\bCDISP\b/i,
  /market\s+coupling/i,
  /reintegrazione/i,
];

export type HeuristicTag = null | "possibile_tariffario" | "possibile_operativo";

export function heuristicTagFromTitle(titolo: string | null | undefined): HeuristicTag {
  if (!titolo) return null;
  for (const re of KEYWORDS_CRITICO) {
    if (re.test(titolo)) return "possibile_tariffario";
  }
  for (const re of KEYWORDS_OPERATIVO) {
    if (re.test(titolo)) return "possibile_operativo";
  }
  return null;
}

export const HEURISTIC_LABEL: Record<NonNullable<HeuristicTag>, string> = {
  possibile_tariffario: "Possibile cambio tariffario",
  possibile_operativo: "Possibile cambio operativo",
};
