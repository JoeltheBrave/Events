# Event Provider Sync — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-pull events from Eventbrite (and later See Tickets, Ents24) via official APIs on an hourly cron; merge duplicates into one event row with multiple ticket links.

**Architecture:** One cron API route calls a sync orchestrator; orchestrator runs provider adapters (fetch + normalize only), then for each normalized event computes a canonical key, finds or creates the event in Supabase, and upserts `event_sources`. Adapters are stateless; DB writes happen only in the orchestrator.

**Tech Stack:** Next.js API route, Supabase (Postgres), Node fetch for provider APIs. Env: `CRON_SECRET`, `EVENTBRITE_TOKEN` (and later `SEETICKETS_*`, `ENTS24_*`).

---

## Task 1: Database migration for `event_sources`

**Files:**
- Create: `supabase/migrations/20250226200000_event_sources.sql`

**Step 1: Add migration file**

Create the file with:

```sql
-- event_sources: one row per (event, provider) for multiple ticket links
create table if not exists public.event_sources (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  provider text not null,
  provider_uid text,
  ticket_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (event_id, provider)
);

create index event_sources_event_id_idx on public.event_sources(event_id);
create index event_sources_provider_uid_idx on public.event_sources(provider, provider_uid);

alter table public.event_sources enable row level security;
create policy "Allow public read on event_sources" on public.event_sources for select using (true);
```

**Step 2: Run migration**

Run the SQL in Supabase Dashboard → SQL Editor (or `supabase db push` if using CLI). Confirm table `event_sources` exists.

**Step 3: Commit**

```bash
git add supabase/migrations/20250226200000_event_sources.sql
git commit -m "db: add event_sources table for multi-provider ticket links"
```

---

## Task 2: Types and canonical key helper

**Files:**
- Create: `lib/sync/types.ts`
- Modify: `lib/types.ts` (add optional `sources` to event type if needed for UI later)

**Step 1: Add normalized event and provider types**

In `lib/sync/types.ts`:

```ts
export type ProviderSlug = "eventbrite" | "seetickets" | "ents24";

export interface NormalizedEvent {
  artistNames: string[];
  venueName: string;
  venueCity: string;
  venueRegion: string;
  eventDate: string; // ISO
  doorsAt?: string | null;
  onSaleAt?: string | null;
  ticketUrl: string | null;
  provider: ProviderSlug;
  providerUid: string;
  title?: string;
}
```

**Step 2: Add canonical key function**

In the same file, add:

```ts
export function canonicalKey(e: NormalizedEvent): string {
  const artists = e.artistNames.slice().sort().join("|").toLowerCase().trim();
  const venue = [e.venueName, e.venueCity].map((s) => s.toLowerCase().trim()).join("|");
  const date = e.eventDate.slice(0, 10);
  return [artists, venue, date].join("::");
}
```

**Step 3: Commit**

```bash
git add lib/sync/types.ts
git commit -m "feat(sync): add NormalizedEvent type and canonicalKey helper"
```

---

## Task 3: Eventbrite adapter (fetch + normalize) with unit test

**Files:**
- Create: `lib/sync/adapters/eventbrite.ts`
- Create: `lib/sync/adapters/__tests__/eventbrite.test.ts` (or `eventbrite.spec.ts` depending on test runner)

**Step 1: Write failing test**

In `lib/sync/adapters/__tests__/eventbrite.test.ts` (use Jest or Vitest; assume Vitest for Next):

```ts
import { describe, it, expect, vi } from "vitest";
import { fetchAndNormalize } from "../eventbrite";

describe("Eventbrite adapter", () => {
  it("normalizes a sample API response to NormalizedEvent shape", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        events: [{
          id: "123",
          name: { text: "Test Gig" },
          start: { utc: "2026-06-01T19:00:00Z" },
          venue: { name: "The Venue", address: { city: "London", region: "Greater London" } },
          url: "https://eventbrite.com/e/123",
        }],
        pagination: { has_more_items: false },
      }),
    }));

    const result = await fetchAndNormalize("token", { maxPages: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].providerUid).toBe("123");
    expect(result[0].provider).toBe("eventbrite");
    expect(result[0].venueCity).toBe("London");
    expect(result[0].eventDate).toContain("2026-06-01");
  });
});
```

