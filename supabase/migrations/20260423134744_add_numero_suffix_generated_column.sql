-- Migration: add_numero_suffix_generated_column
-- Version: 20260423134744
-- Dumped via MCP Supabase on 2026-04-23

alter table delibere_cache
  add column if not exists numero_suffix text
    generated always as (lower(split_part(numero, '/', 4))) stored;

create index if not exists delibere_cache_numero_suffix_idx on delibere_cache(numero_suffix);;
