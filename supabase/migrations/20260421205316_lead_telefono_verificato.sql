-- Migration: lead_telefono_verificato
-- Version: 20260421205316
-- Dumped via MCP Supabase on 2026-04-23

alter table leads add column if not exists telefono text;;
