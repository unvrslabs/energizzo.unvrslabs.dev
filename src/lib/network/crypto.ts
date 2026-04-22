import { createHash, randomBytes, randomInt } from "node:crypto";

function getPepper(): string {
  const pepper = process.env.NETWORK_OTP_PEPPER;
  if (!pepper || pepper.length < 16) {
    throw new Error("NETWORK_OTP_PEPPER mancante o troppo corto (min 16 char)");
  }
  return pepper;
}

export function generateOtpCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashOtp(code: string): string {
  return createHash("sha256").update(code + getPepper()).digest("hex");
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("base64url");
}

export function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
