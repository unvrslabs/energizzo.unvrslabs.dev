"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users2, Target } from "lucide-react";
import { cn } from "@/lib/utils";

const ICONS = {
  users: Users2,
  target: Target,
} as const;

type Item = { href: string; label: string; icon: keyof typeof ICONS };

export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1 flex-1">
      {items.map((it) => {
        const Icon = ICONS[it.icon];
        const active =
          it.href === "/dashboard"
            ? pathname === "/dashboard" || pathname.startsWith("/dashboard/leads")
            : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm transition-all",
              active
                ? "bg-gradient-primary text-primary-foreground shadow-md shadow-primary/30"
                : "text-muted-foreground hover:text-foreground hover:bg-accent/10",
            )}
          >
            <Icon className="h-4 w-4" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
