# Cardiff Gig Guide — Implementation Analysis

**Date:** 2025-03-01  
**Scope:** Full implementation per Technical Specification v5 (Production Blueprint) and plan `docs/plans/2025-03-01-cardiff-gig-guide-implementation.md`.

---

## What Was Done Well

### 1. **Spec and plan adherence**
- Folder structure matches the spec: `app/(public)`, `app/(dashboard)`, `app/(admin)`; `app/api` with `public`, `me`, `dashboard`, `admin`, `claims`, `integrations`, `cron` segments.
- Prisma schema follows the v5 spec: User (with Account, Session, VerificationToken for Auth.js), Venue, Artist, Promoter, Event, EventArtist, TicketLink, Follow, SavedEvent, PlatformEvent, PlatformConnection, EventClaim, PageClaim, and all *Member tables.
- Build order was respected: foundation → Prisma → public pages → Auth → fan system → submissions/moderation → claims → import/matching → admin polish.

### 2. **Public data and build safety**
- `lib/public-data.ts` centralises all public reads and maps Prisma shapes to the existing `EventWithRelations` / Venue / Artist types so the UI did not need a big rewrite.
- `hasDatabase()` guards ensure the app builds and runs without `DATABASE_URL` (e.g. in CI or fresh clones). Public pages render with empty data instead of crashing.

### 3. **Auth and permissions**
- Auth.js is wired with Credentials (email + bcrypt) and optional Google, Prisma adapter, and JWT session including `user.id` and `user.role`.
- Dashboard and admin layouts enforce session and (for admin) role, with redirects to `/login` and `/dashboard` where appropriate.
- `requireUserId()` and `requireAdmin()` are used consistently on protected APIs; `canEditEvent()` is implemented for future use in edit flows.

### 4. **Fan system**
- Follow and save APIs support entity types (Venue, Artist, Promoter) and validate entity existence before creating Follow/SavedEvent.
- Feed logic correctly uses OR across followed venues, artists, and promoters with a date range; the same logic is exposed as `getFeedForUser()` for server components and as `GET /api/me/feed` for clients.

### 5. **Matching and fingerprint**
- Fingerprint format and normalization (lowercase, strip punctuation, “live at”, “the ” prefix, collapse spaces) are implemented in `lib/matching/fingerprint.ts`.
- Matching order is as specified: exact fingerprint first, then same date + venue + title similarity ≥ 0.8 in `lib/matching/match.ts`.

### 6. **Incremental delivery**
- Each phase is usable on its own: you can run with DB + Auth and use public pages, feed, submit, and moderation without turning on Eventbrite or cron jobs.

---

## What Was Done Poorly or Left Incomplete

### 1. **Eventbrite OAuth callback and token storage**
- Tokens are stored in `PlatformConnection.accessTokenEncrypted` as plain text. The spec says “encrypt”; production should use a proper encryption key (e.g. env `ENCRYPTION_KEY`) and encrypt/decrypt before storing and when calling the Eventbrite API.

### 2. **Eventbrite public pull**
- `lib/connectors/eventbrite-public.ts` is a stub: it only runs when `EVENTBRITE_PUBLIC_TOKEN` is set and uses an empty `mockEvents` array, so no real Eventbrite API calls are made. Completing this requires:
  - Calling the real Eventbrite search/list API (e.g. location=Cardiff).
  - Mapping response fields to our fingerprint (date, venue name, title) and to `PlatformEvent` / `TicketLink`.

### 3. **Adopt flow (user’s Eventbrite events → claims)**
- Dashboard “Adopt Eventbrite events” is a placeholder. A full implementation would:
  - Use the user’s stored Eventbrite connection to fetch their org events.
  - For each, run matching and show “matched to canonical event X” or “create new”.
  - On confirm, create or link: create `EventClaim` when linking to an existing event, or create Event + optional EventClaim when creating new.

### 4. **BullMQ and claim verification**
- `lib/jobs/queue.ts` defines a queue but no worker is started; the spec’s “nightly” claim verification is implemented as an HTTP endpoint `GET /api/cron/verify-claims` that can be called by an external cron. The in-process worker + repeatable job pattern was not implemented.

### 5. **S3 and image uploads**
- Submit form does not upload images; `heroImageUrl` / `posterImageUrl` are not set from the UI. S3 client and MinIO are in the stack but no upload API or form fields were added.

### 6. **Legacy Supabase usage**
- `lib/data.ts` and `lib/supabase.ts` remain. Public pages now use `lib/public-data.ts` (Prisma). Old code could be removed or clearly marked legacy to avoid confusion and accidental use.

### 7. **Admin claims and imports UIs**
- Admin claims and imports pages are copy-only; they do not list `PageClaim` or `PlatformEvent` or offer approve/link actions. Data is in the DB but there is no admin UI to act on it.

### 8. **Tests**
- No unit or integration tests were added. Critical areas to test: fingerprint normalization, matching logic, auth callbacks, and permission helpers.

### 9. **ESLint**
- `npm run lint` triggered an ESLint setup prompt; the project may not have a committed ESLint config. A strict config and fixing any reported issues would improve consistency.

---

## Recommended Follow-up Tasks

1. **Encrypt OAuth tokens**  
   Use an env-based encryption key and encrypt/decrypt `accessTokenEncrypted` and `refreshTokenEncrypted` in `PlatformConnection` when saving and when calling Eventbrite.

2. **Implement Eventbrite public pull**  
   In `lib/connectors/eventbrite-public.ts`, call the real Eventbrite API (search by location Cardiff), map to fingerprint and `PlatformEvent`, then run the existing matching and `TicketLink` creation.

3. **Implement adopt flow**  
   Dashboard page “Adopt Eventbrite events”: fetch user’s Eventbrite events via stored connection, run matching, show results, and create `EventClaim` or Event + optional claim on confirm.

4. **Add image upload for submit**  
   API route that accepts file upload, stores in S3/MinIO, returns URL; submit form fields for hero/poster and pass URLs into `POST /api/dashboard/events`.

5. **Admin claims and imports UIs**  
   List `PageClaim` with approve/reject (and create VenueMember/ArtistMember/PromoterMember on approve); list `PlatformEvent` with match status and optional “link to event” manual action.

6. **Remove or isolate Supabase**  
   Delete or move `lib/data.ts` and `lib/supabase.ts` and any remaining Supabase references, or document them as legacy and ensure no routes use them.

7. **Add tests**  
   At least: fingerprint + matching (unit), auth session/role (integration or e2e), and `canEditEvent` (unit).

8. **Fix ESLint**  
   Run the ESLint setup (e.g. strict), commit the config, and fix any new lint errors.

9. **Ticketmaster pull (optional)**  
   If desired, add a connector similar to Eventbrite (public pull, fingerprint, PlatformEvent, matching) and a cron or job to run it.

---

## Summary

The implementation delivers the structure, data model, auth, fan features, submissions, moderation, claims model, matching engine, and Eventbrite OAuth wiring specified in v5. Build passes and the app runs with or without a database. Gaps are mainly: production-ready token storage, real Eventbrite API usage and adopt flow, S3 uploads, admin UIs for claims/imports, tests, and cleanup of legacy Supabase code. The list above gives a concrete order of work to harden and complete the system.
