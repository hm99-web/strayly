-- Shared trigger helper: bump updated_at on any update.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles: public-facing user data. One row per auth.users row.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username extensions.citext unique,
  display_name text not null default 'User',
  avatar_path text,
  bio text,
  role public.user_role not null default 'user',
  is_anonymous boolean not null default false,
  -- Denormalized, maintained by SECURITY DEFINER triggers only:
  trust_score integer not null default 0,
  animals_added_count integer not null default 0,
  feedings_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- user_settings: private per-user data (kept out of public profiles).
-- last_known_location powers nearby push fan-out — updated opportunistically
-- by the app when the user opens the map.
-- ---------------------------------------------------------------------------
create table public.user_settings (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  phone text,
  locale text not null default 'en',
  last_known_location extensions.geography (point, 4326),
  notification_radius_m integer not null default 2000
    check (notification_radius_m between 100 and 50000),
  notify_emergency_nearby boolean not null default true,
  notify_new_animal_nearby boolean not null default true,
  notify_followed_animals boolean not null default true,
  updated_at timestamptz not null default now()
);

create index user_settings_location_gist
  on public.user_settings using gist (last_known_location)
  where last_known_location is not null;

create trigger trg_user_settings_updated_at
  before update on public.user_settings
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Role helper used across RLS policies.
-- ---------------------------------------------------------------------------
create or replace function public.is_moderator()
returns boolean
language sql
stable
security definer
set search_path = public, extensions
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  );
$$;

-- ---------------------------------------------------------------------------
-- Auto-provision profile + settings for every new auth user.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.profiles (id, display_name, is_anonymous)
  values (
    new.id,
    case
      when coalesce(new.is_anonymous, false) then 'Guest-' || left(new.id::text, 4)
      else coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        split_part(new.email, '@', 1),
        'User'
      )
    end,
    coalesce(new.is_anonymous, false)
  );
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- When an anonymous account is upgraded (updateUser / linkIdentity), reflect it.
create or replace function public.handle_user_upgrade()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.profiles
  set
    is_anonymous = false,
    display_name = case
      when display_name like 'Guest-%' then coalesce(
        new.raw_user_meta_data ->> 'full_name',
        new.raw_user_meta_data ->> 'name',
        split_part(new.email, '@', 1),
        display_name
      )
      else display_name
    end
  where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_upgraded
  after update on auth.users
  for each row
  when (old.is_anonymous = true and new.is_anonymous = false)
  execute function public.handle_user_upgrade();

-- ---------------------------------------------------------------------------
-- RLS + column-level grants.
-- Users may edit only their identity columns; counters/role/trust_score are
-- written exclusively by SECURITY DEFINER functions (owner bypasses RLS+grants).
-- ---------------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.user_settings enable row level security;

create policy "profiles_select_public" on public.profiles
  for select using (true);
create policy "profiles_update_own" on public.profiles
  for update using (id = (select auth.uid())) with check (id = (select auth.uid()));

revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, display_name, avatar_path, bio) on public.profiles to authenticated;

create policy "user_settings_select_own" on public.user_settings
  for select using (user_id = (select auth.uid()));
create policy "user_settings_insert_own" on public.user_settings
  for insert with check (user_id = (select auth.uid()));
create policy "user_settings_update_own" on public.user_settings
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));

revoke delete on public.user_settings from anon, authenticated;
