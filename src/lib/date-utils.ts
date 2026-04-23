/**
 * Formatting date helpers condivisi.
 * Usano UTC per evitare shift di un giorno con timezone italiani (CEST).
 */

/**
 * YYYY-MM-DD → "23 aprile 2026"
 */
export function formatDateIt(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * YYYY-MM-DD → "23 apr"
 */
export function formatDateShortIt(date: string): string {
  const d = new Date(date + "T00:00:00Z");
  return d.toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
