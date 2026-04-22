"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface RemoNavItem {
  slug: string;
  label: string;
}

export function RemoSectionNav({ items }: { items: RemoNavItem[] }) {
  const [active, setActive] = useState<string | null>(items[0]?.slug ?? null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const observers: IntersectionObserver[] = [];
    const handler = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      {
        rootMargin: "-30% 0px -60% 0px",
        threshold: [0, 0.25, 0.5],
      },
    );
    for (const item of items) {
      const el = document.getElementById(item.slug);
      if (el) handler.observe(el);
    }
    observers.push(handler);
    return () => {
      for (const o of observers) o.disconnect();
    };
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav className="liquid-glass-nav rounded-full p-1.5 overflow-x-auto scroll-x-contained">
      <div className="flex items-center gap-1 min-w-max">
        {items.map((item) => {
          const isActive = item.slug === active;
          return (
            <a
              key={item.slug}
              href={`#${item.slug}`}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[12px] font-semibold whitespace-nowrap transition-all",
                isActive
                  ? "bg-primary/20 text-primary shadow-sm shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/5",
              )}
            >
              {item.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}
