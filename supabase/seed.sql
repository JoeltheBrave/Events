-- Optional: run this in Supabase SQL Editor after migrations to add sample data

-- Sample venues (London)
insert into public.venues (name, slug, city, region) values
  ('O2 Arena', 'o2-arena', 'London', 'South East'),
  ('Roundhouse', 'roundhouse', 'London', 'South East'),
  ('Brixton Academy', 'brixton-academy', 'London', 'South East'),
  ('Manchester Arena', 'manchester-arena', 'Manchester', 'North'),
  ('Albert Hall Manchester', 'albert-hall-manchester', 'Manchester', 'North')
on conflict (slug, city) do nothing;

-- Sample artists
insert into public.artists (name, slug) values
  ('Arctic Monkeys', 'arctic-monkeys'),
  ('Dua Lipa', 'dua-lipa'),
  ('Romesh Ranganathan', 'romesh-ranganathan'),
  ('James Acaster', 'james-acaster')
on conflict (slug) do nothing;

-- Get category and venue IDs (run after the inserts above)
-- Then add events (replace UUIDs with actual IDs from your categories/venues if needed)
do $$
declare
  music_id uuid;
  comedy_id uuid;
  v1_id uuid;
  v2_id uuid;
  v3_id uuid;
  a1_id uuid;
  a2_id uuid;
  a3_id uuid;
  a4_id uuid;
begin
  select id into music_id from public.categories where slug = 'music' limit 1;
  select id into comedy_id from public.categories where slug = 'comedy' limit 1;
  select id into v1_id from public.venues where slug = 'o2-arena' and city = 'London' limit 1;
  select id into v2_id from public.venues where slug = 'roundhouse' and city = 'London' limit 1;
  select id into v3_id from public.venues where slug = 'brixton-academy' and city = 'London' limit 1;
  select id into a1_id from public.artists where slug = 'arctic-monkeys' limit 1;
  select id into a2_id from public.artists where slug = 'dua-lipa' limit 1;
  select id into a3_id from public.artists where slug = 'romesh-ranganathan' limit 1;
  select id into a4_id from public.artists where slug = 'james-acaster' limit 1;

  if music_id is not null and v1_id is not null and a1_id is not null then
    insert into public.events (title, slug, event_date, ticket_url, category_id, venue_id, on_sale_at)
    values
      ('Arctic Monkeys', 'arctic-monkeys-o2-mar-2026', now() + interval '30 days', 'https://example.com/tickets', music_id, v1_id, now() + interval '2 days'),
      ('Arctic Monkeys', 'arctic-monkeys-o2-mar-2026-night-2', now() + interval '31 days', 'https://example.com/tickets', music_id, v1_id, null);
    insert into public.event_artists (event_id, artist_id)
    select e.id, a1_id from public.events e where e.slug like 'arctic-monkeys-o2%';
  end if;

  if music_id is not null and v2_id is not null and a2_id is not null then
    insert into public.events (title, slug, event_date, ticket_url, category_id, venue_id)
    values
      ('Dua Lipa', 'dua-lipa-roundhouse-jun-2026', now() + interval '120 days', 'https://example.com/tickets', music_id, v2_id);
    insert into public.event_artists (event_id, artist_id)
    select e.id, a2_id from public.events e where e.slug = 'dua-lipa-roundhouse-jun-2026';
  end if;

  if comedy_id is not null and v2_id is not null and a3_id is not null then
    insert into public.events (title, slug, event_date, ticket_url, category_id, venue_id, on_sale_at)
    values
      ('Romesh Ranganathan', 'romesh-ranganathan-roundhouse-apr-2026', now() + interval '60 days', 'https://example.com/tickets', comedy_id, v2_id, now() + interval '5 days');
    insert into public.event_artists (event_id, artist_id)
    select e.id, a3_id from public.events e where e.slug = 'romesh-ranganathan-roundhouse-apr-2026';
  end if;

  if comedy_id is not null and v3_id is not null and a4_id is not null then
    insert into public.events (title, slug, event_date, ticket_url, category_id, venue_id)
    values
      ('James Acaster', 'james-acaster-brixton-may-2026', now() + interval '90 days', 'https://example.com/tickets', comedy_id, v3_id);
    insert into public.event_artists (event_id, artist_id)
    select e.id, a4_id from public.events e where e.slug = 'james-acaster-brixton-may-2026';
  end if;
end $$;
