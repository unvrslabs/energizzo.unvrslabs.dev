"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { NotificationsDrawer } from "./notifications-drawer";

type NotificationType =
  | "delibera_alta"
  | "scadenza_imminente"
  | "podcast_published";

type NotificationSeverity = "low" | "medium" | "high";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link: string | null;
  severity: NotificationSeverity;
  created_at: string;
  read_at: string | null;
};

const POLL_INTERVAL_MS = 60_000;

export function NotificationsBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/network/notifications", { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as { items: Notification[]; unread: number };
      setItems(data.items ?? []);
      setUnread(data.unread ?? 0);
    } catch {
      /* offline / network error: silenzioso */
    }
  }, []);

  useEffect(() => {
    void refresh();
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") return;
      void refresh();
    }, POLL_INTERVAL_MS);
    const onFocus = () => void refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [refresh]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="v2-btn v2-btn--ghost relative"
        aria-label={unread > 0 ? `Notifiche (${unread} non lette)` : "Notifiche"}
        style={{ padding: "6px 8px" }}
      >
        <Bell className="w-3.5 h-3.5" />
        {unread > 0 && (
          <span
            className="v2-mono"
            style={{
              position: "absolute",
              top: -4,
              right: -4,
              minWidth: 16,
              height: 16,
              padding: "0 4px",
              borderRadius: 999,
              background: "hsl(var(--v2-danger))",
              color: "hsl(0 0% 100%)",
              fontSize: 9.5,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              boxShadow: "0 0 0 2px hsl(var(--v2-bg-elev))",
            }}
          >
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      <NotificationsDrawer
        open={open}
        onClose={() => setOpen(false)}
        initialItems={items}
        onChange={(u, items) => {
          setUnread(u);
          setItems(items);
        }}
      />
    </>
  );
}
