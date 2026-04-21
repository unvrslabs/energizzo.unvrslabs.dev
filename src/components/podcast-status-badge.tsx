import { cn } from "@/lib/utils";

type Props = { status: string | null };

const CONFIG: Record<string, { label: string; className: string }> = {
  target: { label: "Target", className: "border-slate-500/50 text-slate-300 bg-slate-500/10" },
  invited: { label: "Invitato", className: "border-sky-500/50 text-sky-300 bg-sky-500/10" },
  confirmed: {
    label: "Confermato",
    className: "border-violet-500/50 text-violet-300 bg-violet-500/10",
  },
  recorded: {
    label: "Registrato",
    className: "border-fuchsia-500/50 text-fuchsia-300 bg-fuchsia-500/10",
  },
  published: {
    label: "Pubblicato",
    className: "border-emerald-500/50 text-emerald-300 bg-emerald-500/10",
  },
  rejected: { label: "Rifiutato", className: "border-red-500/50 text-red-300 bg-red-500/10" },
};

export function PodcastStatusBadge({ status }: Props) {
  if (!status) {
    return <span className="text-xs text-muted-foreground/60">—</span>;
  }
  const cfg = CONFIG[status] ?? { label: status, className: "border-border/60 text-muted-foreground" };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}
