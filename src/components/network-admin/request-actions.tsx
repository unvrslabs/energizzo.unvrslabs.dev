"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Check, X, RotateCcw, Loader2 } from "lucide-react";
import {
  approveNetworkRequest,
  rejectNetworkRequest,
  reopenNetworkRequest,
} from "@/actions/network-admin";

export function RequestActions({
  id,
  status,
}: {
  id: string;
  status: string | null;
}) {
  const [pending, start] = useTransition();

  function run(action: (input: { id: string }) => Promise<{ ok: true } | { ok: false; error: string }>, confirmMsg?: string) {
    if (confirmMsg && !confirm(confirmMsg)) return;
    start(async () => {
      const res = await action({ id });
      if (res.ok) toast.success("Fatto");
      else toast.error(res.error);
    });
  }

  const isPending = !status || status === "pending";
  const isApproved = status === "approved";
  const isRejected = status === "rejected";

  return (
    <div className="flex items-center gap-2">
      {isPending && (
        <>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(approveNetworkRequest, "Approva richiesta e crea membro network?")}
            className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 text-primary hover:bg-primary/25 px-3 h-8 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
            Approva
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(rejectNetworkRequest, "Rifiuta richiesta?")}
            className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 px-3 h-8 text-xs font-semibold transition-colors disabled:opacity-50"
          >
            <X className="h-3.5 w-3.5" />
            Rifiuta
          </button>
        </>
      )}
      {isApproved && (
        <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 h-8 text-xs font-semibold text-primary">
          <Check className="h-3.5 w-3.5" />
          Approvata
        </span>
      )}
      {isRejected && (
        <>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 px-3 h-8 text-xs font-semibold text-red-300">
            <X className="h-3.5 w-3.5" />
            Rifiutata
          </span>
          <button
            type="button"
            disabled={pending}
            onClick={() => run(reopenNetworkRequest)}
            className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] px-3 h-8 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Riapri
          </button>
        </>
      )}
    </div>
  );
}
