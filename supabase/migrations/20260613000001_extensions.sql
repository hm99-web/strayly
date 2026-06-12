-- Extensions. PostGIS lives in the `extensions` schema (Supabase convention);
-- function bodies that touch geography MUST set search_path = public, extensions.
create extension if not exists postgis with schema extensions;
create extension if not exists citext with schema extensions;
create extension if not exists pg_trgm with schema extensions;
-- pg_net manages its own `net` schema; used to call the push-fanout edge function.
create extension if not exists pg_net;
