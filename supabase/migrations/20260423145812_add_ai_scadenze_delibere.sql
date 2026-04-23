-- Migration: add_ai_scadenze_delibere
-- Version: 20260423145812
-- Dumped via MCP Supabase on 2026-04-23

alter table delibere_cache
  add column if not exists ai_scadenze jsonb;

create index if not exists delibere_cache_ai_scadenze_gin
  on delibere_cache using gin (ai_scadenze);;
