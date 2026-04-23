"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  CalendarClock,
  Command,
  FileText,
  LayoutDashboard,
  LogOut,
  Mic,
  Search,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

function buildSections(counts: { delibere: number; scadenze: number }) {
  const sections: { title: string; items: NavItem[] }[] = [
    {
      title: "Overview",
      items: [
        { href: "/network", label: "Dashboard", icon: LayoutDashboard },
      ],
    },
    {
      title: "Compliance",
      items: [
        {
          href: "/network/delibere",
          label: "Delibere ARERA",
          icon: FileText,
          badge: counts.delibere > 0 ? String(counts.delibere) : undefined,
        },
        {
          href: "/network/scadenze",
          label: "Scadenze",
          icon: CalendarClock,
          badge: counts.scadenze > 0 ? String(counts.scadenze) : undefined,
        },
      ],
    },
    {
      title: "Mercato",
      items: [
        { href: "/network/price-engine", label: "Price Engine", icon: Activity },
      ],
    },
    {
      title: "Media",
      items: [
        { href: "/network/podcast", label: "Podcast", icon: Mic },
      ],
    },
    {
      title: "Network",
      items: [
        { href: "/network/membri", label: "Membri", icon: Users },
      ],
    },
  ];
  return sections;
}

function formatClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function V2Sidebar({
  member,
  counts,
}: {
  member: { referente: string; ragione_sociale: string };
  counts: { delibere: number; scadenze: number };
}) {
  const pathname = usePathname() ?? "";
  const [now, setNow] = useState<string>(() => formatClock(new Date()));
  const sections = buildSections(counts);

  useEffect(() => {
    const id = setInterval(() => setNow(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <aside className="v2-sidebar">
      <Link href="/network" className="v2-brand">
        <span className="v2-brand-mark">D</span>
        <span className="v2-brand-name">Il Dispaccio</span>
      </Link>

      {/* Search */}
      <div className="v2-sidebar-search">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
        <input
          type="text"
          placeholder="Cerca…"
          className="v2-input"
        />
        <kbd
          className="v2-mono absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
          style={{
            background: "hsl(var(--v2-border))",
            color: "hsl(var(--v2-text-mute))",
          }}
        >
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </div>

      <nav className="flex flex-col gap-0.5">
        {sections.map((section) => (
          <div key={section.title}>
            <div className="v2-nav-section">{section.title}</div>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active =
                item.href === "/network"
                  ? pathname === "/network"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn("v2-nav-item", active && "v2-nav-item--active")}
                >
                  <Icon />
                  <span>{item.label}</span>
                  {item.badge && <span className="v2-nav-badge">{item.badge}</span>}
                </Link>
              );
            })}
          </div>
        ))}

        {/* Mobile-only: logout come nav item */}
        <button
          type="button"
          onClick={() => {
            fetch("/api/network/auth/logout", { method: "POST" }).finally(() => {
              window.location.href = "/";
            });
          }}
          className="v2-nav-item lg:hidden"
          aria-label="Esci"
        >
          <LogOut />
          <span>Esci</span>
        </button>
      </nav>

      {/* Bottom stack: status + footer */}
      <div className="v2-sidebar-bottom">
        <div className="v2-sidebar-status">
          <span className="v2-status-dot" />
          <span className="text-[11px]" style={{ color: "hsl(var(--v2-text-dim))" }}>
            GME <strong style={{ color: "hsl(var(--v2-text))", fontWeight: 600 }}>aperto</strong>
          </span>
          <span className="v2-mono text-[11px] ml-auto" style={{ color: "hsl(var(--v2-text-dim))" }}>
            {now}
          </span>
        </div>

        <div className="v2-sidebar-footer">
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate" style={{ color: "hsl(var(--v2-text))" }}>
              {member.ragione_sociale}
            </div>
          </div>
          <button
            type="button"
            className="v2-btn v2-btn--ghost relative"
            aria-label="Notifiche"
            style={{ padding: "6px 8px" }}
          >
            <Bell className="w-3.5 h-3.5" />
            <span
              className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full"
              style={{ background: "hsl(var(--v2-warn))" }}
            />
          </button>
          <LogoutButton />
        </div>
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
