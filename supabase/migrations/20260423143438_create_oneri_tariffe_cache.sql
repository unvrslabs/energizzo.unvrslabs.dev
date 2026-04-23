-- Migration: create_oneri_tariffe_cache
-- Version: 20260423143438
-- Dumped via MCP Supabase on 2026-04-23

create table if not exists oneri_tariffe_cache (
  id bigserial primary key,
  commodity text not null check (commodity in ('luce','gas')),
  periodo_da date not null,
  periodo_a date not null,
  periodo_key text not null,
  data jsonb not null default '{}'::jsonb,
  fallback_period boolean default false,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique (commodity, periodo_da, periodo_a)
);

create index if not exists oneri_commodity_periodo_idx
  on oneri_tariffe_cache(commodity, periodo_da desc);

create index if not exists oneri_commodity_periodo_key_idx
  on oneri_tariffe_cache(commodity, periodo_key);

alter table oneri_tariffe_cache enable row level security;

create or replace function oneri_tariffe_set_periodo_key()
returns trigger language plpgsql as $$
begin
  new.periodo_key := to_char(new.periodo_da, 'YYYY-MM');
  new.updated_at := now();
  return new;
end; $$;

drop trigger if exists oneri_tariffe_before on oneri_tariffe_cache;
create trigger oneri_tariffe_before
before insert or update on oneri_tariffe_cache
for each row execute function oneri_tariffe_set_periodo_key();;
