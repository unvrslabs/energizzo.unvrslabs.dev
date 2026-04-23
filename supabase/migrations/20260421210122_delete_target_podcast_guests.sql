-- Migration: delete_target_podcast_guests
-- Version: 20260421210122
-- Dumped via MCP Supabase on 2026-04-23

delete from podcast_guests where status = 'target';;
