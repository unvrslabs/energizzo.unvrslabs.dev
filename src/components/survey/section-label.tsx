"use client";

export function SectionLabel({ index, label }: { index: number; label: string }) {
  return (
    <div className="mb-6 flex items-center gap-3">
      <span className="section-pill">
        <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_hsl(158_64%_42%)]" />
        Sezione {index}/7
      </span>
      <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">
        {label}
      </span>
    </div>
  );
}
