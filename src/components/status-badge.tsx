import { STATUS_CONFIG, type Status } from "@/lib/status-config";
import { contrastText, cn } from "@/lib/utils";

type Props = { status: Status; className?: string };

export function StatusBadge({ status, className }: Props) {
  const cfg = STATUS_CONFIG[status];
  const textColor = contrastText(cfg.color) === "light" ? "#fff" : "#111827";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      )}
      style={{ backgroundColor: cfg.color, color: textColor }}
    >
      {cfg.label}
    </span>
  );
}

export function StatusDot({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />;
}
