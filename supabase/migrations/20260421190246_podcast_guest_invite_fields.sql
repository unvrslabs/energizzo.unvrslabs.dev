-- Migration: podcast_guest_invite_fields
-- Version: 20260421190246
-- Dumped via MCP Supabase on 2026-04-23

alter table podcast_guests
  add column if not exists invite_token uuid unique default gen_random_uuid(),
  add column if not exists selected_episode_slug text,
  add column if not exists response_name text,
  add column if not exists response_whatsapp text,
  add column if not exists response_availability text,
  add column if not exists response_confirmed_at timestamptz;

-- backfill token per righe esistenti senza token
update podcast_guests set invite_token = gen_random_uuid() where invite_token is null;

create index if not exists podcast_guests_invite_token_idx on podcast_guests(invite_token);;
