"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { STATUS_CONFIG, STATUSES_IN_ORDER, type Status } from "@/lib/status-config";
import { updateLeadStatus } from "@/actions/update-lead";

type Props = { id: string; value: Status };

export function StatusSelect({ id, value }: Props) {
  const [pending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(async () => {
      const res = await updateLeadStatus({ id, status: next });
      if (!res.ok) {
        toast.error(`Errore: ${res.error}`);
      } else {
        toast.success(`Stato aggiornato → ${STATUS_CONFIG[next as Status].label}`);
      }
    });
  }

  return (
    <Select value={value} onValueChange={onChange} disabled={pending}>
      <SelectTrigger className="w-[200px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {STATUSES_IN_ORDER.map((s) => {
          const cfg = STATUS_CONFIG[s];
          return (
            <SelectItem key={s} value={s}>
              <span className="inline-flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                {cfg.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
