"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Zap } from "lucide-react";

const TABS = [
  { href: "/network/mercato/elettrico", label: "Elettrico", Icon: Zap },
  { href: "/network/mercato/gas", label: "Gas", Icon: Flame },
];

export function MercatoTabs() {
  const pathname = usePathname() ?? "";
  return (
    <div
      className="v2-card flex items-center gap-1 p-1"
      style={{ padding: 6, width: "fit-content" }}
    >
      {TABS.map((t) => {
        const active = pathname.startsWith(t.href);
        return (
          <Link
            key={t.href}
            href={t.href}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-md text-[13px] font-medium transition-colors"
            style={{
              background: active ? "hsl(var(--v2-accent) / 0.14)" : "transparent",
              color: active ? "hsl(var(--v2-accent))" : "hsl(var(--v2-text-dim))",
              border: active ? "1px solid hsl(var(--v2-accent) / 0.35)" : "1px solid transparent",
            }}
          >
            <t.Icon className="w-3.5 h-3.5" />
            {t.label}
          </Link>
        );
      })}
    </div>
  );
}
