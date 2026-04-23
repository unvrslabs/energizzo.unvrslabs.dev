"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Command } from "lucide-react";

export function V2Topbar() {
  const [now, setNow] = useState<string>(() => formatClock(new Date()));

  useEffect(() => {
    const id = setInterval(() => setNow(formatClock(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="v2-topbar">
      <div className="relative ml-auto w-full max-w-sm hidden md:block">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
        <input
          type="text"
          placeholder="Cerca delibera, codice, termine tecnico…"
          className="v2-input"
        />
        <kbd
          className="v2-mono hidden md:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px]"
          style={{
            background: "hsl(var(--v2-border))",
            color: "hsl(var(--v2-text-mute))",
          }}
        >
          <Command className="w-2.5 h-2.5" />K
        </kbd>
      </div>

      <div className="hidden lg:flex items-center gap-2">
        <span className="v2-status-pill">
          <span className="v2-mono text-[10px]" style={{ color: "hsl(var(--v2-text-mute))" }}>
            GME
          </span>
          <strong>aperto</strong>
        </span>
        <span className="v2-status-pill v2-mono">{now}</span>
      </div>

      <button
        type="button"
        className="v2-btn v2-btn--ghost"
        aria-label="Notifiche"
        style={{ padding: "6px 8px" }}
      >
        <Bell className="w-4 h-4" />
      </button>
    </div>
  );
}

function formatClock(d: Date): string {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}
