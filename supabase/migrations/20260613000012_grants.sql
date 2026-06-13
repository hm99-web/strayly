-- Explicit table/function grants.
--
-- Newer Supabase stacks ship hardened default privileges: tables created in
-- migrations get NO select/insert/update/delete for anon/authenticated and
-- functions get no EXECUTE. Every privilege must be granted explicitly.
-- RLS narrows rows; column-level grants (03/04/05/08) narrow fields.

grant usage on schema public to anon, authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Public-readable tables (anonymous browsing is a core feature).
-- ---------------------------------------------------------------------------
grant select on
  public.profiles,
  public.dogs,
  public.dog_photos,
  public.dog_locations,
  public.feeding_records,
  public.vaccination_records,
  public.medical_records,
  public.emergency_reports,
  public.activity_logs,
  public.comments,
  public.upvotes
to anon, authenticated;

-- Own-data tables (RLS scopes to the owner).
grant select on
  public.user_settings,
  public.notifications,
  public.push_tokens,
  public.dog_follows,
  public.trust_events,
  public.content_reports
to authenticated;

-- ---------------------------------------------------------------------------
-- Writes. Note: dogs and profiles writes use COLUMN-level grants defined in
-- their own migrations (denormalized columns stay server-owned), and
-- notifications updates are limited to read_at, emergency updates to
-- lifecycle/detail columns — those grants already exist.
-- ---------------------------------------------------------------------------
grant insert, update on public.user_settings to authenticated;
grant insert, update, delete on public.dog_photos to authenticated;
grant insert on public.dog_locations to authenticated;
grant insert, update, delete on public.feeding_records to authenticated;
grant insert, update, delete on public.vaccination_records to authenticated;
grant insert, update, delete on public.medical_records to authenticated;
grant insert on public.emergency_reports to authenticated;
grant delete on public.notifications to authenticated;
grant insert, update, delete on public.push_tokens to authenticated;
grant insert, delete on public.dog_follows to authenticated;
grant insert, update on public.comments to authenticated;
grant insert, delete on public.upvotes to authenticated;
grant insert, update on public.content_reports to authenticated;

-- Service role (edge functions): unrestricted data access.
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;

-- ---------------------------------------------------------------------------
-- RPC execute. Grant broadly, then strip the service-only internals.
-- ---------------------------------------------------------------------------
grant execute on all functions in schema public to anon, authenticated, service_role;

revoke execute on function public.users_to_notify from anon, authenticated;
revoke execute on function public.followers_to_notify from anon, authenticated;
revoke execute on function public.fn_log_activity from anon, authenticated;
revoke execute on function public.fn_notify_fanout from anon, authenticated;
