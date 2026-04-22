"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Inbox, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function NetworkAdminTabs({
  pendingCount,
  membersCount,
}: {
  pendingCount: number;
  membersCount: number;
}) {
  const pathname = usePathname();
  return (
    <nav className="inline-flex items-center gap-1 rounded-full liquid-glass-nav p-1">
      <Tab
        href="/dashboard/network/richieste"
        active={pathname?.startsWith("/dashboard/network/richieste") ?? false}
        icon={<Inbox className="h-4 w-4" />}
        label="Richieste"
        badge={pendingCount}
      />
      <Tab
        href="/dashboard/network/membri"
        active={pathname?.startsWith("/dashboard/network/membri") ?? false}
        icon={<Users2 className="h-4 w-4" />}
        label="Membri"
        badge={membersCount}
      />
    </nav>
  );
}

function Tab({
  href,
  active,
  icon,
  label,
  badge,
}: {
  href: string;
  active: boolean;
  icon: React.ReactNode;
  label: string;
  badge: number;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 h-9 text-sm font-semibold transition-all",
        active
          ? "bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/40"
          : "text-muted-foreground hover:text-foreground hover:bg-white/5",
      )}
    >
      {icon}
      {label}
      {badge > 0 && (
        <span
          className={cn(
            "inline-flex items-center justify-center rounded-full px-1.5 min-w-[1.25rem] h-5 text-[11px] font-bold",
            active ? "bg-white/20" : "bg-white/10",
          )}
        >
          {badge}
        </span>
      )}
    </Link>
  );
}
