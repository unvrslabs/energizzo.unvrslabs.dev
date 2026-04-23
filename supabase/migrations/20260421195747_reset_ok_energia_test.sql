-- Migration: reset_ok_energia_test
-- Version: 20260421195747
-- Dumped via MCP Supabase on 2026-04-23

update podcast_guests
set response_name = null,
    response_whatsapp = null,
    response_availability = null,
    response_confirmed_at = null,
    status = case
      when invited_at is not null then 'invited'
      else 'target'
    end
where id = '14c8caef-e9e8-484a-b56c-1b41aa50636c';;
