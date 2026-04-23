-- Migration: lead_whatsapp_and_activity_triggers
-- Version: 20260421204255
-- Dumped via MCP Supabase on 2026-04-23

-- 1. Whatsapp verificato sul lead
alter table leads add column if not exists whatsapp text;

-- 2. Trigger che logga eventi podcast/report su activity_log

-- podcast_guests: insert -> podcast_guest_added; update response_confirmed_at -> podcast_invite_confirmed
create or replace function log_podcast_guest_event()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'INSERT' and new.lead_id is not null then
    insert into activity_log (lead_id, event_type, to_value, created_at)
    values (new.lead_id, 'podcast_guest_added', new.id::text, now());
  elsif tg_op = 'UPDATE' and new.lead_id is not null then
    -- invite link "sent" when episode is first selected
    if (old.selected_episode_slug is null or old.selected_episode_slug = '')
       and new.selected_episode_slug is not null and new.selected_episode_slug <> '' then
      insert into activity_log (lead_id, event_type, to_value, created_at)
      values (new.lead_id, 'podcast_invite_sent', new.selected_episode_slug, now());
    end if;
    -- confirmation
    if old.response_confirmed_at is null and new.response_confirmed_at is not null then
      insert into activity_log (lead_id, event_type, to_value, created_at)
      values (new.lead_id, 'podcast_invite_confirmed', new.response_name, now());
    end if;
    -- status change -> podcast_status_change
    if old.status is distinct from new.status then
      insert into activity_log (lead_id, event_type, from_value, to_value, created_at)
      values (new.lead_id, 'podcast_status_change', old.status, new.status, now());
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists podcast_guests_activity_log on podcast_guests;
create trigger podcast_guests_activity_log
  after insert or update on podcast_guests
  for each row execute function log_podcast_guest_event();

-- leads: survey_sent_at passa da null a value -> report_link_sent; survey_completed_at -> report_completed
create or replace function log_lead_report_event()
returns trigger language plpgsql security definer as $$
begin
  if tg_op = 'UPDATE' then
    if old.survey_sent_at is null and new.survey_sent_at is not null then
      insert into activity_log (lead_id, event_type, created_at)
      values (new.id, 'report_link_sent', now());
    end if;
    if old.survey_completed_at is null and new.survey_completed_at is not null then
      insert into activity_log (lead_id, event_type, created_at)
      values (new.id, 'report_completed', now());
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists leads_report_activity_log on leads;
create trigger leads_report_activity_log
  after update on leads
  for each row execute function log_lead_report_event();;
