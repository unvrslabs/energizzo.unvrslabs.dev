-- Migration: create_market_power_pun
-- Version: 20260424020000
-- Tabella PUN stimato (media pesata 7 zone italiane) dai dati ENTSO-E
-- Source: energy-charts.info (Fraunhofer ISE, aggregatore ENTSO-E)

create table if not exists market_power_pun (
  id bigint primary key generated always as identity,
  price_day date not null unique,
  price_eur_mwh numeric(10,4) not null,
  zones jsonb not null default '{}'::jsonb,
  method text not null default 'weighted_avg',
  source text not null default 'energy-charts.info',
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists market_power_pun_day_idx on market_power_pun(price_day desc);

alter table market_power_pun enable row level security;
