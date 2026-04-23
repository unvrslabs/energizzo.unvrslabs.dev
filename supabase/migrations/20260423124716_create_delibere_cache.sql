-- Migration: create_delibere_cache
-- Version: 20260423124716
-- Dumped via MCP Supabase on 2026-04-23

-- Cache locale delibere Energizzo API con summary AI
create table if not exists delibere_cache (
  id bigint primary key,                -- external id Energizzo API
  numero text not null,
  titolo text not null,
  descrizione text,
  tipo text,                            -- ARERA / GME / MASE / ...
  settore text,                         -- Gas / Luce / Comune / ...
  data_delibera timestamptz,
  data_scadenza timestamptz,
  data_pubblicazione timestamptz,
  fonte text,
  url_riferimento text,
  documento_url text,
  documenti_urls jsonb default '[]'::jsonb,
  stato text,
  note text,
  autore jsonb,
  api_created_at timestamptz,
  api_updated_at timestamptz,
  -- AI summary
  ai_summary text,                      -- paragraph 1-2 righe
  ai_bullets jsonb,                     -- string[] 4-5 bullet operativi
  ai_sectors jsonb,                     -- string[] mapped to eel/gas/com
  ai_generated_at timestamptz,
  ai_model text,
  ai_source text,                       -- 'pdf' | 'url'
  ai_error text,                        -- ultimo errore se generazione fallita
  -- meta
  synced_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists delibere_cache_data_delibera_idx on delibere_cache(data_delibera desc nulls last);
create index if not exists delibere_cache_settore_idx on delibere_cache(settore);
create index if not exists delibere_cache_tipo_idx on delibere_cache(tipo);
create index if not exists delibere_cache_numero_idx on delibere_cache(numero);
create index if not exists delibere_cache_ai_generated_idx on delibere_cache(ai_generated_at nulls first);
create index if not exists delibere_cache_stato_idx on delibere_cache(stato);

-- RLS: accesso solo via service_role (come resto del progetto)
alter table delibere_cache enable row level security;

-- trigger updated_at
create or replace function delibere_cache_touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists delibere_cache_touch on delibere_cache;
create trigger delibere_cache_touch
before update on delibere_cache
for each row execute function delibere_cache_touch_updated_at();;
