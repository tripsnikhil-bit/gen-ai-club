/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient } from '@supabase/supabase-js';

// Environment variables for Supabase - strictly using standard VITE_ env prefixes
const envUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();

// Ensure only public/publishable/anon keys are used in the browser, never a secret service-role key
const rawAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
const rawPubKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || '').trim();

// Pick the safe public publishable/anon key. If any key starts with sb_secret_, it is strictly excluded.
const resolveSafeKey = (): string => {
  if (rawPubKey && !rawPubKey.startsWith('sb_secret_') && !rawPubKey.includes('placeholder')) {
    return rawPubKey;
  }
  if (rawAnonKey && !rawAnonKey.startsWith('sb_secret_') && !rawAnonKey.includes('placeholder')) {
    return rawAnonKey;
  }
  return '';
};

const envKey = resolveSafeKey();

// Detect if valid Supabase credentials are provided
export const isSupabaseConfigured = Boolean(
  envUrl &&
  envKey &&
  !envUrl.includes('placeholder') &&
  !envKey.includes('placeholder') &&
  !envKey.startsWith('sb_secret_') &&
  (envUrl.startsWith('http://') || envUrl.startsWith('https://'))
);

// Fallback dummy credentials to prevent createClient URL parsing crash when keys are pending in fresh environments
const validUrl = isSupabaseConfigured ? envUrl : 'https://placeholder-project.supabase.co';
const validKey = isSupabaseConfigured ? envKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_anon_key';

