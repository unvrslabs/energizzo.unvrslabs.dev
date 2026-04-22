"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import {
  Search,
  X,
  MapPin,
  Check,
  ChevronDown,
  Activity,
  Zap,
  Network,
  Tag,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  STATUS_CONFIG,
  STATUSES_IN_ORDER,
  type Status,
  TIPO_SERVIZIO_VALUES,
  type TipoServizio,
  CATEGORIA_CONFIG,
  CATEGORIE_IN_ORDER,
  type Categoria,
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
  const currentCategoria = (search.get("categoria")?.split(",").filter(Boolean) ?? []) as Categoria[];
  const currentProv = search.get("prov")?.split(",").filter(Boolean) ?? [];
  const currentNetwork = (search.get("network") ?? "") as "" | "invited" | "member";
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

  const updateSingle = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(search.toString());
      if (!value) params.delete(key);
      else params.set(key, value);
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

  const totalFilters =
    currentStatus.length +
    currentTipo.length +
    currentCategoria.length +
    currentProv.length +
    (currentNetwork ? 1 : 0) +
    (q ? 1 : 0);

  return (
    <div className="liquid-glass-card rounded-[1.5rem] p-3">
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[260px]">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-11 h-11 rounded-full"
            placeholder="Cerca per ragione sociale, P.IVA, dominio..."
            value={qLocal}
            onChange={(e) => setQLocal(e.target.value)}
          />
        </div>

        <TipoPicker
          selected={currentTipo}
          onChange={(arr) => updateParam("tipo", arr)}
        />

        <CategoriaPicker
          selected={currentCategoria}
          onChange={(arr) => updateParam("categoria", arr)}
        />

        <StatusPicker
          selected={currentStatus}
          onChange={(arr) => updateParam("status", arr)}
        />

        <ProvincePicker
          all={provinces}
          selected={currentProv}
          onChange={(arr) => updateParam("prov", arr)}
        />

        <NetworkPicker
          value={currentNetwork}
          onChange={(v) => updateSingle("network", v)}
        />

        {totalFilters > 0 && (
          <button
            type="button"
            onClick={() => {
              setQLocal("");
              router.replace(pathname);
            }}
            className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-white/5 backdrop-blur-md px-4 h-11 text-xs text-muted-foreground hover:text-foreground hover:border-primary/50 transition-colors"
          >
            <X className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Pulisci</span>
            <span className="tabular-nums font-mono text-primary">({totalFilters})</span>
          </button>
        )}
      </div>
    </div>
  );
}

const TIPO_ACCENT: Record<TipoServizio, string> = {
  "Dual (Ele+Gas)": "#10b981",
  "Solo Elettrico": "#eab308",
  "Solo Gas": "#3b82f6",
};

const TIPO_SHORT: Record<TipoServizio, string> = {
  "Dual (Ele+Gas)": "Dual",
  "Solo Elettrico": "Elettrico",
  "Solo Gas": "Gas",
};

