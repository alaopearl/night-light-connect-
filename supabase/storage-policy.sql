create policy "Public read access for night-light-img"
on storage.objects for select
using (bucket_id = 'night-light-img');

create policy "Authenticated users can upload to night-light-img"
on storage.objects for insert
with check (
  bucket_id = 'night-light-img' and auth.role() = 'authenticated'
);

create policy "Authenticated users can update their own night-light-img files"
on storage.objects for update
using (
  bucket_id = 'night-light-img' and auth.role() = 'authenticated'
)
with check (
  bucket_id = 'night-light-img' and auth.role() = 'authenticated'
);

create policy "Authenticated users can delete night-light-img files"
on storage.objects for delete
using (
  bucket_id = 'night-light-img' and auth.role() = 'authenticated'
);