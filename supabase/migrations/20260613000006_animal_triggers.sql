-- Event triggers for dogs, animal_photos, animal_locations.
-- All SECURITY DEFINER: they write denormalized columns and activity_logs,
-- which clients have no grants for.

-- ---------------------------------------------------------------------------
-- New dog: log creation, bump author counter, record the initial location row,
-- and ping the fan-out function so nearby users learn about the new dog.
-- ---------------------------------------------------------------------------
create or replace function public.trg_animals_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.animal_locations (animal_id, location, source, recorded_by)
  values (new.id, new.location, 'initial', new.created_by);

  update public.profiles
  set animals_added_count = animals_added_count + 1
  where id = new.created_by;

  perform public.fn_log_activity(
    new.id, new.created_by, 'animal_created', 'animals', new.id::text,
    new.name || ' was added',
    jsonb_build_object('name', new.name)
  );

  perform public.fn_notify_fanout(jsonb_build_object(
    'type', 'new_animal_nearby',
    'animal_id', new.id,
    'name', new.name,
    'species', new.species,
    'lat', extensions.st_y(new.location::extensions.geometry),
    'lng', extensions.st_x(new.location::extensions.geometry),
    'created_by', new.created_by
  ));

  return new;
end;
$$;

create trigger trg_animals_after_insert
  after insert on public.animals
  for each row execute function public.trg_animals_after_insert();

-- ---------------------------------------------------------------------------
-- Dog edits: log only when USER-editable columns change, so trigger-driven
-- denorm updates (feeding counters, last_seen, …) never spam the timeline.
-- ---------------------------------------------------------------------------
create or replace function public.trg_animals_after_update()
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
      new.id, v_actor, 'status_changed', 'animals', new.id::text,
      'Status changed to ' || new.status::text,
      jsonb_build_object('from', old.status, 'to', new.status)
    );
  elsif (new.name, new.species, new.description, new.gender, new.estimated_age_months,
         new.temperament, new.color_markings, new.has_babies,
         new.health_status, new.medical_notes)
        is distinct from
        (old.name, old.species, old.description, old.gender, old.estimated_age_months,
         old.temperament, old.color_markings, old.has_babies,
         old.health_status, old.medical_notes)
  then
    perform public.fn_log_activity(
      new.id, v_actor, 'animal_updated', 'animals', new.id::text,
      'Profile details updated',
      jsonb_build_object('health_status', new.health_status)
    );
  end if;
  return new;
end;
$$;

create trigger trg_animals_after_update
  after update on public.animals
  for each row execute function public.trg_animals_after_update();

-- ---------------------------------------------------------------------------
-- Photos: maintain the dog's primary photo denorm + keep a single is_primary.
-- ---------------------------------------------------------------------------
create or replace function public.trg_animal_photos_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_current_primary text;
begin
  select primary_photo_path into v_current_primary from public.animals where id = new.animal_id;

  if new.is_primary or v_current_primary is null then
    update public.animal_photos
    set is_primary = false
    where animal_id = new.animal_id and id <> new.id and is_primary;

    update public.animal_photos set is_primary = true where id = new.id and not new.is_primary;

    update public.animals
    set primary_photo_path = new.storage_path,
        primary_thumb_path = coalesce(new.thumb_path, new.storage_path)
    where id = new.animal_id;
  end if;

  perform public.fn_log_activity(
    new.animal_id, new.uploaded_by, 'photo_added', 'animal_photos', new.id::text,
    'Photo added',
    jsonb_build_object('storage_path', new.storage_path, 'thumb_path', new.thumb_path)
  );

  return new;
end;
$$;

create trigger trg_animal_photos_after_insert
  after insert on public.animal_photos
  for each row execute function public.trg_animal_photos_after_insert();

-- ---------------------------------------------------------------------------
-- Locations: every sighting refreshes the dog's denormalized position.
-- Only standalone sightings/manual moves get their own timeline entry —
-- feeding/medical/emergency parents already log theirs.
-- ---------------------------------------------------------------------------
create or replace function public.trg_animal_locations_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.animals
  set location = new.location,
      last_seen_at = greatest(last_seen_at, new.created_at),
      last_seen_by = new.recorded_by
  where id = new.animal_id;

  if new.source in ('sighting', 'manual') then
    perform public.fn_log_activity(
      new.animal_id, new.recorded_by, 'location_updated', 'animal_locations', new.id::text,
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

create trigger trg_animal_locations_after_insert
  after insert on public.animal_locations
  for each row execute function public.trg_animal_locations_after_insert();
