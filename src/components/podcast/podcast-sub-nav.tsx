"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Users2, HelpCircle, Flame, BookOpen, Mic, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard/podcast", label: "Home", icon: Home, exact: true },
  { href: "/dashboard/podcast/episodi", label: "Episodi", icon: Radio },
  { href: "/dashboard/podcast/ospiti", label: "Ospiti", icon: Users2 },
  { href: "/dashboard/podcast/domande", label: "Domande", icon: HelpCircle },
  { href: "/dashboard/podcast/temi-caldi", label: "Temi caldi", icon: Flame },
  { href: "/dashboard/podcast/glossario", label: "Glossario", icon: Mic },
  { href: "/dashboard/podcast/knowledge", label: "Knowledge", icon: BookOpen },
];

export function PodcastSubNav() {
  const pathname = usePathname();

  return (
    <nav className="liquid-glass rounded-full px-2 py-1.5 flex items-center gap-1 mx-auto w-fit max-w-full overflow-x-auto scroll-x-contained">
      {ITEMS.map((it) => {
        const active = it.exact
          ? pathname === it.href
          : pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-3 h-8 text-xs font-semibold whitespace-nowrap transition-colors shrink-0",
              active
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-white/5",
            )}
          >
            <it.icon className="h-3.5 w-3.5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
