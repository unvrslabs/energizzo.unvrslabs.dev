-- Migration: fix_activity_log_trigger_security_definer
-- Version: 20260420043340
-- Dumped via MCP Supabase on 2026-04-23

-- Trigger runs as function owner (postgres), bypassing RLS on activity_log.
-- Without this, UPDATE on leads by authenticated user fails because the
-- trigger tries to INSERT into activity_log which has no INSERT policy.
create or replace function public.log_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status is distinct from old.status then
    insert into public.activity_log (lead_id, event_type, from_value, to_value, author_id)
    values (new.id, 'status_change', old.status::text, new.status::text, auth.uid());
  end if;
  if new.email is distinct from old.email then
    insert into public.activity_log (lead_id, event_type, from_value, to_value, author_id)
    values (new.id, 'email_updated', old.email, new.email, auth.uid());
  end if;
  return new;
end $$;

-- Restrict function ownership to postgres (default, but explicit)
alter function public.log_status_change() owner to postgres;;
