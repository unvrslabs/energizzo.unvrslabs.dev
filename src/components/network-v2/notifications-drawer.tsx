"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Bell,
  BellOff,
  CalendarClock,
  Check,
  CheckCheck,
  FileText,
  Mic,
  X,
} from "lucide-react";

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

const TYPE_META: Record<
  NotificationType,
  { icon: React.ComponentType<{ className?: string }>; label: string }
> = {
  delibera_alta: { icon: FileText, label: "Delibera" },
  scadenza_imminente: { icon: CalendarClock, label: "Scadenza" },
  podcast_published: { icon: Mic, label: "Podcast" },
};

function relativeTime(iso: string): string {
  const diffSec = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (diffSec < 60) return "ora";
  const min = Math.round(diffSec / 60);
  if (min < 60) return `${min}m fa`;
  const hr = Math.round(min / 60);
  if (hr < 24) return `${hr}h fa`;
  const day = Math.round(hr / 24);
  if (day < 7) return `${day}g fa`;
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "short" });
}

function severityColor(s: NotificationSeverity): string {
  if (s === "high") return "hsl(var(--v2-danger))";
  if (s === "medium") return "hsl(var(--v2-warn))";
  return "hsl(var(--v2-info))";
}

export function NotificationsDrawer({
  open,
  onClose,
  initialItems,
  onChange,
}: {
  open: boolean;
  onClose: () => void;
  initialItems: Notification[];
  onChange: (unread: number, items: Notification[]) => void;
}) {
  const [items, setItems] = useState<Notification[]>(initialItems);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setItems(initialItems);
  }, [initialItems]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function markOne(id: string) {
    const prev = items;
    const next = items.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n));
    setItems(next);
    onChange(next.filter((n) => !n.read_at).length, next);
    try {
      await fetch("/api/network/notifications/mark-read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ids: [id] }),
      });
    } catch {
      setItems(prev);
      onChange(prev.filter((n) => !n.read_at).length, prev);
    }
  }

  async function markAll() {
    if (busy) return;
    setBusy(true);
    const prev = items;
    const now = new Date().toISOString();
    const next = items.map((n) => (n.read_at ? n : { ...n, read_at: now }));
    setItems(next);
    onChange(0, next);
    try {
      await fetch("/api/network/notifications/mark-read", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ all: true }),
      });
    } catch {
      setItems(prev);
      onChange(prev.filter((n) => !n.read_at).length, prev);
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  const unread = items.filter((n) => !n.read_at).length;

  return (
    <div
      role="dialog"
      aria-label="Notifiche"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 60,
        display: "flex",
        justifyContent: "flex-end",
        pointerEvents: "none",
      }}
    >
      <div
        onClick={onClose}
        style={{
          position: "absolute",
          inset: 0,
          background: "hsl(0 0% 0% / 0.35)",
          backdropFilter: "blur(3px)",
          pointerEvents: "auto",
        }}
      />
      <aside
        style={{
          position: "relative",
          width: "min(420px, 100vw)",
          height: "100%",
          background: "hsl(var(--v2-bg))",
          borderLeft: "1px solid hsl(var(--v2-border))",
          boxShadow: "-24px 0 48px hsl(0 0% 0% / 0.4)",
          display: "flex",
          flexDirection: "column",
          pointerEvents: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid hsl(var(--v2-border))",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 9,
                display: "grid",
                placeItems: "center",
                background: "hsl(var(--v2-accent) / 0.14)",
                border: "1px solid hsl(var(--v2-accent) / 0.32)",
                color: "hsl(var(--v2-accent))",
              }}
            >
              <Bell className="w-4 h-4" strokeWidth={2} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 700,
                  color: "hsl(var(--v2-text))",
                  lineHeight: 1.2,
                }}
              >
                Notifiche
              </div>
              <div
                className="v2-mono"
                style={{
                  fontSize: 9.5,
                  color: "hsl(var(--v2-text-mute))",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                }}
              >
                {unread > 0 ? `${unread} da leggere` : "tutto letto"}
              </div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {unread > 0 && (
              <button
                type="button"
                onClick={markAll}
                className="v2-btn v2-btn--ghost"
                style={{ padding: "6px 10px", fontSize: 11.5 }}
                disabled={busy}
                title="Segna tutte come lette"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Tutte</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="v2-btn v2-btn--ghost"
              style={{ padding: "6px 8px" }}
              aria-label="Chiudi"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* List */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {items.length === 0 ? (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 12,
                padding: 24,
                color: "hsl(var(--v2-text-mute))",
              }}
            >
              <BellOff className="w-7 h-7" />
              <div style={{ fontSize: 13, textAlign: "center" }}>
                Nessuna notifica.
                <br />
                Ti avviseremo per delibere alta importanza, scadenze entro 7 giorni
                e nuovi episodi del podcast.
              </div>
            </div>
          ) : (
            items.map((n) => {
              const Meta = TYPE_META[n.type];
              const Icon = Meta.icon;
              const isUnread = !n.read_at;

              const inner = (
                <>
                  <span
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      display: "grid",
                      placeItems: "center",
                      background: isUnread
                        ? "hsl(var(--v2-accent) / 0.10)"
                        : "hsl(var(--v2-card))",
                      color: isUnread
                        ? "hsl(var(--v2-accent))"
                        : "hsl(var(--v2-text-mute))",
                      flexShrink: 0,
                      border: "1px solid hsl(var(--v2-border))",
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      className="v2-mono"
                      style={{
                        fontSize: 9.5,
                        fontWeight: 700,
                        letterSpacing: "0.14em",
                        textTransform: "uppercase",
                        color: severityColor(n.severity),
                        marginBottom: 3,
                      }}
                    >
                      {Meta.label}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: isUnread ? 600 : 500,
                        color: "hsl(var(--v2-text))",
                        lineHeight: 1.35,
                      }}
                    >
                      {n.title}
                    </div>
                    {n.body && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "hsl(var(--v2-text-dim))",
                          marginTop: 3,
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {n.body}
                      </div>
                    )}
                    <div
                      className="v2-mono"
                      style={{
                        fontSize: 10,
                        color: "hsl(var(--v2-text-mute))",
                        marginTop: 6,
                      }}
                    >
                      {relativeTime(n.created_at)}
                    </div>
                  </div>
                  {isUnread && (
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: 999,
                        background: "hsl(var(--v2-accent))",
                        boxShadow: "0 0 6px hsl(var(--v2-accent) / 0.6)",
                        flexShrink: 0,
                        marginTop: 4,
                      }}
                    />
                  )}
                </>
              );

              const rowStyle: React.CSSProperties = {
                display: "flex",
                gap: 12,
                padding: "12px 16px",
                borderBottom: "1px solid hsl(var(--v2-border))",
                cursor: n.link ? "pointer" : "default",
                background: isUnread ? "hsl(var(--v2-accent) / 0.025)" : "transparent",
                transition: "background 120ms ease",
              };

              return n.link ? (
                <Link
                  key={n.id}
                  href={n.link}
                  onClick={() => {
                    if (isUnread) void markOne(n.id);
                    onClose();
                  }}
                  style={{ ...rowStyle, textDecoration: "none" }}
                >
                  {inner}
                </Link>
              ) : (
                <div
                  key={n.id}
                  style={rowStyle}
                  onClick={() => {
                    if (isUnread) void markOne(n.id);
                  }}
                >
                  {inner}
                  {isUnread && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        void markOne(n.id);
                      }}
                      className="v2-btn v2-btn--ghost"
                      style={{ padding: "4px 6px" }}
                      title="Segna come letta"
                    >
                      <Check className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </aside>
    </div>
  );
}
