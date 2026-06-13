-- ---------------------------------------------------------------------------
-- emergency_reports: animal_id nullable — emergencies can be reported for dogs
-- not yet in the system.
-- ---------------------------------------------------------------------------
create table public.emergency_reports (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid references public.animals (id) on delete set null,
  reported_by uuid not null default auth.uid() references public.profiles (id),
  emergency_type public.emergency_type not null,
  severity public.severity_level not null,
  description text check (char_length(description) <= 2000),
  photo_paths text[] not null default '{}',
  location extensions.geography (point, 4326) not null,
  address_text text,
  status public.emergency_status not null default 'open',
  resolved_by uuid references public.profiles (id),
  resolved_at timestamptz,
  resolution_notes text check (char_length(resolution_notes) <= 1000),
  notified_count integer not null default 0,
  created_at timestamptz not null default now()
);

create index emergency_reports_gist on public.emergency_reports using gist (location);
create index emergency_reports_status_idx on public.emergency_reports (status, created_at desc);
create index emergency_reports_animal_idx on public.emergency_reports (animal_id) where animal_id is not null;

-- ---------------------------------------------------------------------------
-- New emergency: flag the dog, log it, fan out push to nearby users.
-- ---------------------------------------------------------------------------
create or replace function public.trg_emergency_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.animal_id is not null then
    update public.animals
    set has_active_emergency = true,
        health_status = case
          when new.emergency_type in ('injury', 'accident') then 'injured'::public.animal_health_status
          when new.emergency_type = 'illness' then 'sick'::public.animal_health_status
          else health_status
        end,
        status = case
          when new.emergency_type = 'missing' then 'missing'::public.animal_status
          else status
        end
    where id = new.animal_id;

    perform public.fn_log_activity(
      new.animal_id, new.reported_by, 'emergency_created', 'emergency_reports', new.id::text,
      initcap(replace(new.emergency_type::text, '_', ' ')) || ' emergency reported (' || new.severity::text || ')',
      jsonb_build_object(
        'emergency_id', new.id,
        'emergency_type', new.emergency_type,
        'severity', new.severity,
        'photo_paths', new.photo_paths
      )
    );
  end if;

  perform public.fn_notify_fanout(jsonb_build_object(
    'type', 'emergency_created',
    'emergency_id', new.id,
    'animal_id', new.animal_id,
    'emergency_type', new.emergency_type,
    'severity', new.severity,
    'lat', extensions.st_y(new.location::extensions.geometry),
    'lng', extensions.st_x(new.location::extensions.geometry),
    'reported_by', new.reported_by
  ));

  return new;
end;
$$;

create trigger trg_emergency_after_insert
  after insert on public.emergency_reports
  for each row execute function public.trg_emergency_after_insert();

-- ---------------------------------------------------------------------------
-- Resolution: clear the dog's flag when its last open report closes.
-- ---------------------------------------------------------------------------
create or replace function public.trg_emergency_after_update()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if old.status in ('open', 'in_progress') and new.status in ('resolved', 'false_alarm') then
    if new.animal_id is not null then
      if not exists (
        select 1 from public.emergency_reports
        where animal_id = new.animal_id and status in ('open', 'in_progress') and id <> new.id
      ) then
        update public.animals set has_active_emergency = false where id = new.animal_id;
      end if;

      perform public.fn_log_activity(
        new.animal_id, coalesce(new.resolved_by, auth.uid()), 'emergency_resolved',
        'emergency_reports', new.id::text,
        'Emergency marked ' || replace(new.status::text, '_', ' '),
        jsonb_build_object('emergency_id', new.id, 'resolution_notes', new.resolution_notes)
      );
    end if;
  end if;
  return new;
end;
$$;

create trigger trg_emergency_after_update
  after update on public.emergency_reports
  for each row execute function public.trg_emergency_after_update();

-- ---------------------------------------------------------------------------
-- RLS: public read; authenticated report; any authenticated user can move an
-- emergency through its lifecycle (community rescue model); reporter or
-- moderator can edit details.
-- ---------------------------------------------------------------------------
alter table public.emergency_reports enable row level security;

create policy "emergencies_select_public" on public.emergency_reports
  for select using (true);
create policy "emergencies_insert_own" on public.emergency_reports
  for insert to authenticated with check (reported_by = (select auth.uid()));
create policy "emergencies_update_authenticated" on public.emergency_reports
  for update to authenticated using (true);

-- Clients can update only lifecycle + detail columns; notified_count is server-owned.
revoke update, delete on public.emergency_reports from anon, authenticated;
grant update (emergency_type, severity, description, photo_paths, address_text,
              status, resolved_by, resolved_at, resolution_notes, animal_id)
  on public.emergency_reports to authenticated;
