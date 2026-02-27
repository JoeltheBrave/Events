-- Postgres best practices for Supabase
-- Ref: schema design (FK indexes, naming, NOT NULL, created_at), indexing (composite, FK indexes)

-- 1. created_at on all tables (audit + ordering)
alter table public.categories
  add column if not exists created_at timestamptz not null default now();
alter table public.artists
  add column if not exists created_at timestamptz not null default now();
alter table public.venues
  add column if not exists created_at timestamptz not null default now();

-- 2. Unique event slug (app uses slug for lookups; prevents duplicate URLs)
-- If you have duplicate slugs, fix first: update events set slug = slug || '-' || id where id in (...)
create unique index if not exists events_slug_key on public.events (slug);

-- 3. Index FK on event_artists(artist_id) — "events by artist" queries (Postgres does not auto-index FK)
create index if not exists event_artists_artist_id_idx on public.event_artists (artist_id);

-- 4. Composite indexes for common filters + sort (equality first, then range/order)
-- getEvents(category, from) → WHERE category_id = ? AND event_date >= ? ORDER BY event_date
create index if not exists events_category_id_event_date_idx
  on public.events (category_id, event_date);
-- getEvents(city via venue_id), getVenueEvents → WHERE venue_id = ? AND event_date >= ? ORDER BY event_date
create index if not exists events_venue_id_event_date_idx
  on public.events (venue_id, event_date);
-- getOnSaleSoon → WHERE event_date >= ? AND on_sale_at BETWEEN ? AND ? ORDER BY on_sale_at
create index if not exists events_on_sale_at_event_date_idx
  on public.events (on_sale_at, event_date)
  where on_sale_at is not null;

-- 5. Venue lookups by city (existing idx_venues_city) — add composite for (region, city) if we browse by region
create index if not exists venues_region_city_idx on public.venues (region, city);

-- 6. Explicit constraint names for categories slug (optional; unique already has an index)
-- No change needed; unique (slug) already creates index categories_slug_key.
