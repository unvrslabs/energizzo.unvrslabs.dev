-- Migration: create_market_gas_storage
-- Version: 20260423153321
-- Dumped via MCP Supabase on 2026-04-23

create table if not exists market_gas_storage (
  id bigserial primary key,
  country text not null default 'IT',
  company text default 'aggregate',
  gas_day date not null,
  gas_in_storage_twh numeric(12,4),
  working_gas_volume_twh numeric(12,4),
  injection_gwh numeric(12,3),
  withdrawal_gwh numeric(12,3),
  net_withdrawal_gwh numeric(12,3),
  injection_capacity_gwh numeric(12,3),
  withdrawal_capacity_gwh numeric(12,3),
  full_pct numeric(6,2),
  trend_pct numeric(6,3),
  status text,
  consumption_gwh numeric(12,3),
  consumption_full_pct numeric(6,2),
  source text not null default 'AGSI',
  raw_updated_at timestamptz,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  unique (country, company, gas_day, source)
);

create index if not exists market_gas_storage_gas_day_idx
  on market_gas_storage(gas_day desc);
create index if not exists market_gas_storage_country_day_idx
  on market_gas_storage(country, gas_day desc);

alter table market_gas_storage enable row level security;;
