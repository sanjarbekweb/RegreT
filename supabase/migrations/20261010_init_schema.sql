-- RegreT Personal Life OS — PostgreSQL & Supabase Database Migration
-- Fully normalized relational schema with Row-Level Security (RLS)

create extension if not exists pgcrypto;

-- User preferences & display settings
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'Asia/Tashkent',
  week_starts_on smallint not null default 1 check (week_starts_on between 0 and 6),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- User-defined activity categories
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  color text not null default '#64748b',
  icon_name text,
  sort_order integer not null default 0,
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  unique (user_id, id),
  unique (user_id, name)
);

-- Central timeline record
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category_id uuid not null,
  title text not null,
  description text,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  constraint activity_time_valid
    check (ended_at is null or ended_at >= started_at),
  constraint activity_category_owner
    foreign key (user_id, category_id)
    references public.categories(user_id, id)
);

create index if not exists activities_timeline_idx
  on public.activities (user_id, started_at desc)
  where deleted_at is null;

create index if not exists activities_category_timeline_idx
  on public.activities (user_id, category_id, started_at desc)
  where deleted_at is null;

-- File and photo metadata (bytes stored in Supabase Storage bucket 'life-media')
create table if not exists public.attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null,
  storage_key text not null unique,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes >= 0),
  caption text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  constraint attachment_activity_owner
    foreign key (user_id, activity_id)
    references public.activities(user_id, id)
    on delete cascade
);

create index if not exists attachments_activity_idx
  on public.attachments (activity_id, sort_order);

-- Reusable tags
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (user_id, name),
  unique (user_id, id)
);

create table if not exists public.activity_tags (
  user_id uuid not null references auth.users(id) on delete cascade,
  activity_id uuid not null,
  tag_id uuid not null,
  primary key (activity_id, tag_id),
  foreign key (user_id, activity_id)
    references public.activities(user_id, id) on delete cascade,
  foreign key (user_id, tag_id)
    references public.tags(user_id, id) on delete cascade
);

-- Habits & daily tracking
create table if not exists public.habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category_id uuid,
  target_per_week smallint not null default 7 check (target_per_week between 1 and 7),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  foreign key (user_id, category_id)
    references public.categories(user_id, id)
);

create table if not exists public.habit_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null,
  completed_on date not null,
  activity_id uuid,
  note text,
  created_at timestamptz not null default now(),
  foreign key (user_id, habit_id)
    references public.habits(user_id, id) on delete cascade,
  foreign key (user_id, activity_id)
    references public.activities(user_id, id),
  unique (habit_id, completed_on)
);

create index if not exists habit_completions_date_idx
  on public.habit_completions (user_id, completed_on desc);

-- Enable Row-Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.activities enable row level security;
alter table public.attachments enable row level security;
alter table public.tags enable row level security;
alter table public.activity_tags enable row level security;
alter table public.habits enable row level security;
alter table public.habit_completions enable row level security;

create policy "Own profile only" on public.profiles for all to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "Own categories only" on public.categories for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own activities only" on public.activities for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own attachments only" on public.attachments for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own tags only" on public.tags for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own activity tag links only" on public.activity_tags for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own habits only" on public.habits for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Own habit completions only" on public.habit_completions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
