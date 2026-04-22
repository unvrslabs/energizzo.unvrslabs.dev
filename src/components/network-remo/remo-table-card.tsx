import { cn } from "@/lib/utils";
import type { RemoColumn, RemoRow, RemoSection } from "@/lib/remo/types";

function formatCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return "—";
    const abs = Math.abs(value);
    if (abs !== 0 && abs < 0.0001) {
      return value.toExponential(4).replace(".", ",");
    }
    const decimals = abs >= 100 ? 2 : abs >= 1 ? 4 : 6;
    return value
      .toLocaleString("it-IT", {
        minimumFractionDigits: 0,
        maximumFractionDigits: decimals,
      });
  }
  return String(value);
}

export function RemoTableCard({ section }: { section: RemoSection }) {
  const columns: RemoColumn[] = section.columns ?? [];
  const rows: RemoRow[] = section.rows ?? [];

  return (
    <section className="dispaccio-card rounded-[1.75rem] overflow-hidden">
      <header className="px-5 md:px-6 pt-5 md:pt-6 pb-4 border-b border-white/5">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-primary/80 mb-1.5">
          {section.group_label}
        </p>
        <h3 className="text-lg md:text-xl font-bold tracking-tight text-foreground">
          {section.title}
        </h3>
        {section.subtitle && (
          <p className="text-xs md:text-sm text-muted-foreground mt-1">
            {section.subtitle}
          </p>
        )}
        {section.description && (
          <p className="text-xs md:text-[13px] text-muted-foreground/80 leading-relaxed mt-3 max-w-3xl">
            {section.description}
          </p>
        )}
      </header>

      {columns.length > 0 && rows.length > 0 ? (
        <>
          <div className="hidden md:block overflow-x-auto scroll-x-contained">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/5">
                  {columns.map((c) => (
                    <th
                      key={c.key}
                      className={cn(
                        "px-4 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-muted-foreground whitespace-nowrap",
                        c.align === "right" && "text-right",
                        c.align === "center" && "text-center",
                      )}
                    >
                      <div className="flex flex-col gap-0.5">
                        <span className="text-foreground/80">{c.label}</span>
                        {c.unit && (
                          <span className="text-[10px] normal-case tracking-normal text-muted-foreground/60 font-medium">
                            {c.unit}
                          </span>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={cn(
                      "border-b border-white/5 last:border-0 transition-colors hover:bg-white/[0.03]",
                      idx === 0 && "bg-primary/[0.06]",
                    )}
                  >
                    {columns.map((c, ci) => {
                      const value = row[c.key];
                      return (
                        <td
                          key={c.key}
                          className={cn(
                            "px-4 py-3 whitespace-nowrap tabular-nums",
                            ci === 0
                              ? "font-semibold text-foreground"
                              : "text-foreground/85",
                            c.highlight && "font-bold text-primary",
                            c.align === "right" && "text-right",
                            c.align === "center" && "text-center",
                          )}
                        >
                          {formatCell(value)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="md:hidden divide-y divide-white/5">
            {rows.map((row, idx) => {
              const [first, ...rest] = columns;
              return (
                <div
                  key={idx}
                  className={cn(
                    "p-4 space-y-2",
                    idx === 0 && "bg-primary/[0.06]",
                  )}
                >
                  {first && (
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-muted-foreground">
                        {first.label}
                      </span>
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        {formatCell(row[first.key])}
                      </span>
                    </div>
                  )}
                  {rest.length > 0 && (
                    <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 pt-1">
                      {rest.map((c) => (
                        <div key={c.key} className="min-w-0">
                          <dt className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70 truncate">
                            {c.label}
                            {c.unit && (
                              <span className="text-muted-foreground/50 normal-case tracking-normal ml-1">
                                {c.unit}
                              </span>
                            )}
                          </dt>
                          <dd
                            className={cn(
                              "text-[13px] tabular-nums font-medium text-foreground/90 truncate",
                              c.highlight && "font-bold text-primary",
                            )}
                          >
                            {formatCell(row[c.key])}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  )}
                </div>
              );
            })}
          </div>
        </>
      ) : (
        <div className="p-6 text-sm text-muted-foreground">
          Nessun dato disponibile per questa sezione.
        </div>
      )}

      {section.footnote && (
        <footer className="px-5 md:px-6 py-3 border-t border-white/5 bg-white/[0.02]">
          <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
            {section.footnote}
          </p>
        </footer>
      )}
    </section>
  );
}
