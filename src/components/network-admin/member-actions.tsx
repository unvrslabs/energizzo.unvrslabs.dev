"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Ban, RotateCcw, Loader2 } from "lucide-react";
import {
  revokeNetworkMember,
  restoreNetworkMember,
} from "@/actions/network-admin";

export function MemberActions({
  id,
  revoked,
}: {
  id: string;
  revoked: boolean;
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

  if (revoked) {
    return (
      <button
        type="button"
        disabled={pending}
        onClick={() => run(restoreNetworkMember, "Riattivare questo membro?")}
        className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary hover:bg-primary/20 px-3 h-8 text-xs font-semibold transition-colors disabled:opacity-50"
      >
        {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
        Riattiva
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => run(revokeNetworkMember, "Revocare l'accesso a questo membro?")}
      className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/10 text-red-300 hover:bg-red-500/20 px-3 h-8 text-xs font-semibold transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
      Revoca
    </button>
  );
}
