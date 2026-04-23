"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Shield, ShieldOff } from "lucide-react";
import { toast } from "sonner";
import { revokeNetworkMember, restoreNetworkMember } from "@/actions/network-admin";

export function MemberActionsV2({ id, revoked }: { id: string; revoked: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loading, setLoading] = useState(false);

  function run() {
    if (!confirm(revoked ? "Riattivare il membro?" : "Revocare l'accesso al membro?")) return;
    setLoading(true);
    startTransition(async () => {
      try {
        const res = revoked
          ? await restoreNetworkMember({ id })
          : await revokeNetworkMember({ id });
        if (!res.ok) {
          toast.error(res.error ?? "Errore");
        } else {
          toast.success(revoked ? "Membro riattivato" : "Accesso revocato");
          router.refresh();
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Errore");
      } finally {
        setLoading(false);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={run}
      disabled={pending}
      className="v2-btn"
      style={{
        padding: "4px 10px",
        fontSize: "11.5px",
        color: revoked ? "hsl(var(--v2-accent))" : "hsl(var(--v2-danger))",
      }}
    >
      {loading ? (
        <Loader2 className="w-3 h-3 animate-spin" />
      ) : revoked ? (
        <Shield className="w-3 h-3" />
      ) : (
        <ShieldOff className="w-3 h-3" />
      )}
      {revoked ? "Riattiva" : "Revoca"}
    </button>
  );
}
