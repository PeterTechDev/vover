-- Migration: Onboarding + Invite System
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/rdujyhbnhibesivjncks/sql

-- ─────────────────────────────────────────────
-- 1. Add onboarding_completed to profiles
-- ─────────────────────────────────────────────
alter table public.profiles
  add column if not exists onboarding_completed boolean default false not null;

-- ─────────────────────────────────────────────
-- 2. INVITE CODES
-- ─────────────────────────────────────────────
create table if not exists public.invite_codes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  code text not null unique,
  uses integer default 0 not null,
  created_at timestamptz default now() not null
);

alter table public.invite_codes enable row level security;

create policy "Anyone can read invite codes (for landing page)" on public.invite_codes
  for select using (true);

create policy "Users can insert own invite code" on public.invite_codes
  for insert with check (auth.uid() = user_id);

create policy "Users can update own invite code uses" on public.invite_codes
  for update using (true);

create index if not exists invite_codes_code_idx on public.invite_codes(code);
create index if not exists invite_codes_user_id_idx on public.invite_codes(user_id);