export const supabase = createClient(validUrl, validKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// Production PostgreSQL SQL Schema for Supabase SQL Editor
export const SUPABASE_SETUP_SQL = `-- ========================================================================
-- GEN AI CLUB (NIAT SANSKRITI): PRODUCTION SUPABASE POSTGRESQL SCHEMA
-- Paste this script directly into Supabase Dashboard -> SQL Editor -> Run
-- ========================================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------------------
-- 1. PROFILES TABLE (Linked to auth.users)
-- ------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text not null,
  role text not null default 'student' check (role in ('student', 'executive', 'president', 'vice_president', 'member')),
  branch text default 'Computer Science & Engineering',
  github_url text default '',
  phone text default '',
  roll_number text default '',
  year text default '2nd Year',
  skills text default '',
  bio text default '',
  linkedin_url text default '',
  status text not null default 'approved' check (status in ('approved', 'pending', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast user/email lookups
create index if not exists idx_profiles_email on public.profiles(lower(email));
create index if not exists idx_profiles_role on public.profiles(role);

-- ------------------------------------------------------------------------
-- 2. JOIN REQUESTS TABLE (Student Applications)
-- ------------------------------------------------------------------------
create table if not exists public.join_requests (
  id text primary key default gen_random_uuid()::text,
  full_name text not null,
  email text not null,
  roll_number text not null,
  statement_of_interest text default '',
  statement text default '',
  phone text default '',
  branch text default 'Computer Science & Engineering',
  year text default '2nd Year',
  skills text default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by text
);

create index if not exists idx_join_requests_email on public.join_requests(lower(email));
create index if not exists idx_join_requests_status on public.join_requests(status);

-- ------------------------------------------------------------------------
-- 3. PROJECTS TABLE (Showcase Club Work)
-- ------------------------------------------------------------------------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  tech_stack text default '',
  github_url text default '',
  live_url text default '',
  demo_url text default '',
  category text default 'Generative AI',
  status text default 'Ongoing' check (status in ('Ongoing', 'Completed', 'Upcoming')),
  team_members text default '',
  image_url text default '',
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------
-- 4. NEWS TABLE (Official Announcements)
-- ------------------------------------------------------------------------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  summary text default '',
  category text default 'Club Announcement',
  author text default 'Executive Council',
  published_at timestamptz default now(),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------
-- 5. EVENTS TABLE (Hackathons & Workshops)
-- ------------------------------------------------------------------------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  date text not null,
  location text default '',
  venue text default '',
  time text default '',
  rsvp_url text default '',
  status text default 'Upcoming' check (status in ('Upcoming', 'Completed')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------------------
-- 6. SETTINGS TABLE (Club Config & Social Links)
-- ------------------------------------------------------------------------
create table if not exists public.settings (
  id text primary key default 'club',
  club_name text default 'Gen AI Club',
  college_name text default 'NIAT SANSKRITI',
  contact_email text default 'tripsnikhil@gmail.com',
  tagline text default 'Pioneering Artificial Intelligence Research & Engineering',
  instagram_url text default '',
  linkedin_url text default '',
  github_url text default '',
  updated_at timestamptz default now()
);

-- Seed default settings if missing
insert into public.settings (id, club_name, college_name, contact_email, tagline)
values ('club', 'Gen AI Club', 'NIAT SANSKRITI', 'tripsnikhil@gmail.com', 'Pioneering Artificial Intelligence Research & Engineering')
on conflict (id) do nothing;

-- ------------------------------------------------------------------------
-- 7. SITE FEEDBACK TABLE (User Inquiries & Club Suggestions)
-- ------------------------------------------------------------------------
create table if not exists public.site_feedback (
  id uuid primary key default gen_random_uuid(),
  name text,
  email text,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_site_feedback_created_at on public.site_feedback(created_at desc);

-- ------------------------------------------------------------------------
-- SECURITY DEFINER HELPER: Check if Current User is Executive
-- ------------------------------------------------------------------------
create or replace function public.is_executive()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (
        role in ('executive', 'president', 'vice_president')
        or lower(email) = 'tripsnikhil@gmail.com'
      )
  ) or (
    lower(coalesce(auth.jwt() ->> 'email', '')) = 'tripsnikhil@gmail.com'
  );
$$;

-- ------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------

-- Enable RLS across all tables
alter table public.profiles enable row level security;
alter table public.join_requests enable row level security;
alter table public.projects enable row level security;
alter table public.news enable row level security;
alter table public.events enable row level security;
alter table public.settings enable row level security;
alter table public.site_feedback enable row level security;

-- ---------------- PROFILES POLICIES ----------------
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own_or_exec" on public.profiles;
drop policy if exists "profiles_update_own_or_exec" on public.profiles;
drop policy if exists "profiles_delete_exec" on public.profiles;

-- Anyone/members can read all profiles (for member directory)
create policy "profiles_select_all"
  on public.profiles for select
  using (true);

-- Users can insert their own profile or executives can insert
create policy "profiles_insert_own_or_exec"
  on public.profiles for insert
  with check (auth.uid() = id or public.is_executive());

-- Users can only update their own profile; executives can update any
create policy "profiles_update_own_or_exec"
  on public.profiles for update
  using (auth.uid() = id or public.is_executive());

-- Only executives can delete profiles
create policy "profiles_delete_exec"
  on public.profiles for delete
  using (public.is_executive());

-- ---------------- JOIN_REQUESTS POLICIES ----------------
drop policy if exists "join_requests_insert_public" on public.join_requests;
drop policy if exists "join_requests_select_executive" on public.join_requests;
drop policy if exists "join_requests_update_executive" on public.join_requests;
drop policy if exists "join_requests_delete_executive" on public.join_requests;

-- Anyone can submit a join request (including non-logged in applicants)
create policy "join_requests_insert_public"
  on public.join_requests for insert
  with check (true);

-- Executives can view all join requests; applicants can view their own request
create policy "join_requests_select_executive"
  on public.join_requests for select
  using (
    public.is_executive()
    or auth.uid()::text = id
    or lower(coalesce(auth.jwt() ->> 'email', '')) = lower(email)
  );

-- ONLY executives can update join requests (approve/reject)
create policy "join_requests_update_executive"
  on public.join_requests for update
  using (public.is_executive());

-- ONLY executives can delete join requests
create policy "join_requests_delete_executive"
  on public.join_requests for delete
  using (public.is_executive());

-- ---------------- PROJECTS POLICIES ----------------
drop policy if exists "projects_select_public" on public.projects;
drop policy if exists "projects_insert_executive" on public.projects;
drop policy if exists "projects_update_executive" on public.projects;
drop policy if exists "projects_delete_executive" on public.projects;

-- Public can view all projects
create policy "projects_select_public"
  on public.projects for select
  using (true);

-- ONLY executives can insert, update, delete projects
create policy "projects_insert_executive"
  on public.projects for insert
  with check (public.is_executive());

create policy "projects_update_executive"
  on public.projects for update
  using (public.is_executive());

create policy "projects_delete_executive"
  on public.projects for delete
  using (public.is_executive());

-- ---------------- NEWS POLICIES ----------------
drop policy if exists "news_select_public" on public.news;
drop policy if exists "news_insert_executive" on public.news;
drop policy if exists "news_update_executive" on public.news;
drop policy if exists "news_delete_executive" on public.news;

-- Public can read official news
create policy "news_select_public"
  on public.news for select
  using (true);

-- ONLY executives can insert, update, delete news
create policy "news_insert_executive"
  on public.news for insert
  with check (public.is_executive());

create policy "news_update_executive"
  on public.news for update
  using (public.is_executive());

create policy "news_delete_executive"
  on public.news for delete
  using (public.is_executive());

-- ---------------- EVENTS POLICIES ----------------
drop policy if exists "events_select_public" on public.events;
drop policy if exists "events_insert_executive" on public.events;
drop policy if exists "events_update_executive" on public.events;
drop policy if exists "events_delete_executive" on public.events;

-- Public can read events & hackathons
create policy "events_select_public"
  on public.events for select
  using (true);

-- ONLY executives can insert, update, delete events
create policy "events_insert_executive"
  on public.events for insert
  with check (public.is_executive());

create policy "events_update_executive"
  on public.events for update
  using (public.is_executive());

create policy "events_delete_executive"
  on public.events for delete
  using (public.is_executive());

-- ---------------- SETTINGS POLICIES ----------------
drop policy if exists "settings_select_public" on public.settings;
drop policy if exists "settings_all_executive" on public.settings;

create policy "settings_select_public"
  on public.settings for select
  using (true);

create policy "settings_all_executive"
  on public.settings for all
  using (public.is_executive());

-- ---------------- SITE FEEDBACK POLICIES ----------------
drop policy if exists "site_feedback_insert_public" on public.site_feedback;
drop policy if exists "site_feedback_select_executive" on public.site_feedback;
drop policy if exists "site_feedback_delete_executive" on public.site_feedback;

-- Anyone can submit feedback (including non-logged in students and guests)
create policy "site_feedback_insert_public"
  on public.site_feedback for insert
  with check (true);

-- ONLY authenticated executives can view/read submitted feedback
create policy "site_feedback_select_executive"
  on public.site_feedback for select
  using (public.is_executive());

-- ONLY executives can delete feedback
create policy "site_feedback_delete_executive"
  on public.site_feedback for delete
  using (public.is_executive());

-- ------------------------------------------------------------------------
-- AUTOMATIC USER PROFILES TRIGGER
-- Automatically provisions a profile row when a user registers via Supabase Auth
-- ------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  is_pres boolean;
  assigned_role text;
begin
  is_pres := (lower(new.email) = 'tripsnikhil@gmail.com');
  if is_pres then
    assigned_role := 'executive';
  else
    assigned_role := coalesce(new.raw_user_meta_data ->> 'role', 'student');
  end if;

  insert into public.profiles (id, email, full_name, role, status, created_at, updated_at)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    assigned_role,
    'approved',
    now(),
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    full_name = coalesce(public.profiles.full_name, excluded.full_name),
    role = case when is_pres then 'executive' else public.profiles.role end,
    updated_at = now();

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
`;
