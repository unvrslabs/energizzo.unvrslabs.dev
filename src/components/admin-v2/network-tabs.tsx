"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarCheck, UserCheck, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkV2Tabs({
  counts,
}: {
  counts: { richieste: number; invitati: number; membri: number };
}) {
  const pathname = usePathname() ?? "";
  const tabs = [
    {
      href: "/dashboard/network/richieste",
      label: "Richieste",
      icon: UserPlus,
      count: counts.richieste,
      tint: "hsl(var(--v2-warn))",
    },
    {
      href: "/dashboard/network/invitati",
      label: "Invitati",
      icon: CalendarCheck,
      count: counts.invitati,
      tint: "hsl(var(--v2-info))",
    },
    {
      href: "/dashboard/network/membri",
      label: "Membri",
      icon: UserCheck,
      count: counts.membri,
      tint: "hsl(var(--v2-accent))",
    },
  ];

  return (
    <div className="v2-card p-1 flex items-center gap-1 w-fit">
      {tabs.map((t) => {
        const Icon = t.icon;
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className={cn(
              "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors",
            )}
            style={{
              background: active ? "hsl(var(--v2-bg-elev))" : "transparent",
              color: active ? "hsl(var(--v2-text))" : "hsl(var(--v2-text-dim))",
              border: `1px solid ${active ? "hsl(var(--v2-border-strong))" : "transparent"}`,
            }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: active ? t.tint : "currentColor" }} />
            {t.label}
            <span
              className="v2-mono text-[10px] font-bold px-1.5 py-0.5 rounded"
              style={{
                color: active ? t.tint : "hsl(var(--v2-text-mute))",
                background: active ? `${t.tint.replace(")", " / 0.14)")}` : "hsl(var(--v2-border))",
              }}
            >
              {t.count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
