-- ---------------------------------------------------------------------------
-- dogs: the hot table. Heavily denormalized so map/list queries never join.
-- Denormalized columns are maintained by SECURITY DEFINER triggers (see
-- 20260613000006_dog_triggers.sql) and excluded from client column grants.
-- ---------------------------------------------------------------------------
create table public.animals (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 1 and 80),
  species public.species not null default 'dog',
  description text check (char_length(description) <= 2000),
  gender public.animal_gender not null default 'unknown',
  estimated_age_months integer check (estimated_age_months between 0 and 360),
  temperament public.animal_temperament not null default 'unknown',
  color_markings text,
  status public.animal_status not null default 'active',
  -- Care state (denormalized; trigger-maintained except where noted):
  health_status public.animal_health_status not null default 'healthy', -- community-editable + trigger-updated
  has_active_emergency boolean not null default false,
  has_babies boolean not null default false,                        -- community-editable
  vaccination_status public.tri_state not null default 'unknown',    -- client may set on insert; 'yes' via records
  sterilization_status public.tri_state not null default 'unknown',
  sterilized_at date,
  last_fed_at timestamptz,
  last_fed_by uuid references public.profiles (id),
  feedings_count integer not null default 0,
  followers_count integer not null default 0,
  primary_photo_path text,
  primary_thumb_path text,
  -- Location (denormalized from animal_locations):
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

create index animals_location_gist on public.animals using gist (location) where deleted_at is null;
create index animals_last_fed_idx on public.animals (last_fed_at asc nulls first) where deleted_at is null;
create index animals_keyset_idx on public.animals (created_at desc, id desc) where deleted_at is null;
create index animals_created_by_idx on public.animals (created_by);
create index animals_city_idx on public.animals (city) where deleted_at is null;

create trigger trg_animals_updated_at
  before update on public.animals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- animal_photos
-- ---------------------------------------------------------------------------
create table public.animal_photos (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  storage_path text not null,
  thumb_path text,
  caption text check (char_length(caption) <= 300),
  is_primary boolean not null default false,
  width integer,
  height integer,
  uploaded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create index animal_photos_animal_idx on public.animal_photos (animal_id, created_at desc);

-- ---------------------------------------------------------------------------
-- animal_locations: append-only sighting history. High volume → bigint identity.
-- ---------------------------------------------------------------------------
create table public.animal_locations (
  id bigint generated always as identity primary key,
  animal_id uuid not null references public.animals (id) on delete cascade,
  location extensions.geography (point, 4326) not null,
  accuracy_m real,
  source public.location_source not null default 'sighting',
  note text check (char_length(note) <= 500),
  recorded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create index animal_locations_animal_idx on public.animal_locations (animal_id, id desc);
create index animal_locations_gist on public.animal_locations using gist (location);

-- ---------------------------------------------------------------------------
-- RLS. Community-wiki model: any authenticated user (including anonymous
-- sessions) can add dogs and contribute updates; the activity log records who.
-- Soft delete / status overrides are moderator-only via RPC.
-- ---------------------------------------------------------------------------
alter table public.animals enable row level security;
alter table public.animal_photos enable row level security;
alter table public.animal_locations enable row level security;

create policy "animals_select_public" on public.animals
  for select using (deleted_at is null or public.is_moderator());
create policy "animals_insert_authenticated" on public.animals
  for insert to authenticated with check (created_by = (select auth.uid()));
create policy "animals_update_authenticated" on public.animals
  for update to authenticated using (deleted_at is null) with check (deleted_at is null);

-- Clients can only touch community-editable columns; denorms stay trigger-owned.
revoke insert, update, delete on public.animals from anon, authenticated;
grant insert (
  name, species, description, gender, estimated_age_months, temperament, color_markings,
  health_status, has_babies, vaccination_status, sterilization_status,
  location, address_text, city, medical_notes, created_by
) on public.animals to authenticated;
grant update (
  name, species, description, gender, estimated_age_months, temperament, color_markings,
  health_status, has_babies, status, address_text, city, medical_notes
) on public.animals to authenticated;

create policy "animal_photos_select_public" on public.animal_photos
  for select using (true);
create policy "animal_photos_insert_own" on public.animal_photos
  for insert to authenticated with check (uploaded_by = (select auth.uid()));
create policy "animal_photos_update_own_24h" on public.animal_photos
  for update to authenticated
  using ((uploaded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());
create policy "animal_photos_delete_own_24h" on public.animal_photos
  for delete to authenticated
  using ((uploaded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());

create policy "animal_locations_select_public" on public.animal_locations
  for select using (true);
create policy "animal_locations_insert_own" on public.animal_locations
  for insert to authenticated with check (recorded_by = (select auth.uid()));

revoke update, delete on public.animal_locations from anon, authenticated;
