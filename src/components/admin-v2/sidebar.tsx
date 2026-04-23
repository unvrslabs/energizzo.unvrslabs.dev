"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  Command,
  LayoutDashboard,
  LogOut,
  Mic,
  Network as NetworkIcon,
  Search,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badgeKey?: "leads" | "networkPending" | "guestsTarget";
};

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/dashboard-v2", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CRM",
    items: [
      { href: "/dashboard-v2/lead", label: "Lead", icon: Users, badgeKey: "leads" },
      { href: "/dashboard-v2/network", label: "Network", icon: NetworkIcon, badgeKey: "networkPending" },
      { href: "/dashboard-v2/price-engine", label: "Price Engine", icon: Activity },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/dashboard-v2/podcast", label: "Podcast", icon: Mic, badgeKey: "guestsTarget" },
    ],
  },
  {
    title: "Strategy",
    items: [
      { href: "/dashboard-v2/strategia", label: "Strategia", icon: Target },
    ],
  },
];

function formatClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export type AdminV2Counts = {
  leads?: number;
  networkPending?: number;
  guestsTarget?: number;
};

function fmtBadge(n?: number): string | undefined {
  if (n === undefined || n === null) return undefined;
  if (n === 0) return undefined;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export function AdminV2Sidebar({
  admin,
  counts,
}: {
  admin: { nome: string; role: string };
  counts?: AdminV2Counts;
}) {
  const pathname = usePathname() ?? "";
  const [now, setNow] = useState<string>(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="v2-sidebar">
      <Link href="/dashboard-v2" className="v2-brand">
        <span className="v2-brand-mark">A</span>
        <span className="flex flex-col leading-tight">
          <span className="v2-brand-name">Il Dispaccio</span>
          <span
            className="v2-mono text-[9px] font-bold uppercase tracking-[0.18em]"
            style={{ color: "hsl(var(--v2-warn))" }}
          >
            Admin
          </span>
        </span>
      </Link>

      <div className="v2-sidebar-search">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
        <input type="text" placeholder="Cerca lead, membri…" className="v2-input" />
        <kbd
          className="v2-mono absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
          style={{ background: "hsl(var(--v2-border))", color: "hsl(var(--v2-text-mute))" }}
        >
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </div>

      <nav className="flex flex-col gap-0.5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="v2-nav-section">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard-v2"
                  ? pathname === "/dashboard-v2"
                  : pathname.startsWith(item.href);
              const badge = item.badgeKey ? fmtBadge(counts?.[item.badgeKey]) : undefined;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("v2-nav-item", active && "v2-nav-item--active")}
                >
                  <Icon />
                  <span>{item.label}</span>
                  {badge && <span className="v2-nav-badge">{badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}

        <button
          type="button"
          onClick={() => {
            fetch("/api/admin/auth/logout", { method: "POST" }).finally(() => {
              window.location.href = "/login";
            });
          }}
          className="v2-nav-item lg:hidden"
          aria-label="Esci"
        >
          <LogOut />
          <span>Esci</span>
        </button>
      </nav>

      <div className="v2-sidebar-bottom">
        <div className="v2-sidebar-status">
          <span className="v2-status-dot" />
          <span className="text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
            DB <strong style={{ color: "hsl(var(--v2-text))", fontWeight: 600 }}>online</strong>
          </span>
          <span className="v2-mono text-[11px] ml-auto" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {now}
          </span>
        </div>

        <div className="v2-sidebar-footer">
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate" style={{ color: "hsl(var(--v2-text))" }}>
              {admin.nome}
            </div>
            <div className="text-[10.5px] truncate v2-mono uppercase tracking-[0.1em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              {admin.role}
            </div>
          </div>
          <button type="button" className="v2-btn v2-btn--ghost relative" aria-label="Notifiche" style={{ padding: "6px 8px" }}>
            <Bell className="w-3.5 h-3.5" />
            <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: "hsl(var(--v2-warn))" }} />
          </button>
          <AdminLogoutButton />
        </div>
      </div>
    </aside>
  );
}

function AdminLogoutButton() {
  async function doLogout() {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/login";
  }
  return (
    <button
      type="button"
      onClick={doLogout}
      aria-label="Esci"
      className="v2-btn v2-btn--ghost"
      style={{ padding: "6px 8px" }}
    >
      <LogOut className="w-3.5 h-3.5" />
    </button>
  );
}
