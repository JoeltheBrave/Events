# Events — Your Own UK Live Guide

A clean, fast alternative to Ents24: discover **concerts, comedy, theatre, and shows** across the UK. No clutter, no “updates that ruined it”—just events, search, and tickets.

---

## What This Replaces (Ents24-style)

| Feature | Ents24 | This app |
|--------|--------|----------|
| Browse by category (music, comedy, theatre) | ✓ | ✓ |
| Browse by city/region | ✓ | ✓ |
| Artist/act pages + tour dates | ✓ | ✓ |
| Venue pages | ✓ | ✓ |
| “On sale soon” / new tickets | ✓ | ✓ |
| Search + filters | ✓ | ✓ |
| Ticket links (out to vendors) | ✓ | ✓ |
| Track artists/venues, get alerts | ✓ | Phase 2 |
| Staff picks / curated | ✓ | Phase 2 |
| Mobile app | GigAlert | Phase 2 (or PWA) |

---

## Tech Stack

- **Frontend:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Database:** Supabase (PostgreSQL) — events, artists, venues, categories
- **Auth (later):** Supabase Auth — for “track artist” and email alerts
- **Hosting:** Vercel (or similar) + Supabase Cloud

---

## Database (Supabase + Postgres)

The schema is designed for **Supabase** (Postgres) and follows Postgres best practices:

- **Migrations** (run in order in Supabase SQL Editor or via `supabase db push` if using Supabase CLI):
  1. `supabase/migrations/20250226000000_initial.sql` — tables, RLS, seed categories
  2. `supabase/migrations/20250226100000_postgres_supabase_best_practices.sql` — indexes, `created_at`, unique event slug

- **Design choices:** UUID primary keys (Supabase-friendly), TIMESTAMPTZ for timestamps, FK columns indexed, composite indexes for common filters, RLS with public read.

---

## Data Model (Core)

```
Categories    (music, comedy, theatre, etc.)
Artists       (name, slug, bio, image_url)
Venues        (name, slug, city, region, address)
Events        (title, slug, date, venue_id, category_id, ticket_url, on_sale_at, …)
EventArtists  (event_id, artist_id) — many-to-many
Regions/Cities — derived from venues or separate table
```

---

## Where Event Data Comes From

Ents24-style sites need a steady feed of events. Options:

1. **Manual / admin** — You (or a small team) add events via a simple admin. Good for MVP and niche focus.
2. **Ticketing APIs** — Ticketmaster, See Tickets, Eventbrite, etc. (API keys + rate limits; some have affiliate programmes.)
3. **Songkick API** — Concert data; free tier available.
4. **Scraping** — Legally and ethically risky; check ToS and copyright. Not recommended as primary source.
5. **User submissions** — “Add an event” form + moderation; good long-term for community feel.

**Recommendation:** Start with **manual/admin** plus one **API** (e.g. Songkick or Ticketmaster) so you have real data without legal grey areas.

---

## Project Structure (Scaffold)

```
/app
  /page.tsx              # Home: featured, on sale soon, by category
  /layout.tsx
  /events/                # List + search + filters
  /events/[slug]/         # Event detail
  /artists/               # Artist list
  /artists/[slug]/        # Artist tour dates
  /venues/                # Venue list
  /venues/[slug]/         # Venue events
  /whatson/[city]/        # By city (e.g. /whatson/london)
/components
  EventCard, ArtistCard, VenueCard, Search, Filters, …
/lib
  supabase.ts, types.ts
/supabase
  migrations/             # SQL for tables
```

---

## Phases

### Phase 1 — MVP (this scaffold)
- [ ] DB schema in Supabase (categories, artists, venues, events)
- [ ] Home page: hero, “on sale soon”, music/comedy/theatre strips
- [ ] Event list with search + filters (city, category, date range)
- [ ] Event detail page with ticket link
- [ ] Artist page (tour dates)
- [ ] Venue page (upcoming events)
- [ ] City/region browse (e.g. /whatson/london)
- [ ] Seed script or admin form to add a few test events

### Phase 2
- [ ] Auth (Supabase): sign up / sign in
- [ ] “Track” artist or venue → save to user profile
- [ ] Email alerts when new events match tracked artists/venues or go on sale
- [ ] Staff picks / featured section (admin toggle)
- [ ] RSS or calendar export

### Phase 3
- [ ] PWA or simple mobile layout
- [ ] Integrate one ticketing API for ongoing data
- [ ] Deals/presales section if you have data

---

## Run Locally

```bash
npm install
cp .env.example .env.local   # Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

Then in the [Supabase Dashboard](https://supabase.com/dashboard): create a project, go to SQL Editor, and run the contents of `supabase/migrations/20250226000000_initial.sql`. Optionally run `supabase/seed.sql` for sample data.

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Design Direction (So It Doesn’t “Feel Like Ents24 Now”)

- **Fast** — Minimal JS, server-rendered lists, quick filters.
- **Readable** — Clear typography, consistent spacing, no dense walls of links.
- **Obvious** — One primary action per card (e.g. “Tickets” or “See dates”).
- **URL-first** — Shareable `/events/…`, `/artists/…`, `/whatson/london`.
- **No dark patterns** — No fake urgency; “on sale Friday” only when it’s true.

You can tune the exact look (e.g. dark theme, compact vs. spacious) once the scaffold is running.
