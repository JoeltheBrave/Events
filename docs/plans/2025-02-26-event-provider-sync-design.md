# Event Provider Sync — Design

**Status:** Approved  
**Date:** 2025-02-26

---

## Goal

Auto-pull event data from multiple providers (Eventbrite, See Tickets, Ents24) using **official/partner APIs only**. Ingest hourly; merge same real-world event into one row with multiple ticket links; respect rate limits.

---

## Constraints (approved)

- **Data source:** Official/partner APIs only (no scraping).
- **Deduplication:** One event row per real-world gig; multiple ticket links (e.g. "See Tickets | Eventbrite").
- **Schedule:** Hourly sync (scheduled job).
- **Architecture:** In-app cron (e.g. Next.js API route) called by host cron; single codebase.

---

## 1. Data model and source identity

**Existing:** `events`, `artists`, `venues`, `categories`, `event_artists`.

**Add:**

- **`event_sources`** — one row per (event_id, provider, ticket_url). Columns: `event_id`, `provider` (e.g. `eventbrite`, `seetickets`, `ents24`), `ticket_url`, `provider_uid` (provider’s event ID for idempotent updates). Unique on `(event_id, provider)` so we don’t duplicate links.
- **Optional:** `providers` table (id, name, slug) with FK from `event_sources.provider_id`; or keep `provider` as text/enum on `event_sources` for simplicity.
- **Canonical key for merge:** Normalized (artist name(s) + venue + event_date) — e.g. trim, lower, date truncated to day. On ingest: lookup by this key; if found, add/update row in `event_sources` only; if not, create event + venue/artists + `event_sources`.

**Scope:** UK-focused; geography can be enforced in adapter filters.

---

## 2. Sync flow and idempotency

**Each run:**

1. Cron calls sync endpoint with shared secret; reject if wrong/missing.
2. For each provider (in fixed order, e.g. Eventbrite → See Tickets → Ents24):
   - Fetch events (paginated), respect rate limits.
   - For each raw event: normalize to canonical shape (artist(s), venue, date, ticket_url, provider_uid).
   - **Match:** Compute canonical key; find existing event by key.
   - **If found:** Upsert `event_sources` for (event_id, provider, ticket_url, provider_uid). No new event row.
   - **If not found:** Create venue/artists/event/event_artists and `event_sources`.
3. One provider failing (timeout, 5xx, rate limit) → log, retry once if appropriate, then continue with next provider. Do not fail entire run.

**Idempotency:** Same `provider_uid` + provider only updates `event_sources` (or event updated_at). Same canonical key from any provider always maps to same event row.

**Rate limits:** Per-provider delays; on 429, back off and retry once, then skip for this run.

---

## 3. Provider adapters and API surface

**Adapter pattern:** One adapter per provider. Each adapter: **fetch** (paginated, rate-limited) and **normalize** to a shared internal type. No DB writes inside adapters. Orchestrator does match + upsert.

**Normalized event type (internal):** e.g. `artistNames[]`, `venueName`, `venueCity`, `venueRegion`, `eventDate` (ISO), `doorsAt`, `onSaleAt`, `ticketUrl`, `provider`, `providerUid`, optional `category`.

**Per provider:**

- **Eventbrite:** Public API; adapter uses token, calls events search/list, paginates, maps to normalized shape; filter UK where supported.
- **See Tickets / Ents24:** Add adapters only when official API or partner feed exists; until then, skip or stub so pipeline runs for others.

**API surface:** Cron endpoint protected by `CRON_SECRET`. Provider keys in env (`EVENTBRITE_TOKEN`, etc.). Optional `GET .../status` for last run and per-provider success/failure (no secrets).

**Adapter errors:** 5xx/network → retry once with backoff then throw. 4xx → no retry, skip. 429 → back off, retry once, then skip.

---

## 4. Error handling, testing, rollout

**Cron:** Validate secret; return 401 if invalid. On success return 200 with body indicating per-provider result. Log errors server-side only.

**Adapters:** As above; throw after giving up so orchestrator can log and continue.

**DB:** On insert/upsert failure, log, optional single retry for that row, then continue.

**Testing:** Unit tests for adapters with mocked HTTP; assert normalized output. Optional integration test against test DB + real Eventbrite token (manual or CI, not every commit). No live provider calls in default CI.

**Rollout:** Phase 1 — migration for `event_sources`, cron + Eventbrite adapter only. Phase 2 — add See Tickets/Ents24 adapters when API/feed available. Each provider enabled only if its env var is set.

**Monitoring:** Use cron host schedule; optional `sync_runs` table or status endpoint for last run and per-provider status.
