-- Migration: podcast_invite_confirm_v2
-- Version: 20260421193720
-- Dumped via MCP Supabase on 2026-04-23

-- Ritorna anche i dati ospite in caso ok, così il route può inviare notifica Telegram
create or replace function public.confirm_podcast_invite(
  p_token uuid,
  p_name text,
  p_whatsapp text,
  p_availability text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_existing podcast_guests%rowtype;
  v_guest_id uuid;
  v_ragione text;
  v_piva text;
begin
  if p_name is null or length(trim(p_name)) = 0 then
    return jsonb_build_object('ok', false, 'error', 'Nome obbligatorio');
  end if;
  if p_whatsapp is null or length(trim(p_whatsapp)) < 5 then
    return jsonb_build_object('ok', false, 'error', 'WhatsApp obbligatorio');
  end if;

  select * into v_existing from podcast_guests where invite_token = p_token;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'Invito non trovato');
  end if;
  if v_existing.response_confirmed_at is not null then
    return jsonb_build_object('ok', false, 'error', 'Invito già confermato');
  end if;

  update podcast_guests
  set response_name = trim(p_name),
      response_whatsapp = trim(p_whatsapp),
      response_availability = nullif(trim(coalesce(p_availability, '')), ''),
      response_confirmed_at = now(),
      status = 'confirmed'
  where invite_token = p_token
  returning id into v_guest_id;

  if v_existing.lead_id is not null then
    select l.ragione_sociale, l.piva into v_ragione, v_piva
    from leads l
    where l.id = v_existing.lead_id;
  end if;

  return jsonb_build_object(
    'ok', true,
    'guest_id', v_guest_id,
    'guest_display', coalesce(v_ragione, v_existing.external_company, v_existing.external_name, 'ospite'),
    'piva', v_piva,
    'episode_slug', v_existing.selected_episode_slug,
    'response_name', trim(p_name),
    'response_whatsapp', trim(p_whatsapp),
    'response_availability', nullif(trim(coalesce(p_availability, '')), '')
  );
end;
$$;

grant execute on function public.confirm_podcast_invite(uuid, text, text, text) to anon, authenticated;;
