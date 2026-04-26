"use client";

import { useState } from "react";
import { Loader2, LogOut } from "lucide-react";

export function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/network/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/";
  }

  return (
    <button
      type="button"
      onClick={logout}
      disabled={loading}
      className="v2-btn v2-btn--ghost"
      style={{ color: "hsl(var(--v2-danger))", borderColor: "hsl(var(--v2-danger) / 0.3)" }}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <LogOut className="w-3.5 h-3.5" />
      )}
      <span>Esci dal network</span>
    </button>
  );
}
