update storage.buckets
set public = true
where id = 'night-light-img';

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'night-light-img',
  'night-light-img',
  true,
  10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public read access for night-light-img" on storage.objects;
drop policy if exists "Authenticated users can upload to night-light-img" on storage.objects;
drop policy if exists "Authenticated users can update their own night-light-img files" on storage.objects;
drop policy if exists "Authenticated users can delete night-light-img files" on storage.objects;
drop policy if exists "night-light-img admin uploads" on storage.objects;
drop policy if exists "night-light-img admin updates" on storage.objects;
drop policy if exists "night-light-img admin deletes" on storage.objects;

create policy "night-light-img admin uploads"
on storage.objects for insert to authenticated
with check (
	bucket_id = 'night-light-img'
	and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
);

create policy "night-light-img admin updates"
on storage.objects for update to authenticated
using (
	bucket_id = 'night-light-img'
	and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
)
with check (
	bucket_id = 'night-light-img'
	and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
);

create policy "night-light-img admin deletes"
on storage.objects for delete to authenticated
using (
	bucket_id = 'night-light-img'
	and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
);