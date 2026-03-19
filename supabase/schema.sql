-- Vover Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rdujyhbnhibesivjncks/sql

-- ─────────────────────────────────────────────
-- PROFILES (extends Supabase auth.users)
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  name text,
  avatar_url text,
  created_at timestamptz default now() not null
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────────
-- WATCHLIST
-- ─────────────────────────────────────────────
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  title text not null,
  poster_path text,
  added_at timestamptz default now() not null,
  unique (user_id, tmdb_id, media_type)
);

alter table public.watchlist enable row level security;

create policy "Users can view own watchlist" on public.watchlist
  for select using (auth.uid() = user_id);

create policy "Users can insert into own watchlist" on public.watchlist
  for insert with check (auth.uid() = user_id);

create policy "Users can delete from own watchlist" on public.watchlist
  for delete using (auth.uid() = user_id);

create index if not exists watchlist_user_id_idx on public.watchlist(user_id);

-- ─────────────────────────────────────────────
-- FRIENDSHIPS (must come before watched/recommendations policies)
-- ─────────────────────────────────────────────
create table if not exists public.friendships (
  id uuid default gen_random_uuid() primary key,
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text check (status in ('pending', 'accepted', 'rejected')) default 'pending' not null,
  created_at timestamptz default now() not null,
  unique (requester_id, addressee_id)
);

alter table public.friendships enable row level security;

create policy "Users can view own friendships" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);

create policy "Users can send friend requests" on public.friendships
  for insert with check (auth.uid() = requester_id);

create policy "Addressee can update friendship status" on public.friendships
  for update using (auth.uid() = addressee_id);

create policy "Users can delete own friendships" on public.friendships
  for delete using (auth.uid() = requester_id or auth.uid() = addressee_id);

-- ─────────────────────────────────────────────
-- WATCHED
-- ─────────────────────────────────────────────
create table if not exists public.watched (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  title text not null,
  poster_path text,
  rating integer check (rating >= 1 and rating <= 5),
  note text,
  watched_at timestamptz default now() not null,
  unique (user_id, tmdb_id, media_type)
);

alter table public.watched enable row level security;

create policy "Users can view own watched" on public.watched
  for select using (auth.uid() = user_id);

create policy "Users can insert into own watched" on public.watched
  for insert with check (auth.uid() = user_id);

create policy "Users can update own watched" on public.watched
  for update using (auth.uid() = user_id);

create policy "Users can delete from own watched" on public.watched
  for delete using (auth.uid() = user_id);

-- Friends can see each other's watched entries
create policy "Friends can view each other's watched" on public.watched
  for select using (
    exists (
      select 1 from public.friendships
      where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = user_id)
        or
        (addressee_id = auth.uid() and requester_id = user_id)
      )
    )
  );

create index if not exists watched_user_id_idx on public.watched(user_id);

-- ─────────────────────────────────────────────
-- RECOMMENDATIONS
-- ─────────────────────────────────────────────
create table if not exists public.recommendations (
  id uuid default gen_random_uuid() primary key,
  from_user_id uuid references public.profiles(id) on delete cascade not null,
  to_user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  title text not null,
  poster_path text,
  note text,
  created_at timestamptz default now() not null
);

alter table public.recommendations enable row level security;

create policy "Users can view recommendations sent to them" on public.recommendations
  for select using (auth.uid() = to_user_id or auth.uid() = from_user_id);

create policy "Users can send recommendations to friends" on public.recommendations
  for insert with check (
    auth.uid() = from_user_id
    and exists (
      select 1 from public.friendships
      where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = to_user_id)
        or
        (addressee_id = auth.uid() and requester_id = to_user_id)
      )
    )
  );

create index if not exists recommendations_to_user_idx on public.recommendations(to_user_id);
create index if not exists recommendations_from_user_idx on public.recommendations(from_user_id);

-- ─── Migration: Add recommended_by to watchlist ───────────────────────────────
-- Run this in Supabase SQL Editor for existing databases:
-- https://supabase.com/dashboard/project/rdujyhbnhibesivjncks/sql
alter table public.watchlist add column if not exists recommended_by uuid references public.profiles(id);

