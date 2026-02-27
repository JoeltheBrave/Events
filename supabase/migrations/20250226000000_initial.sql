-- Categories (music, comedy, theatre, etc.)
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique
);

-- Artists/acts
create table if not exists public.artists (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  image_url text
);

-- Venues
create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null,
  city text not null,
  region text not null,
  address text,
  unique (slug, city)
);

create index if not exists idx_venues_city on public.venues(city);
create index if not exists idx_venues_region on public.venues(region);

-- Events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null,
  event_date timestamptz not null,
  doors_at timestamptz,
  ticket_url text,
  on_sale_at timestamptz,
  category_id uuid not null references public.categories(id),
  venue_id uuid not null references public.venues(id),
  created_at timestamptz default now()
);

create index if not exists idx_events_date on public.events(event_date);
create index if not exists idx_events_category on public.events(category_id);
create index if not exists idx_events_venue on public.events(venue_id);
create index if not exists idx_events_on_sale on public.events(on_sale_at);

-- Event <-> Artists (many-to-many)
create table if not exists public.event_artists (
  event_id uuid not null references public.events(id) on delete cascade,
  artist_id uuid not null references public.artists(id) on delete cascade,
  primary key (event_id, artist_id)
);

-- Seed default categories
insert into public.categories (name, slug) values
  ('Music', 'music'),
  ('Comedy', 'comedy'),
  ('Theatre & Arts', 'theatre'),
  ('Family', 'family'),
  ('Other', 'other')
on conflict (slug) do nothing;

-- Enable RLS but allow anon read for now
alter table public.categories enable row level security;
alter table public.artists enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.event_artists enable row level security;

create policy "Allow public read on categories" on public.categories for select using (true);
create policy "Allow public read on artists" on public.artists for select using (true);
create policy "Allow public read on venues" on public.venues for select using (true);
create policy "Allow public read on events" on public.events for select using (true);
create policy "Allow public read on event_artists" on public.event_artists for select using (true);
