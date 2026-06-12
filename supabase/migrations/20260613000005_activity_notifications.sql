-- ---------------------------------------------------------------------------
-- activity_logs: the single merged timeline source (designed for millions of
-- rows). `id` is the keyset cursor. Written ONLY by SECURITY DEFINER trigger
-- functions — clients have no insert grant. `metadata` carries enough to
-- render a timeline item without joins.
-- Scale escape hatch (documented, not yet needed): monthly partitioning via
-- pg_partman once rows approach ~10M.
-- ---------------------------------------------------------------------------
create table public.activity_logs (
  id bigint generated always as identity primary key,
  dog_id uuid not null references public.dogs (id) on delete cascade,
  actor_id uuid references public.profiles (id),
  activity_type public.activity_type not null,
  ref_table text,
  ref_id text,
  summary text,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index activity_logs_dog_idx on public.activity_logs (dog_id, id desc);
create index activity_logs_actor_idx on public.activity_logs (actor_id, id desc);
create index activity_logs_created_brin on public.activity_logs using brin (created_at);

-- ---------------------------------------------------------------------------
-- notifications: per-user inbox; INSERTed by the service role / triggers only.
-- ---------------------------------------------------------------------------
create table public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  body text,
  data jsonb not null default '{}',
  read_at timestamptz,
  push_sent boolean not null default false,
  created_at timestamptz not null default now()
);

create index notifications_user_idx on public.notifications (user_id, id desc);
create index notifications_unread_idx on public.notifications (user_id) where read_at is null;

-- Live inbox: stream INSERTs to the owning user.
alter publication supabase_realtime add table public.notifications;

-- ---------------------------------------------------------------------------
-- push_tokens: Expo push token per device.
-- ---------------------------------------------------------------------------
create table public.push_tokens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  expo_push_token text not null,
  platform public.device_platform not null,
  device_name text,
  last_active_at timestamptz not null default now(),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, expo_push_token)
);

create index push_tokens_user_idx on public.push_tokens (user_id) where revoked_at is null;

-- ---------------------------------------------------------------------------
-- Helpers shared by all event triggers.
-- ---------------------------------------------------------------------------
create or replace function public.fn_log_activity(
  p_dog_id uuid,
  p_actor_id uuid,
  p_type public.activity_type,
  p_ref_table text,
  p_ref_id text,
  p_summary text,
  p_metadata jsonb default '{}'
)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  insert into public.activity_logs (dog_id, actor_id, activity_type, ref_table, ref_id, summary, metadata)
  values (p_dog_id, p_actor_id, p_type, p_ref_table, p_ref_id, p_summary, coalesce(p_metadata, '{}'));
end;
$$;

revoke execute on function public.fn_log_activity from public, anon, authenticated;

-- Fire-and-forget webhook to the push-fanout edge function via pg_net.
-- URL + service key live in Vault so the same trigger works locally and hosted.
-- Never fails the originating write: missing secrets / pg_net errors are swallowed.
create or replace function public.fn_notify_fanout(p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_url text;
  v_key text;
begin
  select decrypted_secret into v_url from vault.decrypted_secrets where name = 'push_fanout_url';
  select decrypted_secret into v_key from vault.decrypted_secrets where name = 'push_fanout_key';
  if v_url is null or v_key is null then
    return;
  end if;
  perform net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_key
    ),
    body := p_payload
  );
exception
  when others then null;
end;
$$;

revoke execute on function public.fn_notify_fanout from public, anon, authenticated;

-- Followed-dog fan-out: any meaningful activity on a followed dog pings the
-- edge function (which resolves followers + prefs server-side).
create or replace function public.trg_activity_followed_fanout()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
begin
  if new.activity_type in ('fed', 'medical', 'vaccination', 'sterilization', 'emergency_created', 'status_changed')
     and exists (select 1 from public.dogs d where d.id = new.dog_id and d.followers_count > 0)
  then
    perform public.fn_notify_fanout(jsonb_build_object(
      'type', 'followed_dog_update',
      'dog_id', new.dog_id,
      'activity_id', new.id,
      'activity_type', new.activity_type,
      'actor_id', new.actor_id,
      'summary', new.summary
    ));
  end if;
  return new;
end;
$$;

create trigger trg_activity_followed_fanout
  after insert on public.activity_logs
  for each row execute function public.trg_activity_followed_fanout();

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
alter table public.activity_logs enable row level security;
alter table public.notifications enable row level security;
alter table public.push_tokens enable row level security;

create policy "activity_logs_select_public" on public.activity_logs
  for select using (true);
revoke insert, update, delete on public.activity_logs from anon, authenticated;

create policy "notifications_select_own" on public.notifications
  for select using (user_id = (select auth.uid()));
create policy "notifications_update_own" on public.notifications
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "notifications_delete_own" on public.notifications
  for delete using (user_id = (select auth.uid()));

-- Clients may only flip read_at; inserts come from the service role.
revoke insert, update on public.notifications from anon, authenticated;
grant update (read_at) on public.notifications to authenticated;

create policy "push_tokens_select_own" on public.push_tokens
  for select using (user_id = (select auth.uid()));
create policy "push_tokens_insert_own" on public.push_tokens
  for insert with check (user_id = (select auth.uid()));
create policy "push_tokens_update_own" on public.push_tokens
  for update using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "push_tokens_delete_own" on public.push_tokens
  for delete using (user_id = (select auth.uid()));
