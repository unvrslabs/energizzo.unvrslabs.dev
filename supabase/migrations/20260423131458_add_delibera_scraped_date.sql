-- Migration: add_delibera_scraped_date
-- Version: 20260423131458
-- Dumped via MCP Supabase on 2026-04-23

alter table delibere_cache
  add column if not exists scraped_data_pubblicazione timestamptz,
  add column if not exists scraped_at timestamptz;

create index if not exists delibere_cache_scraped_data_pub_idx
  on delibere_cache(scraped_data_pubblicazione desc nulls last);;
