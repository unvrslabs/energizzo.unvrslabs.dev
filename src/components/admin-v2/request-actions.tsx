"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, RotateCcw, X } from "lucide-react";
import { toast } from "sonner";
import {
  approveNetworkRequest,
  rejectNetworkRequest,
  reopenNetworkRequest,
} from "@/actions/network-admin";

export function RequestActionsV2({ id, status }: { id: string; status: string | null }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  function run(action: "approve" | "reject" | "reopen") {
    setLoadingAction(action);
    startTransition(async () => {
      try {
        const res =
          action === "approve"
            ? await approveNetworkRequest({ id })
            : action === "reject"
            ? await rejectNetworkRequest({ id })
            : await reopenNetworkRequest({ id });
        if (!res.ok) {
          toast.error(res.error ?? "Errore");
        } else {
          toast.success(
            action === "approve"
              ? "Richiesta approvata"
              : action === "reject"
              ? "Richiesta rifiutata"
              : "Richiesta riaperta",
          );
          router.refresh();
        }
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Errore");
      } finally {
        setLoadingAction(null);
      }
    });
  }

  if (status === "approved") {
    return (
      <span className="v2-mono inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded"
        style={{ color: "hsl(var(--v2-accent))", background: "hsl(var(--v2-accent) / 0.12)" }}>
        <Check className="w-3 h-3" /> Approvata
      </span>
    );
  }

  if (status === "rejected") {
    return (
      <div className="flex items-center gap-1.5">
        <span className="v2-mono inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.1em] px-2 py-1 rounded"
          style={{ color: "hsl(var(--v2-danger))", background: "hsl(var(--v2-danger) / 0.12)" }}>
          Rifiutata
        </span>
        <button
          type="button"
          onClick={() => run("reopen")}
          disabled={pending}
          className="v2-btn v2-btn--ghost"
          style={{ padding: "4px 8px", fontSize: "11px" }}
        >
          {loadingAction === "reopen" ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
          Riapri
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => run("approve")}
        disabled={pending}
        className="v2-btn v2-btn--primary"
        style={{ padding: "4px 10px", fontSize: "11.5px" }}
      >
        {loadingAction === "approve" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
        Approva
      </button>
      <button
        type="button"
        onClick={() => run("reject")}
        disabled={pending}
        className="v2-btn"
        style={{ padding: "4px 10px", fontSize: "11.5px", color: "hsl(var(--v2-danger))" }}
      >
        {loadingAction === "reject" ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
        Rifiuta
      </button>
    </div>
  );
}