-- ─────────────────────────────────────────────
-- SHARED LISTS
-- ─────────────────────────────────────────────
create table if not exists public.shared_lists (
  id uuid default gen_random_uuid() primary key,
  created_by uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  created_at timestamptz default now() not null
);

alter table public.shared_lists enable row level security;

create policy "Members can view shared lists" on public.shared_lists
  for select using (
    auth.uid() = created_by
    or exists (
      select 1 from public.shared_list_members
      where list_id = id and user_id = auth.uid()
    )
  );

create policy "Users can create lists" on public.shared_lists
  for insert with check (auth.uid() = created_by);

create policy "Creators can update their lists" on public.shared_lists
  for update using (auth.uid() = created_by);

create policy "Creators can delete their lists" on public.shared_lists
  for delete using (auth.uid() = created_by);

-- ─────────────────────────────────────────────
-- SHARED LIST MEMBERS
-- ─────────────────────────────────────────────
create table if not exists public.shared_list_members (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.shared_lists(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  invited_by uuid references public.profiles(id) on delete set null,
  joined_at timestamptz default now() not null,
  unique (list_id, user_id)
);

alter table public.shared_list_members enable row level security;

create policy "Members can view list members" on public.shared_list_members
  for select using (
    user_id = auth.uid()
    or exists (
      select 1 from public.shared_list_members m2
      where m2.list_id = list_id and m2.user_id = auth.uid()
    )
    or exists (
      select 1 from public.shared_lists sl
      where sl.id = list_id and sl.created_by = auth.uid()
    )
  );

create policy "List creators can add members" on public.shared_list_members
  for insert with check (
    exists (
      select 1 from public.shared_lists
      where id = list_id and created_by = auth.uid()
    )
    or exists (
      select 1 from public.shared_list_members m2
      where m2.list_id = list_id and m2.user_id = auth.uid()
    )
  );

create policy "Members can leave lists" on public.shared_list_members
  for delete using (user_id = auth.uid());

create policy "Creators can remove members" on public.shared_list_members
  for delete using (
    exists (
      select 1 from public.shared_lists
      where id = list_id and created_by = auth.uid()
    )
  );

create index if not exists shared_list_members_list_id_idx on public.shared_list_members(list_id);
create index if not exists shared_list_members_user_id_idx on public.shared_list_members(user_id);

-- ─────────────────────────────────────────────
-- SHARED LIST ITEMS
-- ─────────────────────────────────────────────
create table if not exists public.shared_list_items (
  id uuid default gen_random_uuid() primary key,
  list_id uuid references public.shared_lists(id) on delete cascade not null,
  added_by uuid references public.profiles(id) on delete cascade not null,
  tmdb_id integer not null,
  media_type text check (media_type in ('movie', 'tv')) not null,
  title text not null,
  poster_path text,
  added_at timestamptz default now() not null,
  unique (list_id, tmdb_id, media_type)
);

alter table public.shared_list_items enable row level security;

create policy "Members can view list items" on public.shared_list_items
  for select using (
    exists (
      select 1 from public.shared_list_members
      where list_id = shared_list_items.list_id and user_id = auth.uid()
    )
    or exists (
      select 1 from public.shared_lists
      where id = shared_list_items.list_id and created_by = auth.uid()
    )
  );

create policy "Members can add items to lists" on public.shared_list_items
  for insert with check (
    auth.uid() = added_by
    and (
      exists (
        select 1 from public.shared_list_members
        where list_id = shared_list_items.list_id and user_id = auth.uid()
      )
      or exists (
        select 1 from public.shared_lists
        where id = shared_list_items.list_id and created_by = auth.uid()
      )
    )
  );

create policy "Item adders and list creators can remove items" on public.shared_list_items
  for delete using (
    auth.uid() = added_by
    or exists (
      select 1 from public.shared_lists
      where id = list_id and created_by = auth.uid()
    )
  );

create index if not exists shared_list_items_list_id_idx on public.shared_list_items(list_id);
