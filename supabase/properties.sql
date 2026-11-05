create table if not exists public.properties (
  id text primary key,
  value jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.properties enable row level security;
alter table public.properties replica identity full;

revoke all on public.properties from anon, authenticated;
grant select on public.properties to anon, authenticated;
grant insert, update, delete on public.properties to authenticated;

drop policy if exists "Public can read published properties" on public.properties;
create policy "Public can read published properties"
  on public.properties
  for select
  to anon, authenticated
  using (
    coalesce((value ->> 'published')::boolean, true)
    and coalesce((value ->> 'demo')::boolean, false) = false
  );

drop policy if exists "Admins manage properties" on public.properties;
create policy "Admins manage properties"
  on public.properties
  for all
  to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'));

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'properties'
  ) then
    execute 'alter publication supabase_realtime add table public.properties';
  end if;
end;
$$;

create index if not exists properties_updated_at_idx
  on public.properties (updated_at desc);

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
create policy "Public read access for night-light-img"
  on storage.objects
  for select
  to public
  using (bucket_id = 'night-light-img');

drop policy if exists "night-light-img admin uploads" on storage.objects;
create policy "night-light-img admin uploads"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'night-light-img'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
  );

drop policy if exists "night-light-img admin updates" on storage.objects;
create policy "night-light-img admin updates"
  on storage.objects
  for update
  to authenticated
  using (
    bucket_id = 'night-light-img'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
  )
  with check (
    bucket_id = 'night-light-img'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
  );

drop policy if exists "night-light-img admin deletes" on storage.objects;
create policy "night-light-img admin deletes"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'night-light-img'
    and (select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin')
  );
