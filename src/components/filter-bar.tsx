"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Search, X, MapPin, Check, ChevronDown, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  STATUS_CONFIG,
  STATUSES_IN_ORDER,
  type Status,
  TIPO_SERVIZIO_VALUES,
  type TipoServizio,
} from "@/lib/status-config";
import { cn } from "@/lib/utils";

type Props = { provinces: string[] };

export function FilterBar({ provinces }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const search = useSearchParams();
  const [, startTransition] = useTransition();

  const currentStatus = (search.get("status")?.split(",").filter(Boolean) ?? []) as Status[];
  const currentTipo = (search.get("tipo")?.split(",").filter(Boolean) ?? []) as TipoServizio[];
  const currentProv = search.get("prov")?.split(",").filter(Boolean) ?? [];
  const q = search.get("q") ?? "";

  const [qLocal, setQLocal] = useState(q);
  useEffect(() => setQLocal(q), [q]);

  const updateParam = useCallback(
    (key: string, values: string[]) => {
      const params = new URLSearchParams(search.toString());
      if (values.length === 0) params.delete(key);
      else params.set(key, values.join(","));
      startTransition(() => router.replace(`${pathname}?${params.toString()}`));
    },
    [router, pathname, search],
  );

  useEffect(() => {
    const id = setTimeout(() => {
      if (qLocal === q) return;
      const params = new URLSearchParams(search.toString());
      if (!qLocal) params.delete("q");
      else params.set("q", qLocal);
      router.replace(`${pathname}?${params.toString()}`);
    }, 250);
    return () => clearTimeout(id);
  }, [qLocal, q, router, pathname, search]);

  const toggleIn = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const totalFilters = currentStatus.length + currentTipo.length + currentProv.length + (q ? 1 : 0);

  return (
    <div className="glass rounded-lg p-3 space-y-2.5">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9 h-10"
            placeholder="Cerca per ragione sociale, P.IVA, dominio..."
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
          />
        </div>

        <ProvincePicker
          all={provinces}
          selected={currentProv}
          onChange={(arr) => updateParam("prov", arr)}
        />

        {totalFilters > 0 && (
          <button
            type="button"
            onClick={() => {
              setQLocal("");
              router.replace(pathname);
            }}
            className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/40 px-3 h-10 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pulisci</span>
            <span className="tabular-nums font-mono text-primary">({totalFilters})</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <Group label="Tipo">
          {TIPO_SERVIZIO_VALUES.map((t) => (
            <Chip
              key={t}
              active={currentTipo.includes(t)}
              onClick={() => updateParam("tipo", toggleIn(currentTipo, t))}
            >
              {t === "Dual (Ele+Gas)" ? "Dual" : t.replace("Solo ", "")}
            </Chip>
          ))}
        </Group>

        <span className="text-border/60 hidden sm:inline">|</span>

        <Group label="Stato">
          {STATUSES_IN_ORDER.map((s) => {
            const cfg = STATUS_CONFIG[s];
            return (
              <Chip
                key={s}
                active={currentStatus.includes(s)}
                onClick={() => updateParam("status", toggleIn(currentStatus, s))}
              >
                <span
                  className="h-2 w-2 rounded-full mr-1.5 inline-block shrink-0"
                  style={{ backgroundColor: cfg.color }}
                />
                {cfg.label}
              </Chip>
            );
          })}
        </Group>
      </div>
    </div>
  );
}

function Group({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/80">
        {label}
      </span>
      {children}
    </div>
  );
}

function Chip({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-all whitespace-nowrap",
        active
          ? "border-primary bg-primary/20 text-foreground shadow-sm shadow-primary/30"
          : "border-border/60 bg-background/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function ProvincePicker({
  all,
  selected,
  onChange,
}: {
  all: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return all;
    return all.filter((p) => p.toLowerCase().includes(needle));
  }, [all, q]);

  const label =
    selected.length === 0
      ? "Tutte le province"
      : selected.length === 1
        ? selected[0]
        : `${selected.length} province`;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-md border bg-background/40 px-3 h-10 text-sm transition-colors whitespace-nowrap max-w-[240px]",
            selected.length > 0
              ? "border-primary text-foreground shadow-sm shadow-primary/20"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50",
          )}
        >
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="end">
        <div className="border-b border-border/60 p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cerca provincia..."
              className="w-full pl-8 pr-2 h-8 text-sm rounded-sm bg-background/60 border border-border/40 focus:outline-none focus:border-primary"
            />
          </div>
        </div>
        {selected.length > 0 && (
          <div className="border-b border-border/60 px-2 py-1.5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {selected.length} selezionate
            </span>
            <button
              type="button"
              onClick={() => onChange([])}
              className="text-[11px] text-primary hover:underline"
            >
              Cancella
            </button>
          </div>
        )}
        <div className="max-h-[280px] overflow-y-auto py-1">
          {filtered.length === 0 && (
            <p className="px-3 py-2 text-xs text-muted-foreground text-center">Nessun risultato</p>
          )}
          {filtered.map((p) => {
            const active = selected.includes(p);
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  onChange(active ? selected.filter((x) => x !== p) : [...selected, p]);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-left",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex h-3.5 w-3.5 items-center justify-center rounded-sm border shrink-0",
                    active ? "bg-primary border-primary" : "border-border/60",
                  )}
                >
                  {active && <Check className="h-3 w-3 text-primary-foreground" />}
                </span>
                <span className="truncate">{p}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
