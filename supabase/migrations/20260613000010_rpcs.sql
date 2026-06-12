-- ---------------------------------------------------------------------------
-- Feeding staleness. Thresholds MUST stay in sync with src/constants/feeding.ts
-- (these two places are the only definitions): <24h green, 24–72h yellow, else red.
-- ---------------------------------------------------------------------------
create or replace function public.fn_feeding_status(p_last_fed_at timestamptz)
returns text
language sql
stable
as $$
  select case
    when p_last_fed_at is null then 'red'
    when p_last_fed_at > now() - interval '24 hours' then 'green'
    when p_last_fed_at > now() - interval '72 hours' then 'yellow'
    else 'red'
  end;
$$;

-- ---------------------------------------------------------------------------
-- Radius discovery for the "near me" list. Distance-ordered, capped at 200.
-- ---------------------------------------------------------------------------
create or replace function public.dogs_within_radius(
  p_lat double precision,
  p_lng double precision,
  p_radius_m integer default 2000,
  p_feeding_status text default null,
  p_vaccinated public.tri_state default null,
  p_sterilized public.tri_state default null,
  p_health public.dog_health_status[] default null,
  p_has_emergency boolean default null,
  p_puppies boolean default null,
  p_limit integer default 100,
  p_offset integer default 0
)
returns table (
  id uuid, name text, gender public.dog_gender, estimated_age_months integer,
  temperament public.dog_temperament, status public.dog_status,
  health_status public.dog_health_status, has_active_emergency boolean,
  has_puppies boolean, vaccination_status public.tri_state,
  sterilization_status public.tri_state, last_fed_at timestamptz,
  feedings_count integer, followers_count integer,
  primary_photo_path text, primary_thumb_path text,
  lat double precision, lng double precision,
  address_text text, city text, last_seen_at timestamptz, created_at timestamptz,
  feeding_status text, distance_m double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    d.id, d.name, d.gender, d.estimated_age_months, d.temperament, d.status,
    d.health_status, d.has_active_emergency, d.has_puppies,
    d.vaccination_status, d.sterilization_status, d.last_fed_at,
    d.feedings_count, d.followers_count, d.primary_photo_path, d.primary_thumb_path,
    st_y(d.location::geometry) as lat, st_x(d.location::geometry) as lng,
    d.address_text, d.city, d.last_seen_at, d.created_at,
    public.fn_feeding_status(d.last_fed_at) as feeding_status,
    st_distance(d.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) as distance_m
  from public.dogs d
  where d.deleted_at is null
    and d.status in ('active', 'missing')
    and st_dwithin(d.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, p_radius_m)
    and (p_feeding_status is null or public.fn_feeding_status(d.last_fed_at) = p_feeding_status)
    and (p_vaccinated is null or d.vaccination_status = p_vaccinated)
    and (p_sterilized is null or d.sterilization_status = p_sterilized)
    and (p_health is null or d.health_status = any (p_health))
    and (p_has_emergency is null or d.has_active_emergency = p_has_emergency)
    and (p_puppies is null or d.has_puppies = p_puppies)
  order by distance_m
  limit least(coalesce(p_limit, 100), 200)
  offset greatest(coalesce(p_offset, 0), 0);
$$;

-- ---------------------------------------------------------------------------
-- Viewport query for the map. Client clusters with supercluster; capped at 500.
-- ---------------------------------------------------------------------------
create or replace function public.dogs_in_bbox(
  p_min_lng double precision,
  p_min_lat double precision,
  p_max_lng double precision,
  p_max_lat double precision,
  p_feeding_status text default null,
  p_vaccinated public.tri_state default null,
  p_sterilized public.tri_state default null,
  p_health public.dog_health_status[] default null,
  p_has_emergency boolean default null,
  p_puppies boolean default null,
  p_limit integer default 500
)
returns table (
  id uuid, name text, gender public.dog_gender, estimated_age_months integer,
  temperament public.dog_temperament, status public.dog_status,
  health_status public.dog_health_status, has_active_emergency boolean,
  has_puppies boolean, vaccination_status public.tri_state,
  sterilization_status public.tri_state, last_fed_at timestamptz,
  feedings_count integer, followers_count integer,
  primary_photo_path text, primary_thumb_path text,
  lat double precision, lng double precision,
  address_text text, city text, last_seen_at timestamptz, created_at timestamptz,
  feeding_status text, distance_m double precision
)
language sql
stable
set search_path = public, extensions
as $$
  select
    d.id, d.name, d.gender, d.estimated_age_months, d.temperament, d.status,
    d.health_status, d.has_active_emergency, d.has_puppies,
    d.vaccination_status, d.sterilization_status, d.last_fed_at,
    d.feedings_count, d.followers_count, d.primary_photo_path, d.primary_thumb_path,
    st_y(d.location::geometry) as lat, st_x(d.location::geometry) as lng,
    d.address_text, d.city, d.last_seen_at, d.created_at,
    public.fn_feeding_status(d.last_fed_at) as feeding_status,
    null::double precision as distance_m
  from public.dogs d
  where d.deleted_at is null
    and d.status in ('active', 'missing')
    and d.location && st_makeenvelope(p_min_lng, p_min_lat, p_max_lng, p_max_lat, 4326)::geography
    and (p_feeding_status is null or public.fn_feeding_status(d.last_fed_at) = p_feeding_status)
    and (p_vaccinated is null or d.vaccination_status = p_vaccinated)
    and (p_sterilized is null or d.sterilization_status = p_sterilized)
    and (p_health is null or d.health_status = any (p_health))
    and (p_has_emergency is null or d.has_active_emergency = p_has_emergency)
    and (p_puppies is null or d.has_puppies = p_puppies)
  limit least(coalesce(p_limit, 500), 500);
$$;

-- ---------------------------------------------------------------------------
-- Duplicate guard before creating a dog: nearby active dogs, gender matches first.
-- ---------------------------------------------------------------------------
create or replace function public.nearby_duplicate_check(
  p_lat double precision,
  p_lng double precision,
  p_gender public.dog_gender default null,
  p_radius_m integer default 150
)
returns table (
  id uuid, name text, gender public.dog_gender, temperament public.dog_temperament,
  primary_thumb_path text, last_seen_at timestamptz, distance_m double precision,
  gender_match boolean
)
language sql
stable
set search_path = public, extensions
as $$
  select
    d.id, d.name, d.gender, d.temperament, d.primary_thumb_path, d.last_seen_at,
    st_distance(d.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography) as distance_m,
    (p_gender is not null and d.gender = p_gender) as gender_match
  from public.dogs d
  where d.deleted_at is null
    and d.status = 'active'
    and st_dwithin(d.location, st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography, least(p_radius_m, 1000))
  order by gender_match desc, distance_m
  limit 10;
$$;

-- ---------------------------------------------------------------------------
-- Dog timeline: keyset pagination over activity_logs with actor info attached.
-- ---------------------------------------------------------------------------
create or replace function public.get_dog_timeline(
  p_dog_id uuid,
  p_before_id bigint default null,
  p_limit integer default 25
)
returns table (
  id bigint, dog_id uuid, actor_id uuid, actor_name text, actor_avatar text,
  activity_type public.activity_type, summary text, metadata jsonb, created_at timestamptz
)
language sql
stable
set search_path = public, extensions
as $$
  select
    a.id, a.dog_id, a.actor_id, p.display_name as actor_name, p.avatar_path as actor_avatar,
    a.activity_type, a.summary, a.metadata, a.created_at
  from public.activity_logs a
  left join public.profiles p on p.id = a.actor_id
  where a.dog_id = p_dog_id
    and (p_before_id is null or a.id < p_before_id)
  order by a.id desc
  limit least(coalesce(p_limit, 25), 50);
$$;

-- ---------------------------------------------------------------------------
-- Push fan-out audience resolution. Service-role only (called by the edge fn).
-- ---------------------------------------------------------------------------
create or replace function public.users_to_notify(
  p_lat double precision,
  p_lng double precision,
  p_kind text,
  p_exclude uuid default null
)
returns table (user_id uuid, expo_push_token text)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select s.user_id, t.expo_push_token
  from public.user_settings s
  join public.push_tokens t on t.user_id = s.user_id and t.revoked_at is null
  where (p_exclude is null or s.user_id <> p_exclude)
    and s.last_known_location is not null
    and st_dwithin(
      s.last_known_location,
      st_setsrid(st_makepoint(p_lng, p_lat), 4326)::geography,
      s.notification_radius_m
    )
    and case p_kind
      when 'emergency_created' then s.notify_emergency_nearby
      when 'new_dog_nearby' then s.notify_new_dog_nearby
      else false
    end;
$$;

revoke execute on function public.users_to_notify from public, anon, authenticated;
grant execute on function public.users_to_notify to service_role;

create or replace function public.followers_to_notify(
  p_dog_id uuid,
  p_exclude uuid default null
)
returns table (user_id uuid, expo_push_token text)
language sql
stable
security definer
set search_path = public, extensions
as $$
  select f.user_id, t.expo_push_token
  from public.dog_follows f
  join public.user_settings s on s.user_id = f.user_id and s.notify_followed_dogs
  join public.push_tokens t on t.user_id = f.user_id and t.revoked_at is null
  where f.dog_id = p_dog_id
    and (p_exclude is null or f.user_id <> p_exclude);
$$;

revoke execute on function public.followers_to_notify from public, anon, authenticated;
grant execute on function public.followers_to_notify to service_role;

-- ---------------------------------------------------------------------------
-- Inbox helper.
-- ---------------------------------------------------------------------------
create or replace function public.mark_all_notifications_read()
returns void
language sql
set search_path = public, extensions
as $$
  update public.notifications
  set read_at = now()
  where user_id = auth.uid() and read_at is null;
$$;

-- ---------------------------------------------------------------------------
-- Moderation: soft delete (the only delete path for dogs).
-- ---------------------------------------------------------------------------
create or replace function public.admin_soft_delete_dog(p_dog_id uuid)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if not public.is_moderator() then
    raise exception 'moderator role required';
  end if;
  update public.dogs set deleted_at = now() where id = p_dog_id;
end;
$$;
