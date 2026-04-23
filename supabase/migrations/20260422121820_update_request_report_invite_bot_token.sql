-- Migration: update_request_report_invite_bot_token
-- Version: 20260422121820
-- Dumped via MCP Supabase on 2026-04-23

CREATE OR REPLACE FUNCTION public.request_report_invite(p_ragione text, p_piva text, p_whatsapp text, p_referente text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'extensions'
AS $function$
declare
  v_id uuid;
  v_bot_token text := '8709499826:AAG66X-7FwcQ1C1Iv1uAJmn1YexA3VJwJ14';
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
    null;
  end;

  return jsonb_build_object('ok', true, 'id', v_id);
end;
$function$;;
