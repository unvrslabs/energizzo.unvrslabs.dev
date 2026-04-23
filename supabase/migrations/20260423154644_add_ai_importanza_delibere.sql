-- Migration: add_ai_importanza_delibere
-- Version: 20260423154644
-- Dumped via MCP Supabase on 2026-04-23

alter table delibere_cache
  add column if not exists ai_importanza text
    check (ai_importanza in ('critica','alta','normale','bassa')),
  add column if not exists ai_categoria_impatto text;

create index if not exists delibere_cache_importanza_idx
  on delibere_cache(ai_importanza);;
