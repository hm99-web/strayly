-- Storage buckets. Public read (images served via public URL / CDN);
-- writes scoped per bucket. 5 MB cap, images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/webp']),
  ('dog-media', 'dog-media', true, 5242880, array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do nothing;

-- avatars: path convention {user_id}/avatar.jpg — first folder must be the uploader.
create policy "avatars_select_public" on storage.objects
  for select using (bucket_id = 'avatars');
create policy "avatars_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_update_own_folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "avatars_delete_own_folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = (select auth.uid())::text);

-- dog-media: path convention {dog_id}/{photos|feedings|medical|vaccinations}/{uuid}.jpg
-- Any authenticated user may contribute; only the uploader (or moderator) may replace/remove.
create policy "dog_media_select_public" on storage.objects
  for select using (bucket_id = 'dog-media');
create policy "dog_media_insert_authenticated" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'dog-media');
create policy "dog_media_update_owner" on storage.objects
  for update to authenticated
  using (bucket_id = 'dog-media' and (owner_id = (select auth.uid())::text or public.is_moderator()));
create policy "dog_media_delete_owner" on storage.objects
  for delete to authenticated
  using (bucket_id = 'dog-media' and (owner_id = (select auth.uid())::text or public.is_moderator()));
