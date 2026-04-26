-- 看護助手 CareTaiwan — Supabase Schema
-- 在 Supabase SQL Editor 執行

-- 雲端備份（Phase 2 LINE 登入後）
create table if not exists cloud_backups (
  line_user_id text primary key,
  display_name text,
  data jsonb not null,
  updated_at timestamptz default now()
);
alter table cloud_backups enable row level security;

-- 老人 ↔ 家屬配對
create table if not exists elder_pairings (
  elder_id text primary key,
  pairing_code text unique not null,
  paired_line_user_id text,
  paired_at timestamptz,
  owner_line_user_id text not null,
  display_name text,
  created_at timestamptz default now()
);
alter table elder_pairings enable row level security;
create index if not exists idx_elder_pairings_code on elder_pairings (pairing_code);
create index if not exists idx_elder_pairings_owner on elder_pairings (owner_line_user_id);

-- 推播紀錄（除錯用）
create table if not exists push_logs (
  id bigserial primary key,
  elder_id text,
  line_user_id text,
  message text,
  status text,
  created_at timestamptz default now()
);
alter table push_logs enable row level security;
create index if not exists idx_push_logs_elder on push_logs (elder_id);
