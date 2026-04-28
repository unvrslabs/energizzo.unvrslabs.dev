-- Migration: create_market_gas_psv
-- Version: 20260428040000
-- Tabella prezzo PSV (Punto di Scambio Virtuale) gas Italia
-- Equivalente del PUN per il gas: prezzo all'ingrosso italiano €/MWh
-- Source primaria: GME MGP-Gas (https://www.mercatoelettrico.org/It/MercatiGas/MPGAS)
-- Fallback: scraping HTML pagina pubblica esiti, oppure null se non disponibile

create table if not exists market_gas_psv (
  id bigint primary key generated always as identity,
  price_day date not null unique,
  -- Prezzo PSV in €/MWh (convenzione GME su MGP-gas)
  price_eur_mwh numeric(10,4) not null,
  -- Volume scambiato in MWh (opzionale, per contestualizzare)
  volume_mwh numeric(14,4),
  -- Numero offerte abbinate
  trades_count integer,
  -- Metodo di calcolo (es. "auction_close")
  method text not null default 'auction_close',
  source text not null default 'gme',
  synced_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists market_gas_psv_day_idx on market_gas_psv(price_day desc);

alter table market_gas_psv enable row level security;

-- Policy: anon non legge (dato esposto via API server-side con service role).
-- Authenticated users ereditano la policy default deny finche' non aggiunta.
