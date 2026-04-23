-- Migration: agent_conversations_and_exec_sql
-- Version: 20260421201756
-- Dumped via MCP Supabase on 2026-04-23

create table if not exists agent_conversations (
  id uuid primary key default gen_random_uuid(),
  title text,
  messages jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table agent_conversations enable row level security;
create policy agent_conversations_auth on agent_conversations for all to authenticated
  using (true) with check (true);

create trigger agent_conversations_updated before update on agent_conversations
  for each row execute function set_updated_at();

-- Funzione per eseguire SQL arbitrario e ritornare risultato come jsonb array
-- security definer: bypassa RLS, quindi l'agente può modificare qualsiasi cosa.
create or replace function public.agent_exec_sql(p_query text)
returns jsonb
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_result jsonb;
begin
  -- Esegui la query dinamica: per SELECT ritorna array di righe, per DML ritorna { affected }
  if regexp_replace(trim(p_query), '^\s+', '', 'g') ~* '^(select|with|explain|show)\b' then
    execute 'select coalesce(jsonb_agg(row_to_json(t)), ''[]''::jsonb) from (' || p_query || ') t'
      into v_result;
    return jsonb_build_object('ok', true, 'rows', v_result);
  else
    execute p_query;
    return jsonb_build_object('ok', true, 'affected', 'command executed');
  end if;
exception when others then
  return jsonb_build_object('ok', false, 'error', sqlerrm, 'code', sqlstate);
end;
$$;

-- Solo authenticated può invocarla (non anon)
revoke all on function public.agent_exec_sql(text) from public;
grant execute on function public.agent_exec_sql(text) to authenticated;;
