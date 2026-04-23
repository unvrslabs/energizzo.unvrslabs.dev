-- Migration: add_auto_flag_to_social_posts
-- Version: 20260424010000
-- Flag per distinguere post generati dal cron daily vs creati manualmente

alter table social_posts
  add column if not exists generated_by text not null default 'manual'
  check (generated_by in ('manual','auto'));

create index if not exists social_posts_generated_by_idx
  on social_posts(generated_by, status);
