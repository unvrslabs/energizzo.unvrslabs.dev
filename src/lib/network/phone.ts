const E164_REGEX = /^\+[1-9]\d{7,14}$/;

export function normalizePhoneE164(raw: string): string | null {
  if (!raw) return null;
  let s = raw.replace(/[\s()\-. ]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (!s.startsWith("+")) {
    if (/^39\d{8,11}$/.test(s)) s = "+" + s;
    else if (/^3\d{8,9}$/.test(s)) s = "+39" + s;
    else if (/^0\d{5,10}$/.test(s)) s = "+39" + s;
    else s = "+" + s;
  }
  return E164_REGEX.test(s) ? s : null;
}

export function maskPhone(e164: string): string {
  if (e164.length < 6) return e164;
  const head = e164.slice(0, 4);
  const tail = e164.slice(-2);
  return `${head}${"*".repeat(Math.max(2, e164.length - 6))}${tail}`;
}
