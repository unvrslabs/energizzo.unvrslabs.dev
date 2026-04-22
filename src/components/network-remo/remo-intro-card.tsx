import { cn } from "@/lib/utils";
import type { RemoCategory, RemoSection } from "@/lib/remo/types";

const GRADIENTS: Record<RemoCategory, string> = {
  luce: "from-rose-500/25 via-orange-400/15 to-amber-300/10",
  gas: "from-sky-500/25 via-cyan-400/15 to-emerald-300/10",
};

export function RemoIntroCard({
  section,
  category,
}: {
  section: RemoSection;
  category: RemoCategory;
}) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-[1.75rem] border border-white/10 p-6 md:p-8 bg-gradient-to-br",
        GRADIENTS[category],
      )}
    >
      <div className="absolute inset-0 bg-white/[0.02]" aria-hidden />
      <div className="relative">
        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-foreground/70 mb-2">
          {section.group_label}
        </p>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground mb-2">
          {section.title}
        </h2>
        {section.subtitle && (
          <p className="text-sm md:text-base text-foreground/80 font-medium mb-3">
            {section.subtitle}
          </p>
        )}
        {section.description && (
          <p className="text-sm md:text-[15px] text-foreground/70 leading-relaxed max-w-3xl">
            {section.description}
          </p>
        )}
      </div>
    </section>
  );
}
