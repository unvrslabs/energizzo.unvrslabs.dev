import { cookies } from "next/headers";
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

export async function getNetworkMember(): Promise<NetworkMember | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(NETWORK_COOKIE_NAME)?.value;
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

  if (error || !data) return null;
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
