import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { hashSessionToken } from "@/lib/network/crypto";

export const ADMIN_COOKIE_NAME = "ildispaccio_admin";
export const ADMIN_SESSION_TTL_DAYS = 14;

export type AdminMember = {
  id: string;
  phone: string;
  nome: string;
  role: string;
  last_login_at: string | null;
};

export async function getAdminMember(): Promise<AdminMember | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashSessionToken(token);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("admin_sessions")
    .select(
      "expires_at, revoked_at, member:admin_members!inner(id, phone, nome, role, last_login_at, revoked_at)",
    )
    .eq("token_hash", tokenHash)
    .maybeSingle();

  if (error) {
    console.error("admin session lookup failed", error);
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
    nome: member.nome,
    role: member.role,
    last_login_at: member.last_login_at,
  };
}

/**
 * Guard per server actions admin. Usa in cima a ogni action che richiede autenticazione:
 *   const auth = await requireAdmin();
 *   if (!auth.ok) return auth;
 */
export async function requireAdmin(): Promise<
  { ok: true; member: AdminMember } | { ok: false; error: string }
> {
  const member = await getAdminMember();
  if (!member) return { ok: false, error: "Sessione scaduta. Accedi di nuovo." };
  return { ok: true, member };
}
