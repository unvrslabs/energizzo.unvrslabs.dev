import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";

export type OtpScope = "network" | "admin";

function getPepper(scope: OtpScope): string {
  // Pepper separati per admin e network: leak di uno non compromette l'altro.
  // ADMIN_OTP_PEPPER è optional per backward compat — fallback a NETWORK_OTP_PEPPER
  // ma emette warning in log.
  const envKey = scope === "admin" ? "ADMIN_OTP_PEPPER" : "NETWORK_OTP_PEPPER";
  let pepper = process.env[envKey];

  if (scope === "admin" && (!pepper || pepper.length < 16)) {
    const fallback = process.env.NETWORK_OTP_PEPPER;
    if (fallback && fallback.length >= 16) {
      console.warn(
        "[crypto] ADMIN_OTP_PEPPER non impostato — uso NETWORK_OTP_PEPPER come fallback. Imposta ADMIN_OTP_PEPPER separato per isolare gli scope.",
      );
      pepper = fallback;
    }
  }

  if (!pepper || pepper.length < 16) {
    throw new Error(`${envKey} mancante o troppo corto (min 16 char)`);
  }
  return pepper;
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

/**
 * Hash OTP con HMAC-SHA256 (invece di SHA256+pepper concat).
 * HMAC è progettato specificamente per combinare chiave + messaggio in modo
 * crittograficamente corretto (resistenza a length extension attacks).
 */
export function hashOtp(code: string, scope: OtpScope = "network"): string {
  return createHmac("sha256", getPepper(scope)).update(code).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Session token hash — usa SHA256 plain perché il token è ad alta entropia (32 byte
 * random) e non richiede pepper. Usato solo come index per lookup DB.
 */
export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
