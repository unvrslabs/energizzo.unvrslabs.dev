"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Zap } from "lucide-react";

const TABS = [
  { href: "/network/mercato/elettrico", label: "Elettrico", Icon: Zap, status: "live" as const },
  { href: "/network/mercato/gas", label: "Gas", Icon: Flame, status: "live" as const },
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
            {t.status === "coming" && (
              <span
                className="v2-mono text-[9.5px] font-semibold uppercase tracking-[0.14em] px-1.5 py-0.5 rounded"
                style={{
                  color: "hsl(var(--v2-warn))",
                  background: "hsl(var(--v2-warn) / 0.1)",
                  border: "1px solid hsl(var(--v2-warn) / 0.28)",
                }}
              >
                in arrivo
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
