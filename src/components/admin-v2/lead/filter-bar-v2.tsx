"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { Check, ChevronDown, Network as NetworkIcon, Search, Tag, X, Zap } from "lucide-react";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import {
  CATEGORIA_CONFIG,
  CATEGORIE_IN_ORDER,
  STATUS_CONFIG,
  STATUSES_IN_ORDER,
  TIPO_SERVIZIO_VALUES,
  type Categoria,
  type Status,
  type TipoServizio,
} from "@/lib/status-config";
import { cn } from "@/lib/utils";

export function FilterBarV2({ provinces }: { provinces: string[] }) {
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
    currentStatus.length + currentTipo.length + currentCategoria.length + currentProv.length + (currentNetwork ? 1 : 0);

  function clearAll() {
    startTransition(() => router.replace(pathname));
  }

  return (
    <div className="v2-card p-3 flex items-center gap-2 flex-wrap">
      <div className="relative flex-1 min-w-[240px] max-w-md">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "hsl(var(--v2-text-mute))" }} />
        <input
          type="text"
          value={qLocal}
          onChange={(e) => setQLocal(e.target.value)}
          placeholder="Cerca ragione sociale, PIVA, dominio, comune…"
          className="v2-input"
        />
        {qLocal && (
          <button
            type="button"
            onClick={() => setQLocal("")}
            className="absolute right-2 top-1/2 -translate-y-1/2"
            style={{ color: "hsl(var(--v2-text-mute))" }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      <MultiFilter
        label="Stato"
        icon={<Tag className="w-3.5 h-3.5" />}
        values={currentStatus}
        options={STATUSES_IN_ORDER.map((s) => ({ value: s, label: STATUS_CONFIG[s].label, color: STATUS_CONFIG[s].color }))}
        onToggle={(v) => {
          const next = currentStatus.includes(v as Status)
            ? currentStatus.filter((x) => x !== v)
            : [...currentStatus, v as Status];
          updateParam("status", next);
        }}
      />

      <MultiFilter
        label="Categoria"
        icon={<Tag className="w-3.5 h-3.5" />}
        values={currentCategoria}
        options={CATEGORIE_IN_ORDER.map((c) => ({
          value: c,
          label: c.replace(/_/g, " ").replace("DISPACCIATORE", "DISP."),
          color: CATEGORIA_CONFIG[c].color,
        }))}
        onToggle={(v) => {
          const next = currentCategoria.includes(v as Categoria)
            ? currentCategoria.filter((x) => x !== v)
            : [...currentCategoria, v as Categoria];
          updateParam("categoria", next);
        }}
      />

      <MultiFilter
        label="Tipo"
        icon={<Zap className="w-3.5 h-3.5" />}
        values={currentTipo}
        options={TIPO_SERVIZIO_VALUES.map((t) => ({ value: t, label: t.replace("Solo ", "") }))}
        onToggle={(v) => {
          const next = currentTipo.includes(v as TipoServizio)
            ? currentTipo.filter((x) => x !== v)
            : [...currentTipo, v as TipoServizio];
          updateParam("tipo", next);
        }}
      />

      <MultiFilter
        label="Provincia"
        icon={<Tag className="w-3.5 h-3.5" />}
        values={currentProv}
        options={provinces.map((p) => ({ value: p, label: p }))}
        onToggle={(v) => {
          const next = currentProv.includes(v) ? currentProv.filter((x) => x !== v) : [...currentProv, v];
          updateParam("prov", next);
        }}
        search
      />

      <NetworkFilter
        current={currentNetwork}
        onChange={(v) => updateSingle("network", v)}
      />

      {totalFilters > 0 && (
        <button
          type="button"
          onClick={clearAll}
          className="v2-btn"
          style={{ color: "hsl(var(--v2-danger))" }}
        >
          <X className="w-3.5 h-3.5" />
          Pulisci ({totalFilters})
        </button>
      )}
    </div>
  );
}

function MultiFilter({
  label,
  icon,
  values,
  options,
  onToggle,
  search,
}: {
  label: string;
  icon: React.ReactNode;
  values: string[];
  options: { value: string; label: string; color?: string }[];
  onToggle: (v: string) => void;
  search?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!search || !q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q.toLowerCase()));
  }, [options, q, search]);

  const active = values.length > 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn("v2-btn", active && "v2-btn--primary")}
        >
          {icon}
          {label}
          {active && (
            <span
              className="v2-mono text-[10px] font-bold px-1.5 rounded"
              style={{
                background: "hsl(var(--v2-accent) / 0.24)",
                color: "hsl(var(--v2-accent))",
              }}
            >
              {values.length}
            </span>
          )}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[260px] p-0 overflow-hidden"
        style={{
          background: "hsl(var(--v2-bg-elev))",
          border: "1px solid hsl(var(--v2-border))",
          borderRadius: "10px",
        }}
      >
        {search && (
          <div className="p-2 border-b" style={{ borderColor: "hsl(var(--v2-border))" }}>
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={`Filtra ${label.toLowerCase()}…`}
              className="v2-input"
              style={{ paddingLeft: "12px" }}
            />
          </div>
        )}
        <ul className="max-h-[300px] overflow-y-auto py-1">
          {filtered.map((opt) => {
            const checked = values.includes(opt.value);
            return (
              <li key={opt.value}>
                <button
                  type="button"
                  onClick={() => onToggle(opt.value)}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-[12.5px] transition-colors hover:bg-white/[0.03]"
                  style={{ color: "hsl(var(--v2-text))" }}
                >
                  {opt.color && (
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ background: opt.color }} />
                  )}
                  <span className="flex-1 text-left truncate">{opt.label}</span>
                  {checked && <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}

function NetworkFilter({
  current,
  onChange,
}: {
  current: "" | "invited" | "member";
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const options: { v: "" | "invited" | "member"; label: string }[] = [
    { v: "", label: "Tutti" },
    { v: "invited", label: "Invitati" },
    { v: "member", label: "Membri" },
  ];
  const currentLabel = options.find((o) => o.v === current)?.label ?? "Network";
  const active = current !== "";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button type="button" className={cn("v2-btn", active && "v2-btn--primary")}>
          <NetworkIcon className="w-3.5 h-3.5" />
          {currentLabel}
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[160px] p-0 overflow-hidden"
        style={{
          background: "hsl(var(--v2-bg-elev))",
          border: "1px solid hsl(var(--v2-border))",
          borderRadius: "10px",
        }}
      >
        <ul className="py-1">
          {options.map((opt) => {
            const checked = opt.v === current;
            return (
              <li key={opt.v}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(opt.v);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-[12.5px] hover:bg-white/[0.03]"
                  style={{ color: "hsl(var(--v2-text))" }}
                >
                  {opt.label}
                  {checked && <Check className="w-3.5 h-3.5" style={{ color: "hsl(var(--v2-accent))" }} />}
                </button>
              </li>
            );
          })}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
