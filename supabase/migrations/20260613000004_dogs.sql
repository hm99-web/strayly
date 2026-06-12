-- ---------------------------------------------------------------------------
-- dogs: the hot table. Heavily denormalized so map/list queries never join.
-- Denormalized columns are maintained by SECURITY DEFINER triggers (see
-- 20260613000006_dog_triggers.sql) and excluded from client column grants.
-- ---------------------------------------------------------------------------
create table public.dogs (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  description text check (char_length(description) <= 2000),
  gender public.dog_gender not null default 'unknown',
  estimated_age_months integer check (estimated_age_months between 0 and 360),
  temperament public.dog_temperament not null default 'unknown',
  color_markings text,
  status public.dog_status not null default 'active',
  -- Care state (denormalized; trigger-maintained except where noted):
  health_status public.dog_health_status not null default 'healthy', -- community-editable + trigger-updated
  has_active_emergency boolean not null default false,
  has_puppies boolean not null default false,                        -- community-editable
  vaccination_status public.tri_state not null default 'unknown',    -- client may set on insert; 'yes' via records
  sterilization_status public.tri_state not null default 'unknown',
  sterilized_at date,
  last_fed_at timestamptz,
  last_fed_by uuid references public.profiles (id),
  feedings_count integer not null default 0,
  followers_count integer not null default 0,
  primary_photo_path text,
  primary_thumb_path text,
  -- Location (denormalized from dog_locations):
  location extensions.geography (point, 4326) not null,
  address_text text,
  city text,
  last_seen_at timestamptz not null default now(),
  last_seen_by uuid references public.profiles (id),
  medical_notes text,
  created_by uuid not null default auth.uid() references public.profiles (id),
  deleted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dogs_location_gist on public.dogs using gist (location) where deleted_at is null;
create index dogs_last_fed_idx on public.dogs (last_fed_at asc nulls first) where deleted_at is null;
create index dogs_keyset_idx on public.dogs (created_at desc, id desc) where deleted_at is null;
create index dogs_created_by_idx on public.dogs (created_by);
create index dogs_city_idx on public.dogs (city) where deleted_at is null;

create trigger trg_dogs_updated_at
  before update on public.dogs
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- dog_photos
-- ---------------------------------------------------------------------------
create table public.dog_photos (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs (id) on delete cascade,
  storage_path text not null,
  thumb_path text,
  caption text check (char_length(caption) <= 300),
  is_primary boolean not null default false,
  width integer,
  height integer,
  uploaded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create index dog_photos_dog_idx on public.dog_photos (dog_id, created_at desc);

-- ---------------------------------------------------------------------------
-- dog_locations: append-only sighting history. High volume → bigint identity.
-- ---------------------------------------------------------------------------
create table public.dog_locations (
  id bigint generated always as identity primary key,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  location extensions.geography (point, 4326) not null,
  accuracy_m real,
  source public.location_source not null default 'sighting',
  note text check (char_length(note) <= 500),
  recorded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create index dog_locations_dog_idx on public.dog_locations (dog_id, id desc);
create index dog_locations_gist on public.dog_locations using gist (location);

-- ---------------------------------------------------------------------------
-- RLS. Community-wiki model: any authenticated user (including anonymous
-- sessions) can add dogs and contribute updates; the activity log records who.
-- Soft delete / status overrides are moderator-only via RPC.
-- ---------------------------------------------------------------------------
alter table public.dogs enable row level security;
alter table public.dog_photos enable row level security;
alter table public.dog_locations enable row level security;

create policy "dogs_select_public" on public.dogs
  for select using (deleted_at is null or public.is_moderator());
create policy "dogs_insert_authenticated" on public.dogs
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "dogs_update_authenticated" on public.dogs
  for update to authenticated using (deleted_at is null) with check (deleted_at is null);

-- Clients can only touch community-editable columns; denorms stay trigger-owned.
revoke insert, update, delete on public.dogs from anon, authenticated;
grant insert (
  name, description, gender, estimated_age_months, temperament, color_markings,
  health_status, has_puppies, vaccination_status, sterilization_status,
  location, address_text, city, medical_notes, created_by
) on public.dogs to authenticated;
grant update (
  name, description, gender, estimated_age_months, temperament, color_markings,
  health_status, has_puppies, status, address_text, city, medical_notes
) on public.dogs to authenticated;

create policy "dog_photos_select_public" on public.dog_photos
  for select using (true);
create policy "dog_photos_insert_own" on public.dog_photos
  for insert to authenticated with check (uploaded_by = (select auth.uid()));
create policy "dog_photos_update_own_24h" on public.dog_photos
  for update to authenticated
  using ((uploaded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());
create policy "dog_photos_delete_own_24h" on public.dog_photos
  for delete to authenticated
  using ((uploaded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());

create policy "dog_locations_select_public" on public.dog_locations
  for select using (true);
create policy "dog_locations_insert_own" on public.dog_locations
  for insert to authenticated with check (recorded_by = (select auth.uid()));

revoke update, delete on public.dog_locations from anon, authenticated;
