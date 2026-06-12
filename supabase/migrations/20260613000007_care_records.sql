-- ---------------------------------------------------------------------------
-- feeding_records: high volume → bigint identity.
-- ---------------------------------------------------------------------------
create table public.feeding_records (
  id bigint generated always as identity primary key,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  fed_by uuid not null default auth.uid() references public.profiles (id),
  food_type public.food_type not null,
  food_type_other text check (char_length(food_type_other) <= 100),
  notes text check (char_length(notes) <= 500),
  photo_path text,
  location extensions.geography (point, 4326),
  fed_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (fed_at <= now() + interval '5 minutes')
);

create index feeding_records_dog_idx on public.feeding_records (dog_id, fed_at desc);
create index feeding_records_user_idx on public.feeding_records (fed_by, fed_at desc);

create or replace function public.trg_feeding_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.dogs
  set last_fed_at = greatest(coalesce(last_fed_at, '-infinity'::timestamptz), new.fed_at),
      last_fed_by = new.fed_by,
      feedings_count = feedings_count + 1
  where id = new.dog_id;

  update public.profiles
  set feedings_count = feedings_count + 1
  where id = new.fed_by;

  if new.location is not null then
    insert into public.dog_locations (dog_id, location, source, recorded_by)
    values (new.dog_id, new.location, 'feeding', new.fed_by);
  end if;

  perform public.fn_log_activity(
    new.dog_id, new.fed_by, 'fed', 'feeding_records', new.id::text,
    'Fed (' || replace(new.food_type::text, '_', ' ') || ')',
    jsonb_build_object(
      'food_type', new.food_type,
      'food_type_other', new.food_type_other,
      'notes', new.notes,
      'photo_path', new.photo_path,
      'fed_at', new.fed_at
    )
  );

  return new;
end;
$$;

create trigger trg_feeding_after_insert
  after insert on public.feeding_records
  for each row execute function public.trg_feeding_after_insert();

-- ---------------------------------------------------------------------------
-- vaccination_records
-- ---------------------------------------------------------------------------
create table public.vaccination_records (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs (id) on delete cascade,
  vaccine_type public.vaccine_type not null,
  vaccine_name text check (char_length(vaccine_name) <= 120),
  administered_at date not null,
  next_due_at date,
  administered_by_text text check (char_length(administered_by_text) <= 200),
  batch_number text,
  proof_photo_path text,
  notes text check (char_length(notes) <= 500),
  recorded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create index vaccination_records_dog_idx on public.vaccination_records (dog_id, administered_at desc);
-- Powers the post-MVP "vaccination due" reminder cron:
create index vaccination_records_due_idx on public.vaccination_records (next_due_at)
  where next_due_at is not null;

create or replace function public.trg_vaccination_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.dogs set vaccination_status = 'yes' where id = new.dog_id;

  perform public.fn_log_activity(
    new.dog_id, new.recorded_by, 'vaccination', 'vaccination_records', new.id::text,
    initcap(new.vaccine_type::text) || ' vaccination recorded',
    jsonb_build_object(
      'vaccine_type', new.vaccine_type,
      'vaccine_name', new.vaccine_name,
      'administered_at', new.administered_at,
      'next_due_at', new.next_due_at,
      'proof_photo_path', new.proof_photo_path
    )
  );

  return new;
end;
$$;

create trigger trg_vaccination_after_insert
  after insert on public.vaccination_records
  for each row execute function public.trg_vaccination_after_insert();

-- ---------------------------------------------------------------------------
-- medical_records: treatments AND sterilization (one table keeps the timeline simple).
-- ---------------------------------------------------------------------------
create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  dog_id uuid not null references public.dogs (id) on delete cascade,
  record_type public.medical_record_type not null,
  title text not null check (char_length(title) between 1 and 150),
  description text check (char_length(description) <= 2000),
  observed_health_status public.dog_health_status,
  severity public.severity_level,
  photo_paths text[] not null default '{}',
  treated_by_text text check (char_length(treated_by_text) <= 200),
  performed_at timestamptz not null default now(),
  next_followup_at date,
  recorded_by uuid not null default auth.uid() references public.profiles (id),
  created_at timestamptz not null default now()
);

create index medical_records_dog_idx on public.medical_records (dog_id, performed_at desc);

create or replace function public.trg_medical_after_insert()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.observed_health_status is not null then
    update public.dogs set health_status = new.observed_health_status where id = new.dog_id;
  end if;

  if new.record_type = 'sterilization' then
    update public.dogs
    set sterilization_status = 'yes',
        sterilized_at = new.performed_at::date
    where id = new.dog_id;
  end if;

  perform public.fn_log_activity(
    new.dog_id, new.recorded_by,
    case when new.record_type = 'sterilization' then 'sterilization'::public.activity_type
         else 'medical'::public.activity_type end,
    'medical_records', new.id::text,
    new.title,
    jsonb_build_object(
      'record_type', new.record_type,
      'observed_health_status', new.observed_health_status,
      'severity', new.severity,
      'photo_paths', new.photo_paths
    )
  );

  return new;
end;
$$;

create trigger trg_medical_after_insert
  after insert on public.medical_records
  for each row execute function public.trg_medical_after_insert();

-- ---------------------------------------------------------------------------
-- RLS: public read; authenticated insert as self; author edit within 24h or moderator.
-- ---------------------------------------------------------------------------
alter table public.feeding_records enable row level security;
alter table public.vaccination_records enable row level security;
alter table public.medical_records enable row level security;

create policy "feeding_select_public" on public.feeding_records
  for select using (true);
create policy "feeding_insert_own" on public.feeding_records
  for insert to authenticated with check (fed_by = (select auth.uid()));
create policy "feeding_update_own_24h" on public.feeding_records
  for update to authenticated
  using ((fed_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());
create policy "feeding_delete_own_24h" on public.feeding_records
  for delete to authenticated
  using ((fed_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());

create policy "vaccination_select_public" on public.vaccination_records
  for select using (true);
create policy "vaccination_insert_own" on public.vaccination_records
  for insert to authenticated with check (recorded_by = (select auth.uid()));
create policy "vaccination_update_own_24h" on public.vaccination_records
  for update to authenticated
  using ((recorded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());
create policy "vaccination_delete_own_24h" on public.vaccination_records
  for delete to authenticated
  using ((recorded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());

create policy "medical_select_public" on public.medical_records
  for select using (true);
create policy "medical_insert_own" on public.medical_records
  for insert to authenticated with check (recorded_by = (select auth.uid()));
create policy "medical_update_own_24h" on public.medical_records
  for update to authenticated
  using ((recorded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());
create policy "medical_delete_own_24h" on public.medical_records
  for delete to authenticated
  using ((recorded_by = (select auth.uid()) and created_at > now() - interval '24 hours') or public.is_moderator());
