create table if not exists public.site_data (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists site_data_updated_at_idx
  on public.site_data (updated_at desc);

alter table public.site_data enable row level security;

create policy "Allow public access to site data"
  on public.site_data
  for all
  using (true)
  with check (true);