function TipoPicker({
  selected,
  onChange,
}: {
  selected: TipoServizio[];
  onChange: (next: TipoServizio[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const label =
    selected.length === 0
      ? "Tutti i tipi"
      : selected.length === 1
        ? TIPO_SHORT[selected[0]]
        : `${selected.length} tipi`;

  const activeColor = selected.length === 1 ? TIPO_ACCENT[selected[0]] : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border bg-white/5 backdrop-blur-md px-4 h-11 text-sm transition-all whitespace-nowrap max-w-[200px]",
            selected.length > 0
              ? "border-primary text-foreground shadow-sm shadow-primary/20"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50",
          )}
        >
          {activeColor ? (
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: activeColor }} />
          ) : (
            <Zap className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[220px] p-0" align="start">
        {selected.length > 0 && (
          <div className="border-b border-border/60 px-2 py-1.5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {selected.length} selezionati
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
        <div className="py-1">
          {TIPO_SERVIZIO_VALUES.map((t) => {
            const active = selected.includes(t);
            return (
              <button
                key={t}
                type="button"
                onClick={() =>
                  onChange(active ? selected.filter((x) => x !== t) : [...selected, t])
                }
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
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: TIPO_ACCENT[t] }} />
                <span className="truncate">{t}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function CategoriaPicker({
  selected,
  onChange,
}: {
  selected: Categoria[];
  onChange: (next: Categoria[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const label =
    selected.length === 0
      ? "Tutte le categorie"
      : selected.length === 1
        ? CATEGORIA_CONFIG[selected[0]].short
        : `${selected.length} categorie`;

  const activeColor =
    selected.length === 1 ? CATEGORIA_CONFIG[selected[0]].color : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border bg-white/5 backdrop-blur-md px-4 h-11 text-sm transition-all whitespace-nowrap max-w-[220px]",
            selected.length > 0
              ? "border-primary text-foreground shadow-sm shadow-primary/20"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50",
          )}
        >
          {activeColor ? (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: activeColor }}
            />
          ) : (
            <Tag className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[240px] p-0" align="start">
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
        <div className="py-1">
          {CATEGORIE_IN_ORDER.map((c) => {
            const cfg = CATEGORIA_CONFIG[c];
            const active = selected.includes(c);
            return (
              <button
                key={c}
                type="button"
                onClick={() =>
                  onChange(active ? selected.filter((x) => x !== c) : [...selected, c])
                }
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
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="truncate">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function StatusPicker({
  selected,
  onChange,
}: {
  selected: Status[];
  onChange: (next: Status[]) => void;
}) {
  const [open, setOpen] = useState(false);

  const label =
    selected.length === 0
      ? "Tutti gli stati"
      : selected.length === 1
        ? STATUS_CONFIG[selected[0]].label
        : `${selected.length} stati`;

  const activeColor =
    selected.length === 1 ? STATUS_CONFIG[selected[0]].color : undefined;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border bg-white/5 backdrop-blur-md px-4 h-11 text-sm transition-all whitespace-nowrap max-w-[240px]",
            selected.length > 0
              ? "border-primary text-foreground shadow-sm shadow-primary/20"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50",
          )}
        >
          {activeColor ? (
            <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: activeColor }} />
          ) : (
            <Activity className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">{label}</span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[260px] p-0" align="start">
        {selected.length > 0 && (
          <div className="border-b border-border/60 px-2 py-1.5 flex items-center justify-between">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {selected.length} selezionati
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
        <div className="max-h-[320px] overflow-y-auto py-1">
          {STATUSES_IN_ORDER.map((s) => {
            const cfg = STATUS_CONFIG[s];
            const active = selected.includes(s);
            return (
              <button
                key={s}
                type="button"
                onClick={() =>
                  onChange(active ? selected.filter((x) => x !== s) : [...selected, s])
                }
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
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: cfg.color }} />
                <span className="truncate">{cfg.label}</span>
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function NetworkPicker({
  value,
  onChange,
}: {
  value: "" | "invited" | "member";
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const options: { v: "" | "invited" | "member"; label: string; color: string }[] = [
    { v: "", label: "Tutti", color: "#64748b" },
    { v: "invited", label: "Invitati", color: "#38bdf8" },
    { v: "member", label: "Membri", color: "#10b981" },
  ];
  const current = options.find((o) => o.v === value) ?? options[0];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border bg-white/5 backdrop-blur-md px-4 h-11 text-sm transition-all whitespace-nowrap max-w-[200px]",
            value
              ? "border-primary text-foreground shadow-sm shadow-primary/20"
              : "border-border/60 text-muted-foreground hover:text-foreground hover:border-primary/50",
          )}
        >
          {value ? (
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0"
              style={{ backgroundColor: current.color }}
            />
          ) : (
            <Network className="h-4 w-4 shrink-0" />
          )}
          <span className="truncate">
            {value ? current.label : "Network"}
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="py-1">
          {options.map((o) => {
            const active = value === o.v;
            return (
              <button
                key={o.v || "all"}
                type="button"
                onClick={() => {
                  onChange(o.v);
                  setOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-2 px-3 py-1.5 text-sm transition-colors text-left",
                  active
                    ? "bg-primary/10 text-foreground"
                    : "text-muted-foreground hover:bg-accent/10 hover:text-foreground",
                )}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: o.color }}
                />
                <span className="truncate">{o.label}</span>
                {active && <Check className="ml-auto h-3.5 w-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
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
            "inline-flex items-center gap-2 rounded-full border bg-white/5 backdrop-blur-md px-4 h-11 text-sm transition-all whitespace-nowrap max-w-[240px]",
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
      <PopoverContent className="w-[280px] p-0" align="start">
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
