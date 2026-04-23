-- Migration: add_ai_columns_testi_integrati
-- Version: 20260423142239
-- Dumped via MCP Supabase on 2026-04-23

alter table testi_integrati_cache
  add column if not exists ai_summary text,
  add column if not exists ai_bullets jsonb,
  add column if not exists ai_generated_at timestamptz,
  add column if not exists ai_model text,
  add column if not exists ai_source text,
  add column if not exists ai_error text;

create index if not exists ti_ai_generated_idx on testi_integrati_cache(ai_generated_at nulls first);;
