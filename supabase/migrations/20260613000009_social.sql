-- ---------------------------------------------------------------------------
-- animal_follows (MVP) + community stubs (comments, upvotes, trust, reports).
-- Stub tables ship schema + RLS now; UI lands post-MVP.
-- ---------------------------------------------------------------------------
create table public.animal_follows (
  user_id uuid not null references public.profiles (id) on delete cascade,
  animal_id uuid not null references public.animals (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, animal_id)
);

create index animal_follows_animal_idx on public.animal_follows (animal_id);

create or replace function public.trg_animal_follows_count()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if tg_op = 'INSERT' then
    update public.animals set followers_count = followers_count + 1 where id = new.animal_id;
    return new;
  elsif tg_op = 'DELETE' then
    update public.animals set followers_count = greatest(followers_count - 1, 0) where id = old.animal_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger trg_animal_follows_count
  after insert or delete on public.animal_follows
  for each row execute function public.trg_animal_follows_count();

-- ---------------------------------------------------------------------------
-- comments (stub): full accounts only — anonymous sessions cannot comment.
-- ---------------------------------------------------------------------------
create table public.comments (
  id uuid primary key default gen_random_uuid(),
  animal_id uuid not null references public.animals (id) on delete cascade,
  user_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  parent_id uuid references public.comments (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 1000),
  deleted_at timestamptz,
  created_at timestamptz not null default now()
);

create index comments_animal_idx on public.comments (animal_id, created_at desc);

-- ---------------------------------------------------------------------------
-- upvotes (stub): polymorphic target (activity_logs / comments).
-- ---------------------------------------------------------------------------
create table public.upvotes (
  user_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('activity', 'comment')),
  target_id text not null,
  created_at timestamptz not null default now(),
  primary key (user_id, target_type, target_id)
);

create index upvotes_target_idx on public.upvotes (target_type, target_id);

-- ---------------------------------------------------------------------------
-- trust_events (stub): append-only point ledger; profiles.trust_score is the sum.
-- ---------------------------------------------------------------------------
create table public.trust_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  event_type text not null,
  points integer not null,
  ref jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index trust_events_user_idx on public.trust_events (user_id, id desc);

create or replace function public.trg_trust_events_sum()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  update public.profiles set trust_score = trust_score + new.points where id = new.user_id;
  return new;
end;
$$;

create trigger trg_trust_events_sum
  after insert on public.trust_events
  for each row execute function public.trg_trust_events_sum();

-- ---------------------------------------------------------------------------
-- content_reports (stub): report inaccurate/spam content for moderation.
-- ---------------------------------------------------------------------------
create table public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in ('animal', 'activity', 'comment', 'photo', 'emergency')),
  target_id text not null,
  reason public.report_reason not null,
  details text check (char_length(details) <= 1000),
  status public.report_status not null default 'pending',
  reviewed_by uuid references public.profiles (id),
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index content_reports_status_idx on public.content_reports (status, created_at desc);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.animal_follows enable row level security;
alter table public.comments enable row level security;
alter table public.upvotes enable row level security;
alter table public.trust_events enable row level security;
alter table public.content_reports enable row level security;

create policy "animal_follows_select_own" on public.animal_follows
  for select using (user_id = (select auth.uid()));
create policy "animal_follows_insert_own" on public.animal_follows
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "animal_follows_delete_own" on public.animal_follows
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "comments_select_public" on public.comments
  for select using (deleted_at is null or public.is_moderator());
-- Full accounts only: the is_anonymous JWT claim must be absent or false.
create policy "comments_insert_full_account" on public.comments
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
create policy "comments_update_own" on public.comments
  for update to authenticated
  using (user_id = (select auth.uid()) or public.is_moderator());

create policy "upvotes_select_public" on public.upvotes
  for select using (true);
create policy "upvotes_insert_full_account" on public.upvotes
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false
  );
create policy "upvotes_delete_own" on public.upvotes
  for delete to authenticated using (user_id = (select auth.uid()));

create policy "trust_events_select_own" on public.trust_events
  for select using (user_id = (select auth.uid()) or public.is_moderator());
revoke insert, update, delete on public.trust_events from anon, authenticated;

create policy "content_reports_select_own_or_mod" on public.content_reports
  for select using (reporter_id = (select auth.uid()) or public.is_moderator());
create policy "content_reports_insert_own" on public.content_reports
  for insert to authenticated with check (reporter_id = (select auth.uid()));
create policy "content_reports_update_mod" on public.content_reports
  for update to authenticated using (public.is_moderator());
