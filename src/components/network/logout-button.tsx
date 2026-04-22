"use client";

import { useState } from "react";
import { LogOut, Loader2 } from "lucide-react";

export function NetworkLogoutButton() {
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    try {
      await fetch("/api/network/auth/logout", { method: "POST" });
    } catch {
      // ignore: navigate anyway
    }
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-white/[0.08] transition-colors disabled:opacity-60"
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      Esci
    </button>
  );
}
