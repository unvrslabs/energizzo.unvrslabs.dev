-- Migration: create_testi_integrati_cache
-- Version: 20260423135805
-- Dumped via MCP Supabase on 2026-04-23

create table if not exists testi_integrati_cache (
  id bigint primary key,
  codice text not null,
  delibera_riferimento text,
  titolo text not null,
  descrizione text,
  settore text,
  data_entrata_vigore timestamptz,
  data_scadenza timestamptz,
  url_riferimento text,
  documento_url text,
  documenti_urls jsonb default '[]'::jsonb,
  stato text,
  note text,
  autore jsonb,
  api_created_at timestamptz,
  api_updated_at timestamptz,
  scraped_data_pubblicazione timestamptz,
  scraped_at timestamptz,
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  codice_suffix text
    generated always as (lower(split_part(codice, '/', 4))) stored
);

create index if not exists ti_data_vigore_idx on testi_integrati_cache(data_entrata_vigore desc nulls last);
create index if not exists ti_settore_idx on testi_integrati_cache(settore);
create index if not exists ti_codice_idx on testi_integrati_cache(codice);
create index if not exists ti_suffix_idx on testi_integrati_cache(codice_suffix);

alter table testi_integrati_cache enable row level security;

create or replace function testi_integrati_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists testi_integrati_touch on testi_integrati_cache;
create trigger testi_integrati_touch
before update on testi_integrati_cache
for each row execute function testi_integrati_touch_updated_at();;
