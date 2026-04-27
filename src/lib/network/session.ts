import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashSessionToken } from "@/lib/network/crypto";

export const NETWORK_COOKIE_NAME = "ildispaccio_network";
export const NETWORK_SESSION_TTL_DAYS = 30;

export type NetworkMember = {
  id: string;
  phone: string;
  ragione_sociale: string;
  piva: string;
  referente: string;
  approved_at: string;
  last_login_at: string | null;
};

/**
 * Core: data il raw session token, ritorna il member valido o null.
 * Usato sia dal cookie (web) sia dall'header Authorization (mobile).
 */
export async function getNetworkMemberByToken(
  token: string | null | undefined,
): Promise<NetworkMember | null> {
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("network_sessions")
    .select(
      "expires_at, revoked_at, member:network_members!inner(id, phone, ragione_sociale, piva, referente, approved_at, last_login_at, revoked_at)",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("network session lookup failed", error);
    return null;
  }
  if (!data) return null;
  if (data.revoked_at) return null;
  if (new Date(data.expires_at).getTime() < Date.now()) return null;

  const member = Array.isArray(data.member) ? data.member[0] : data.member;
  if (!member || member.revoked_at) return null;

  return {
    id: member.id,
    phone: member.phone,
    ragione_sociale: member.ragione_sociale,
    piva: member.piva,
    referente: member.referente,
    approved_at: member.approved_at,
    last_login_at: member.last_login_at,
  };
}

export async function getNetworkMember(): Promise<NetworkMember | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NETWORK_COOKIE_NAME)?.value;
  return getNetworkMemberByToken(token);
}

/**
 * Estrae il token dal request: prima `Authorization: Bearer <token>` (mobile),
 * altrimenti dal cookie httpOnly (web). Permette alle API route di servire entrambi.
 */
export function extractNetworkToken(req: NextRequest): string | null {
  const auth = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (auth) {
    const match = auth.match(/^Bearer\s+(.+)$/i);
    if (match) return match[1].trim();
  }
  const cookie = req.cookies.get(NETWORK_COOKIE_NAME)?.value;
  return cookie ?? null;
}

export async function getNetworkMemberFromRequest(
  req: NextRequest,
): Promise<NetworkMember | null> {
  return getNetworkMemberByToken(extractNetworkToken(req));
}

/**
 * Guard per API route/server action che richiedono network member autenticato.
 */
export async function requireNetwork(): Promise<
  { ok: true; member: NetworkMember } | { ok: false; error: string }
> {
  const member = await getNetworkMember();
  if (!member) return { ok: false, error: "Sessione scaduta. Accedi di nuovo." };
  return { ok: true, member };
}

export async function requireNetworkFromRequest(
  req: NextRequest,
): Promise<
  { ok: true; member: NetworkMember } | { ok: false; error: string }
> {
  const member = await getNetworkMemberFromRequest(req);
  if (!member) return { ok: false, error: "Sessione scaduta. Accedi di nuovo." };
  return { ok: true, member };
}
