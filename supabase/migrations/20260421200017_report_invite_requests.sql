-- Migration: report_invite_requests
-- Version: 20260421200017
-- Dumped via MCP Supabase on 2026-04-23

create extension if not exists pg_net with schema extensions;

create table if not exists report_invite_requests (
  id uuid primary key default gen_random_uuid(),
  ragione_sociale text not null,
  piva text not null,
  referente text,
  whatsapp text not null,
  created_at timestamptz not null default now(),
  ip_address text,
  notified_at timestamptz
);

alter table report_invite_requests enable row level security;
-- no policies for anon: all access via RPC

create or replace function public.request_report_invite(
  p_ragione text,
  p_piva text,
  p_whatsapp text,
  p_referente text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_id uuid;
  v_bot_token text := '8606561574:AAH3Kb-EEFxkXjcjb0j5a6QyFdwmmbkbiQc';
  v_chat_id text := '8318015596';
  v_text text;
  v_request_id bigint;
begin
  if p_ragione is null or length(trim(p_ragione)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'Ragione sociale obbligatoria');
  end if;
  if p_piva is null or length(regexp_replace(p_piva, '\D', '', 'g')) < 8 then
    return jsonb_build_object('ok', false, 'error', 'Partita IVA non valida');
  end if;
  if p_whatsapp is null or length(regexp_replace(p_whatsapp, '\D', '', 'g')) < 5 then
    return jsonb_build_object('ok', false, 'error', 'WhatsApp obbligatorio');
  end if;

  insert into report_invite_requests (ragione_sociale, piva, whatsapp, referente)
  values (trim(p_ragione), trim(p_piva), trim(p_whatsapp), nullif(trim(coalesce(p_referente, '')), ''))
  returning id into v_id;

  v_text := E'\xF0\x9F\x93\x8A *Nuova richiesta report*' || E'\n\n' ||
            '*Azienda*: ' || replace(replace(trim(p_ragione), '\', '\\'), '_', '\_') || E'\n' ||
            '*P.IVA*: ' || replace(trim(p_piva), '\', '\\') || E'\n' ||
            '*WhatsApp*: ' || replace(trim(p_whatsapp), '\', '\\') ||
            case when nullif(trim(coalesce(p_referente, '')), '') is not null
              then E'\n' || '*Referente*: ' || replace(trim(p_referente), '\', '\\')
              else ''
            end;

  begin
    select net.http_post(
      url := 'https://api.telegram.org/bot' || v_bot_token || '/sendMessage',
      body := jsonb_build_object(
        'chat_id', v_chat_id,
        'text', v_text,
        'parse_mode', 'Markdown',
        'disable_web_page_preview', true
      ),
      headers := '{"Content-Type": "application/json"}'::jsonb
    ) into v_request_id;

    update report_invite_requests set notified_at = now() where id = v_id;
  exception when others then
    -- non bloccante: la richiesta è salvata comunque
    null;
  end;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$$;

grant execute on function public.request_report_invite(text, text, text, text) to anon, authenticated;;
