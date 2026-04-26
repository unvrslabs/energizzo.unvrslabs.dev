import { createAdminClient } from "@/lib/supabase/admin";

export type NotificationType =
  | "delibera_alta"
  | "scadenza_imminente"
  | "podcast_published";

export type NotificationSeverity = "low" | "medium" | "high";

export type NetworkNotification = {
  id: string;
  member_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  severity: NotificationSeverity;
  payload: Record<string, unknown> | null;
  created_at: string;
  read_at: string | null;
};

const LIST_LIMIT = 50;

export async function listNotifications(
  memberId: string,
): Promise<NetworkNotification[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("network_notifications")
    .select("id, member_id, type, title, body, link, severity, payload, created_at, read_at")
    .eq("member_id", memberId)
    .order("created_at", { ascending: false })
    .limit(LIST_LIMIT);

  if (error) {
    console.error("listNotifications failed", error);
    return [];
  }
  return (data ?? []) as NetworkNotification[];
}

export async function countUnread(memberId: string): Promise<number> {
  const supabase = createAdminClient();
  const { count, error } = await supabase
    .from("network_notifications")
    .select("id", { count: "exact", head: true })
    .eq("member_id", memberId)
    .is("read_at", null);

  if (error) {
    console.error("countUnread failed", error);
    return 0;
  }
  return count ?? 0;
}

export async function markRead(
  memberId: string,
  notificationIds: string[] | "all",
): Promise<number> {
  const supabase = createAdminClient();
  let query = supabase
    .from("network_notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("member_id", memberId)
    .is("read_at", null);

  if (notificationIds !== "all") {
    if (notificationIds.length === 0) return 0;
    query = query.in("id", notificationIds);
  }

  const { data, error } = await query.select("id");
  if (error) {
    console.error("markRead failed", error);
    return 0;
  }
  return data?.length ?? 0;
}

/**
 * Crea notifiche `scadenza_imminente` per scadenze entro N giorni che non
 * sono ancora state notificate. Da chiamare dal cron giornaliero.
 * La dedup_key garantisce idempotenza per (delibera, data, label).
 */
export async function syncScadenzeImminenti(days = 7): Promise<number> {
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("list_scadenze_imminenti", { p_days: days });
  if (error) {
    console.error("list_scadenze_imminenti failed", error);
    return 0;
  }

  let total = 0;
  for (const row of (data ?? []) as Array<{
    delibera_id: number;
    delibera_numero: string;
    delibera_titolo: string;
    scadenza_date: string;
    scadenza_label: string;
    scadenza_tipo: string;
    giorni_residui: number;
    dedup_key: string;
  }>) {
    const sev = row.giorni_residui <= 3 ? "high" : "medium";
    const title = `Scadenza tra ${row.giorni_residui}g: ${row.scadenza_label}`;
    const body = `${row.delibera_numero} · ${row.delibera_titolo}`;
    const link = `/network/delibere?open=${encodeURIComponent(row.delibera_numero)}`;

    const { data: countRow, error: rpcErr } = await supabase.rpc(
      "create_broadcast_notification",
      {
        p_type: "scadenza_imminente",
        p_title: title,
        p_body: body,
        p_link: link,
        p_severity: sev,
        p_payload: {
          delibera_id: row.delibera_id,
          numero: row.delibera_numero,
          scadenza_date: row.scadenza_date,
          giorni: row.giorni_residui,
        },
        p_dedup_key: row.dedup_key,
      },
    );
    if (rpcErr) {
      console.error("create_broadcast_notification failed", rpcErr);
      continue;
    }
    total += (countRow as number) ?? 0;
  }
  return total;
}