**Step 2: Run test to verify it fails**

Run: `npx vitest run lib/sync/adapters/__tests__/eventbrite.test.ts`  
Expected: FAIL (e.g. fetchAndNormalize not defined or module not found).

**Step 3: Implement minimal Eventbrite adapter**

Create `lib/sync/adapters/eventbrite.ts`:

- Function `fetchAndNormalize(token: string, options?: { maxPages?: number }): Promise<NormalizedEvent[]>`.
- Call Eventbrite API (e.g. `https://www.eventbriteapi.com/v3/organizations/{org_id}/events/` or events/search; use their documented endpoint), pass token in `Authorization: Bearer <token>`.
- Paginate until no more or maxPages.
- Map each raw event to `NormalizedEvent`: artistNames from event name or performers if available, venue from venue object, eventDate from start.utc, ticketUrl from url, provider `"eventbrite"`, providerUid from id.
- Return array of NormalizedEvent.

(Use actual Eventbrite API docs for exact field names; this is the minimal shape.)

**Step 4: Run test to verify it passes**

Run: `npx vitest run lib/sync/adapters/__tests__/eventbrite.test.ts`  
Expected: PASS.

**Step 5: Commit**

```bash
git add lib/sync/adapters/eventbrite.ts lib/sync/adapters/__tests__/eventbrite.test.ts
git commit -m "feat(sync): add Eventbrite adapter with unit test"
```

---

## Task 4: Match-or-create and upsert event_sources (orchestrator core)

**Files:**
- Create: `lib/sync/orchestrator.ts`
- Modify: `lib/data.ts` (add function to find event by canonical key if not exists)

**Step 1: Add findEventByCanonicalKey in data layer**

In `lib/data.ts` add:

- `findEventByCanonicalKey(key: string): Promise<Event | null>`: query events (e.g. with a stored `canonical_key` column, or by joining artists/venues and computing key in app). Simplest: add column `canonical_key text unique` to `events` and set it on insert; then `supabase.from("events").select("id").eq("canonical_key", key).maybeSingle()`.

So first add migration to add `canonical_key` to events (or implement lookup by matching venue + date + artists). Design doc said "lookup by canonical key" — add `events.canonical_key` in a small migration for Task 4.

**Step 1b: Migration for canonical_key**

Create `supabase/migrations/20250226210000_events_canonical_key.sql`:

```sql
alter table public.events add column if not exists canonical_key text;
create unique index if not exists events_canonical_key_key on public.events(canonical_key) where canonical_key is not null;
```

**Step 2: Implement upsertEventAndSource in orchestrator**

In `lib/sync/orchestrator.ts`:

- `upsertEventAndSource(normalized: NormalizedEvent): Promise<void>`:
  - Compute `key = canonicalKey(normalized)`.
  - Find event by canonical_key. If found: upsert `event_sources` (event_id, provider, ticket_url, provider_uid). If not: create venue (or get existing by name+city), create artists (or get existing by name), create event with canonical_key, link event_artists, insert event_sources.
- Use Supabase client (server-side: create from env in orchestrator or accept injected client).

**Step 3: Write failing test for match-or-create**

Test: given normalized event, first call creates event + source; second call with same canonical key only adds/updates event_sources (same event_id). Use in-memory or test DB if available; or skip and rely on integration test later.

**Step 4: Commit**

```bash
git add supabase/migrations/20250226210000_events_canonical_key.sql lib/data.ts lib/sync/orchestrator.ts
git commit -m "feat(sync): add canonical_key and orchestrator upsertEventAndSource"
```

