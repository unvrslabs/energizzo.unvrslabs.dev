"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BookOpen,
  CalendarClock,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Mic,
  Sparkles,
  TrendingUp,
  UserCircle,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/v2/theme-toggle";
import { AgentChatDrawer } from "@/components/admin-v2/agent-chat-drawer";
import { NotificationsBell } from "@/components/network-v2/notifications-bell";

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
        { href: "/network/bacheca", label: "Bacheca", icon: MessageCircle },
        { href: "/network/membri", label: "Membri", icon: Users },
      ],
    },
    {
      title: "Account",
      items: [
        { href: "/network/profilo", label: "Profilo", icon: UserCircle },
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
        aria-label="Apri Max Power"
      >
        <Sparkles className="w-3.5 h-3.5" />
        <span
          className="flex-1 text-left"
          style={{ whiteSpace: "nowrap" }}
        >
          Chiedi a Max Power
        </span>
      </button>

      <AgentChatDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        endpoint="/api/network/agent-chat"
        mentionEndpoint="/api/network/agent-chat/mention"
        storageKey="ild-network-chat-v1"
        title="Max Power"
        subtitle=""
        intro="Ciao, sono Max Power. Chiedimi di delibere ARERA, testi integrati, mercato elettrico/gas, scadenze regolatorie, podcast. Usa @ per cercare una delibera specifica. Rispondo solo con dati verificabili dalle mie fonti."
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

      </nav>

      {/* Bottom stack: footer only (GME status moved to top) */}
      <div className="v2-sidebar-bottom">
        <div className="v2-sidebar-footer">
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold truncate" style={{ color: "hsl(var(--v2-text))" }}>
              {member.ragione_sociale}
            </div>
          </div>
          <NotificationsBell />
        </div>
      </div>
    </aside>
  );
}
