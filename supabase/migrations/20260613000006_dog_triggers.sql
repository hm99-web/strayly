-- Event triggers for dogs, dog_photos, dog_locations.
-- All SECURITY DEFINER: they write denormalized columns and activity_logs,
-- which clients have no grants for.

-- ---------------------------------------------------------------------------
-- New dog: log creation, bump author counter, record the initial location row,
-- and ping the fan-out function so nearby users learn about the new dog.
-- ---------------------------------------------------------------------------
create or replace function public.trg_dogs_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.dog_locations (dog_id, location, source, recorded_by)
  values (new.id, new.location, 'initial', new.created_by);

  update public.profiles
  set dogs_added_count = dogs_added_count + 1
  where id = new.created_by;

  perform public.fn_log_activity(
    new.id, new.created_by, 'dog_created', 'dogs', new.id::text,
    new.name || ' was added',
    jsonb_build_object('name', new.name)
  );

  perform public.fn_notify_fanout(jsonb_build_object(
    'type', 'new_dog_nearby',
    'dog_id', new.id,
    'name', new.name,
    'lat', extensions.st_y(new.location::extensions.geometry),
    'lng', extensions.st_x(new.location::extensions.geometry),
    'created_by', new.created_by
  ));

  return new;
end;
$$;

create trigger trg_dogs_after_insert
  after insert on public.dogs
  for each row execute function public.trg_dogs_after_insert();

-- ---------------------------------------------------------------------------
-- Dog edits: log only when USER-editable columns change, so trigger-driven
-- denorm updates (feeding counters, last_seen, …) never spam the timeline.
-- ---------------------------------------------------------------------------
create or replace function public.trg_dogs_after_update()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_actor uuid := auth.uid();
begin
  if new.status is distinct from old.status then
    perform public.fn_log_activity(
      new.id, v_actor, 'status_changed', 'dogs', new.id::text,
      'Status changed to ' || new.status::text,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  elsif (new.name, new.description, new.gender, new.estimated_age_months,
         new.temperament, new.color_markings, new.has_puppies,
         new.health_status, new.medical_notes)
        is distinct from
        (old.name, old.description, old.gender, old.estimated_age_months,
         old.temperament, old.color_markings, old.has_puppies,
         old.health_status, old.medical_notes)
  then
    perform public.fn_log_activity(
      new.id, v_actor, 'dog_updated', 'dogs', new.id::text,
      'Profile details updated',
      jsonb_build_object('health_status', new.health_status)
    );
  end if;
  return new;
end;
$$;

create trigger trg_dogs_after_update
  after update on public.dogs
  for each row execute function public.trg_dogs_after_update();

-- ---------------------------------------------------------------------------
-- Photos: maintain the dog's primary photo denorm + keep a single is_primary.
-- ---------------------------------------------------------------------------
create or replace function public.trg_dog_photos_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_current_primary text;
begin
  select primary_photo_path into v_current_primary from public.dogs where id = new.dog_id;

  if new.is_primary or v_current_primary is null then
    update public.dog_photos
    set is_primary = false
    where dog_id = new.dog_id and id <> new.id and is_primary;

    update public.dog_photos set is_primary = true where id = new.id and not new.is_primary;

    update public.dogs
    set primary_photo_path = new.storage_path,
        primary_thumb_path = coalesce(new.thumb_path, new.storage_path)
    where id = new.dog_id;
  end if;

  perform public.fn_log_activity(
    new.dog_id, new.uploaded_by, 'photo_added', 'dog_photos', new.id::text,
    'Photo added',
    jsonb_build_object('storage_path', new.storage_path, 'thumb_path', new.thumb_path)
  );

  return new;
end;
$$;

create trigger trg_dog_photos_after_insert
  after insert on public.dog_photos
  for each row execute function public.trg_dog_photos_after_insert();

-- ---------------------------------------------------------------------------
-- Locations: every sighting refreshes the dog's denormalized position.
-- Only standalone sightings/manual moves get their own timeline entry —
-- feeding/medical/emergency parents already log theirs.
-- ---------------------------------------------------------------------------
create or replace function public.trg_dog_locations_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.dogs
  set location = new.location,
      last_seen_at = greatest(last_seen_at, new.created_at),
      last_seen_by = new.recorded_by
  where id = new.dog_id;

  if new.source in ('sighting', 'manual') then
    perform public.fn_log_activity(
      new.dog_id, new.recorded_by, 'location_updated', 'dog_locations', new.id::text,
      'Spotted at a new location',
      jsonb_build_object(
        'source', new.source,
        'lat', extensions.st_y(new.location::extensions.geometry),
        'lng', extensions.st_x(new.location::extensions.geometry),
        'note', new.note
      )
    );
  end if;

  return new;
end;
$$;

create trigger trg_dog_locations_after_insert
  after insert on public.dog_locations
  for each row execute function public.trg_dog_locations_after_insert();
