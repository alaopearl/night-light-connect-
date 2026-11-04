create table if not exists public.site_data (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists site_data_updated_at_idx
  on public.site_data (updated_at desc);

alter table public.site_data enable row level security;
grant select on public.site_data to anon, authenticated;
grant insert, update, delete on public.site_data to authenticated;
alter table public.site_data replica identity full;

drop policy if exists "Allow public access to site data" on public.site_data;
drop policy if exists "Public can read property catalog data" on public.site_data;
drop policy if exists "Authenticated admins manage site data" on public.site_data;
create policy "Public can read property catalog data"
  on public.site_data
  for select
  to anon
  using (key in ('nlc_custom_properties', 'nlc_deleted_properties'));

create policy "Authenticated admins manage site data"
  on public.site_data
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
      and tablename = 'site_data'
  ) then
    execute 'alter publication supabase_realtime add table public.site_data';
  end if;
end;
$$;

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

create index if not exists properties_updated_at_idx
  on public.properties (updated_at desc);

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

create table if not exists public.site_leads (
  id text primary key,
  value jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.site_inspections (
  id text primary key,
  value jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists site_leads_created_at_idx on public.site_leads (created_at desc);
create index if not exists site_inspections_created_at_idx on public.site_inspections (created_at desc);

alter table public.site_leads enable row level security;
alter table public.site_inspections enable row level security;
grant insert on public.site_leads, public.site_inspections to anon, authenticated;
grant select, delete on public.site_leads, public.site_inspections to authenticated;

drop policy if exists "Public can submit leads" on public.site_leads;
drop policy if exists "Admins manage leads" on public.site_leads;
create policy "Public can submit leads"
  on public.site_leads for insert to anon, authenticated
  with check (true);
create policy "Admins manage leads"
  on public.site_leads for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'));

drop policy if exists "Public can submit inspections" on public.site_inspections;
drop policy if exists "Admins manage inspections" on public.site_inspections;
create policy "Public can submit inspections"
  on public.site_inspections for insert to anon, authenticated
  with check (true);
create policy "Admins manage inspections"
  on public.site_inspections for all to authenticated
  using ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'))
  with check ((select auth.jwt() -> 'app_metadata' ->> 'role') in ('admin', 'super_admin'));

do $$
declare
  table_name text;
begin
  foreach table_name in array array['site_leads', 'site_inspections'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime'
        and schemaname = 'public'
        and tablename = table_name
    ) then
      execute format('alter publication supabase_realtime add table public.%I', table_name);
    end if;
  end loop;
end;
$$;