---

## Task 5: Sync run entrypoint and cron route

**Files:**
- Create: `app/api/cron/sync-events/route.ts`
- Modify: `lib/sync/orchestrator.ts` (add `runSync(): Promise<{ eventbrite: string; seetickets: string; ents24: string }>`)

**Step 1: Implement runSync in orchestrator**

- `runSync()`: Check env for `EVENTBRITE_TOKEN`. If set, call Eventbrite adapter `fetchAndNormalize`, then for each normalized event call `upsertEventAndSource`. Catch errors, log, set result.eventbrite = "ok" or "error" or "skipped". For See Tickets and Ents24, set "skipped" (no adapter yet). Return result object.

**Step 2: Add cron route**

In `app/api/cron/sync-events/route.ts`:

- Export `POST` handler. Read `Authorization: Bearer <secret>` or `x-cron-secret` header; compare to `process.env.CRON_SECRET`. If missing or wrong, return 401. Else call `runSync()`, return 200 with JSON body `runSync()` result.

**Step 3: Add env example**

In `.env.example` add:

```
CRON_SECRET=your-secret
EVENTBRITE_TOKEN=
```

**Step 4: Commit**

```bash
git add lib/sync/orchestrator.ts app/api/cron/sync-events/route.ts .env.example
git commit -m "feat(sync): add runSync and cron POST /api/cron/sync-events"
```

---

## Task 6: Optional status endpoint

**Files:**
- Create: `app/api/cron/sync-events/status/route.ts` (or same route with GET returning status)

**Step 1: Implement GET status**

- Option A: Store last run and per-provider status in a `sync_runs` table (add migration, write at end of runSync). GET reads last row and returns `{ lastRun, eventbrite, seetickets, ents24 }`.
- Option B: No persistence; GET returns 200 with `{ message: "Configure cron to call POST /api/cron/sync-events" }`.

Implement Option B for minimal scope; add Option A later if needed.

**Step 2: Commit**

```bash
git add app/api/cron/sync-events/status/route.ts
git commit -m "feat(sync): add GET sync status endpoint"
```

---

## Task 7: UI — show multiple ticket links on event detail

**Files:**
- Modify: `lib/data.ts` (select event_sources when fetching event by slug)
- Modify: `app/events/[slug]/page.tsx` (render links from event_sources)

**Step 1: Include event_sources in getEventBySlug**

In `lib/data.ts`, extend the select for event by slug to include `event_sources(*)` or `event_sources(provider, ticket_url)`. Extend `EventWithRelations` (or a new type) to include `sources: { provider: string; ticket_url: string }[]`.

**Step 2: Render ticket links on event page**

On event detail page, if `event.sources?.length`, show "Tickets: [Link1] | [Link2]" (provider name + link). Else fallback to single `event.ticket_url` if present.

**Step 3: Commit**

```bash
git add lib/data.ts lib/types.ts app/events/[slug]/page.tsx
git commit -m "feat(ui): show multiple ticket links from event_sources on event detail"
```

---

## Task 8: README and cron setup note

**Files:**
- Modify: `README.md`

**Step 1: Document sync**

Add section "Event provider sync": env vars (CRON_SECRET, EVENTBRITE_TOKEN), that hourly cron should POST to `/api/cron/sync-events` with header `x-cron-secret: <CRON_SECRET>`, and that See Tickets/Ents24 will be added when API/feed is available.

**Step 2: Commit**

```bash
git add README.md
git commit -m "docs: document event provider sync and cron setup"
```

---

## Execution handoff

Plan complete and saved to `docs/plans/2025-02-26-event-provider-sync-implementation-plan.md`.

**Two execution options:**

1. **Subagent-driven (this session)** — I dispatch a fresh subagent per task, review between tasks, fast iteration.
2. **Parallel session (separate)** — Open a new session with executing-plans for batch execution with checkpoints.

Which approach do you want?
