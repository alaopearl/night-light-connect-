update storage.buckets
set public = true
where id = 'night-light-img';

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
	and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "night-light-img admin updates"
on storage.objects for update to authenticated
using (
	bucket_id = 'night-light-img'
	and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
)
with check (
	bucket_id = 'night-light-img'
	and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);

create policy "night-light-img admin deletes"
on storage.objects for delete to authenticated
using (
	bucket_id = 'night-light-img'
	and (select auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);