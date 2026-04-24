"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Activity,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Mic,
  Network as NetworkIcon,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/v2/theme-toggle";
import { AgentChatDrawer } from "@/components/admin-v2/agent-chat-drawer";

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
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "CRM",
    items: [
      { href: "/dashboard/lead", label: "Lead", icon: Users, badgeKey: "leads" },
      { href: "/dashboard/network", label: "Network", icon: NetworkIcon, badgeKey: "networkPending" },
      { href: "/dashboard/price-engine", label: "Price Engine", icon: Activity },
    ],
  },
  {
    title: "Content",
    items: [
      { href: "/dashboard/podcast", label: "Podcast", icon: Mic, badgeKey: "guestsTarget" },
      { href: "/dashboard/social", label: "Social", icon: Megaphone },
    ],
  },
  {
    title: "Strategy",
    items: [
      { href: "/dashboard/strategia", label: "Strategia", icon: Target },
    ],
  },
];

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
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <aside className="v2-sidebar">
      <div className="v2-sidebar-top">
        <Link href="/dashboard" className="v2-brand">
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
        <ThemeToggle />
      </div>

      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="v2-sidebar-ai-trigger"
        aria-label="Apri Agente AI"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Chat AI</span>
        <span
          className="v2-mono text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "hsl(var(--v2-accent))", opacity: 0.7 }}
        >
          Agente
        </span>
      </button>

      <AgentChatDrawer open={chatOpen} onClose={() => setChatOpen(false)} />

      <nav className="flex flex-col gap-0.5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="v2-nav-section">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
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
        <div className="v2-sidebar-footer">
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate" style={{ color: "hsl(var(--v2-text))" }}>
              {admin.nome}
            </div>
            <div className="text-[10.5px] truncate v2-mono uppercase tracking-[0.1em]" style={{ color: "hsl(var(--v2-text-mute))" }}>
              {admin.role}
            </div>
          </div>
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
