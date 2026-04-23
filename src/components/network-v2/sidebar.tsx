"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  CalendarClock,
  Activity,
  Mic,
  Users,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

const SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { href: "/network/v2", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    title: "Compliance",
    items: [
      { href: "/network/v2/delibere", label: "Delibere ARERA", icon: FileText, badge: "8" },
      { href: "/network/v2/scadenze", label: "Scadenze", icon: CalendarClock, badge: "5" },
    ],
  },
  {
    title: "Mercato",
    items: [
      { href: "/network/v2/price-engine", label: "Price Engine", icon: Activity },
    ],
  },
  {
    title: "Media",
    items: [
      { href: "/network/v2/podcast", label: "Podcast", icon: Mic },
    ],
  },
  {
    title: "Network",
    items: [
      { href: "/network/v2/membri", label: "Membri", icon: Users },
    ],
  },
];

export function V2Sidebar({
  member,
}: {
  member: { referente: string; ragione_sociale: string };
}) {
  const pathname = usePathname() ?? "";
  const initial = member.referente.trim().charAt(0).toUpperCase() || "·";

  return (
    <aside className="v2-sidebar">
      <Link href="/network/v2" className="v2-brand">
        <span className="v2-brand-mark">D</span>
        <span>
          <span className="block v2-brand-name">Il Dispaccio</span>
          <span className="v2-brand-tag">Terminal · v2</span>
        </span>
      </Link>

      <nav className="flex flex-col gap-0.5">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="v2-nav-section">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/network/v2"
                  ? pathname === "/network/v2"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "v2-nav-item",
                    active && "v2-nav-item--active",
                  )}
                >
                  <Icon />
                  <span>{item.label}</span>
                  {item.badge && <span className="v2-nav-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="v2-sidebar-footer">
        <div className="v2-avatar">{initial}</div>
        <div className="flex-1 min-w-0">
          <div className="text-[12.5px] font-semibold truncate" style={{ color: "hsl(var(--v2-text))" }}>
            {member.referente}
          </div>
          <div className="text-[10.5px] truncate" style={{ color: "hsl(var(--v2-text-mute))" }}>
            {member.ragione_sociale}
          </div>
        </div>
        <LogoutButton />
      </div>
    </aside>
  );
}

function LogoutButton() {
  async function doLogout() {
    try {
      await fetch("/api/network/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/";
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
