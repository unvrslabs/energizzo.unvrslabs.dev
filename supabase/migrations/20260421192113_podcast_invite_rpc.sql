-- Migration: podcast_invite_rpc
-- Version: 20260421192113
-- Dumped via MCP Supabase on 2026-04-23

-- Funzione pubblica per leggere un invito dato un token
create or replace function public.fetch_podcast_invite(p_token uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_guest jsonb;
begin
  select to_jsonb(g.*) || jsonb_build_object(
    'lead', (
      select to_jsonb(l.*)
      from leads l
      where l.id = g.lead_id
    )
  )
  into v_guest
  from podcast_guests g
  where g.invite_token = p_token
  limit 1;
  return v_guest;
end;
$$;

grant execute on function public.fetch_podcast_invite(uuid) to anon, authenticated;

-- Funzione pubblica per confermare disponibilità
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
  where invite_token = p_token;

  return jsonb_build_object('ok', true);
end;
$$;

grant execute on function public.confirm_podcast_invite(uuid, text, text, text) to anon, authenticated;;
