"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  Bell,
  BookOpen,
  CalendarClock,
  FileText,
  LayoutDashboard,
  LogOut,
  Mic,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/v2/theme-toggle";
import { AgentChatDrawer } from "@/components/admin-v2/agent-chat-drawer";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
};

function buildSections(counts: { delibere: number; testiIntegrati: number; scadenze: number }) {
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
          href: "/network/testi-integrati",
          label: "Testi Integrati",
          icon: BookOpen,
          badge: counts.testiIntegrati > 0 ? String(counts.testiIntegrati) : undefined,
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
        { href: "/network/mercato", label: "Dati mercato", icon: TrendingUp },
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

function romeTimeParts(d: Date): { hh: string; mm: string; ss: string; hour: number; minute: number } {
  // Usa sempre Europe/Rome, indipendentemente dal timezone del browser
  const parts = new Intl.DateTimeFormat("it-IT", {
    timeZone: "Europe/Rome",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
  const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
  const ss = parts.find((p) => p.type === "second")?.value ?? "00";
  return { hh, mm, ss, hour: Number(hh), minute: Number(mm) };
}

function formatClock(d: Date): string {
  const { hh, mm, ss } = romeTimeParts(d);
  return `${hh}:${mm}:${ss}`;
}

/**
 * Stato mercato MGP (Mercato del Giorno Prima, GME).
 * Apertura seduta: 08:00 — Chiusura: 12:00 (timezone Europe/Rome, 7/7 giorni).
 * Pubblicazione esiti entro le 12:55, ma per il reseller lo stato "negoziazione"
 * finisce alle 12:00.
 * Fonte: gme.it / mercatoelettrico.org
 */
type MgpStatus = "open" | "closed";

function mgpStatus(d: Date): MgpStatus {
  const { hour } = romeTimeParts(d);
  return hour >= 8 && hour < 12 ? "open" : "closed";
}

export function V2Sidebar({
  member,
  counts,
}: {
  member: { referente: string; ragione_sociale: string };
  counts: { delibere: number; testiIntegrati: number; scadenze: number };
}) {
  const pathname = usePathname() ?? "";
  const [chatOpen, setChatOpen] = useState(false);
  const sections = buildSections(counts);

  return (
    <aside className="v2-sidebar">
      <div className="v2-sidebar-top">
        <Link href="/network" className="v2-brand">
          <img src="/logo-mark.png" alt="Il Dispaccio" className="v2-brand-mark" />
          <span className="v2-brand-name">Il Dispaccio</span>
        </Link>
        <ThemeToggle />
      </div>

      <button
        type="button"
        onClick={() => setChatOpen(true)}
        className="v2-sidebar-ai-trigger"
        aria-label="Apri Agente AI Il Dispaccio"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span className="flex-1 text-left">Chiedi a Il Dispaccio</span>
        <span
          className="v2-mono text-[9px] font-bold uppercase tracking-[0.14em]"
          style={{ color: "hsl(var(--v2-accent))", opacity: 0.75 }}
        >
          Agente
        </span>
      </button>

      <AgentChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        endpoint="/api/network/agent-chat"
        storageKey="ild-network-chat-v1"
        title="Agente Il Dispaccio"
        subtitle="Delibere · Mercato · Scadenze"
        intro="Fammi domande su delibere ARERA, testi integrati, mercato elettrico/gas, scadenze regolatorie, podcast. Rispondo solo con dati verificabili dalle mie fonti."
        suggestions={[
          "Spiegami la delibera 40/2014/R/gas",
          "Qual è il PUN oggi?",
          "Quanto sono pieni gli stoccaggi gas?",
          "Scadenze regolatorie nei prossimi 14 giorni",
          "Cerca delibere su dispacciamento",
          "Ultimi episodi del podcast",
        ]}
      />

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

      {/* Bottom stack: footer only (GME status moved to top) */}
      <div className="v2-sidebar-bottom">
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
