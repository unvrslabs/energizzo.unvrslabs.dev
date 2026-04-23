"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  FileText,
  Flame,
  Home,
  MessageSquare,
  Mic,
  Radio,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";

type TabItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  exact?: boolean;
};

const TABS: TabItem[] = [
  { href: "/dashboard-v2/podcast", label: "Home", icon: Home, exact: true },
  { href: "/dashboard-v2/podcast/episodi", label: "Episodi", icon: Radio },
  { href: "/dashboard-v2/podcast/ospiti", label: "Ospiti", icon: Users },
  { href: "/dashboard-v2/podcast/temi-caldi", label: "Temi caldi", icon: Flame },
  { href: "/dashboard-v2/podcast/glossario", label: "Glossario", icon: BookOpen },
  { href: "/dashboard-v2/podcast/knowledge", label: "Knowledge", icon: FileText },
];

export function PodcastV2Tabs() {
  const pathname = usePathname() ?? "";
  return (
    <div className="v2-card p-1 flex items-center gap-0.5 w-fit max-w-full overflow-x-auto">
      {TABS.map((t) => {
        const Icon = t.icon;
        const active = t.exact ? pathname === t.href : pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-[12.5px] font-medium transition-colors whitespace-nowrap",
            )}
            style={{
              background: active ? "hsl(var(--v2-bg-elev))" : "transparent",
              color: active ? "hsl(var(--v2-text))" : "hsl(var(--v2-text-dim))",
              border: `1px solid ${active ? "hsl(var(--v2-border-strong))" : "transparent"}`,
            }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: active ? "hsl(var(--v2-accent))" : "currentColor" }} />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
