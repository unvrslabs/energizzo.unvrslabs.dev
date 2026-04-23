-- Migration: extend_lead_contacts
-- Version: 20260419181259
-- Dumped via MCP Supabase on 2026-04-23

alter table public.lead_contacts
  add column if not exists tax_code text,
  add column if not exists is_legal_rep boolean default false,
  add column if not exists gender text,
  add column if not exists role_code text,
  add column if not exists role_start date,
  add column if not exists percent_share numeric(6,3);

-- Normalize source enum-like values: manager, shareholder
-- No strict check for flexibility;
