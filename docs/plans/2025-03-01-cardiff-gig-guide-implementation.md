# Cardiff Gig Guide + Industry Tool — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Deliver the Cardiff Gig Guide as a gig discovery site with fan accounts (follow/save), venue/band/promoter management, and an import/adoption system (Eventbrite OAuth, matching, claims), all backed by a canonical PostgreSQL database.

**Architecture:** Next.js 14+ App Router with route groups `(public)`, `(dashboard)`, `(admin)`. API lives under `/app/api` with clear segments (public, me, dashboard, admin, claims, integrations, track). Prisma for all DB access; Auth.js for session; BullMQ + Redis for jobs; S3-compatible storage (MinIO in dev). No separate API server; no scraping; all data flows through our DB.

**Tech Stack:** Next.js 14+, TypeScript, Tailwind, shadcn/ui, lucide-react, Prisma, PostgreSQL, Auth.js (NextAuth), BullMQ, Redis, S3/MinIO, Docker Compose.

**Reference:** Full Technical Implementation Specification v5 (Production Blueprint). Folder structure and Prisma schema are MANDATORY; no deviation.

---

## Phase 1: Foundation — Stack, layout, components

### Task 1.1: Add dependencies and lock stack

**Files:**
- Modify: `package.json`
- Create: `.env.example` (update for Prisma + Auth + Redis + S3)

**Step 1:** Add to `package.json` dependencies: `prisma`, `@prisma/client`, `next-auth` (Auth.js), `@auth/prisma-adapter`, `bullmq`, `ioredis`, `@aws-sdk/client-s3`, `lucide-react`, `class-variance-authority`, `clsx`, `tailwind-merge`. Add devDependencies: `@types/node` (already present), ensure TypeScript strict. Add script: `"db:generate": "prisma generate"`, `"db:migrate": "prisma migrate dev"`, `"db:push": "prisma db push"`.

**Step 2:** Create/update `.env.example` with: `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `REDIS_URL`, `S3_ENDPOINT`, `S3_BUCKET`, `S3_ACCESS_KEY`, `S3_SECRET_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `EVENTBRITE_CLIENT_ID`, `EVENTBRITE_CLIENT_SECRET` (placeholders).

**Step 3:** Run `npm install`. Commit: `chore: add Prisma, Auth.js, BullMQ, Redis, S3, shadcn deps`.

---

### Task 1.2: Prisma schema and client

**Files:**
- Create: `prisma/schema.prisma`

**Step 1:** Create `prisma/schema.prisma` with the exact schema from the spec (Section 4). Include on `User`: `platformConnections PlatformConnection[]` so that `PlatformConnection.user` relation is bidirectional.

**Step 2:** Set `DATABASE_URL` in `.env` (e.g. `postgresql://user:pass@localhost:5432/events`). Run `npx prisma generate`. Run `npx prisma migrate dev --name init_cardiff_schema`. Verify migration applied.

**Step 3:** Create `lib/prisma.ts`: singleton `PrismaClient` for Next.js (global in dev to avoid many connections). Export `prisma`.

**Step 4:** Commit: `feat: add Prisma schema and client singleton`.

---

### Task 1.3: Docker Compose for dev

**Files:**
- Create: `docker-compose.yml`

**Step 1:** Add services: `postgres` (image postgres:16-alpine, env POSTGRES_USER/PASSWORD/DATABASE, port 5432, volume), `redis` (image redis:7-alpine, port 6379), `minio` (image minio/minio, command server /data, ports 9000/9001, env MINIO_ROOT_USER/MINIO_ROOT_PASSWORD), `app` (build ., ports 3000, env_file .env, depends_on postgres redis minio). Use `DATABASE_URL=postgresql://...@postgres:5432/events`, `REDIS_URL=redis://redis:6379`, `S3_ENDPOINT=http://minio:9000` for app.

**Step 2:** Commit: `chore: add Docker Compose for postgres, redis, minio, app`.

---

### Task 1.4: Route groups and layout shell

**Files:**
- Create: `app/(public)/layout.tsx`
- Create: `app/(dashboard)/layout.tsx`
- Create: `app/(admin)/layout.tsx`
- Modify: `app/layout.tsx` (minimal root: html/body, fonts, global CSS; no header/footer in root so each group controls its own)
- Move/refactor: current `app/page.tsx` → `app/(public)/page.tsx` (temporarily keep existing content or placeholder)

**Step 1:** Create `app/(public)/layout.tsx`: render `CgHeader`, `{children}`, and a shared footer. Import global CSS here or in root layout only once.

**Step 2:** Create `app/(dashboard)/layout.tsx`: render dashboard shell (sidebar or top nav), `{children}`; protect with auth check (redirect to sign-in if no session).

**Step 3:** Create `app/(admin)/layout.tsx`: render admin shell; protect with role check (ADMIN only).

**Step 4:** Ensure root `app/layout.tsx` wraps children only (no duplicate Header/Footer if (public) has them). Move existing home page into `app/(public)/page.tsx` and remove `app/page.tsx` if it existed at root (spec says public pages live under (public)).

**Step 5:** Commit: `feat: add route groups (public), (dashboard), (admin) and layouts`.

---

### Task 1.5: shadcn/ui and design tokens

**Files:**
- Create: `components/ui/` (button, card, badge, etc. per shadcn)
- Create: `lib/utils.ts` (cn() with clsx + tailwind-merge)
- Modify: `tailwind.config.ts` (shadcn theme if needed)

**Step 1:** Initialize shadcn (e.g. `npx shadcn@latest init`) with Tailwind; create `lib/utils.ts` with `cn()`. Add components: Button, Card, Badge, Chip-style primitive if not present. Use CSS variables for theme (shadcn default).

**Step 2:** Commit: `chore: add shadcn/ui and utils`.

---

### Task 1.6: Brand components (Cg* and shared)

**Files:**
- Create: `components/CgHeader.tsx`
- Create: `components/CgCard.tsx`
- Create: `components/CgChip.tsx`
- Create: `components/CgBadge.tsx`
- Create: `components/CgButton.tsx`
- Create: `components/EventCard.tsx` (refactor from existing to use Cg* and new data shape)
- Create: `components/FilterDrawer.tsx` (filter UI for events list)

**Step 1:** Implement `CgHeader`: logo, nav links (Events, Venues, Artists, Promoters, Submit), auth (Sign in / Account). Use Tailwind + optional shadcn. Mobile menu acceptable.

**Step 2:** Implement `CgCard`, `CgChip`, `CgBadge`, `CgButton` as thin wrappers or compositions over shadcn with Cardiff Gig branding (no new design system; keep consistent with spec “brand shell”).

**Step 3:** Refactor `EventCard` to take event in new shape (Prisma Event with venue, artists, ticket links) and use Cg* components and lucide-react icons.

**Step 4:** Implement `FilterDrawer`: date range, venue, genre tags, age restriction; emits query params or callback for filtering (client or server).

**Step 5:** Commit: `feat: add Cg* brand components and EventCard, FilterDrawer`.

---

## Phase 2: Public pages (mock then DB)

### Task 2.1: Public route structure and mock data

**Files:**
- Create: `app/(public)/page.tsx` (home — already moved in 1.4; update to use mock)
- Create: `app/(public)/events/page.tsx`
- Create: `app/(public)/events/[slug]/page.tsx`
- Create: `app/(public)/venues/page.tsx`
- Create: `app/(public)/venues/[slug]/page.tsx`
- Create: `app/(public)/artists/page.tsx`
- Create: `app/(public)/artists/[slug]/page.tsx`
- Create: `app/(public)/promoters/page.tsx`
- Create: `app/(public)/promoters/[slug]/page.tsx`
- Create: `app/(public)/submit/page.tsx`
- Create: `lib/mock.ts` (optional; mock events/venues/artists for dev)

**Step 1:** Create all route files above. Home: list featured / upcoming events (mock or Prisma). Events list: paginated, with FilterDrawer. Event [slug]: single event detail. Venues/Artists/Promoters: list + [slug] detail. Submit: static form placeholder (no submit yet).

**Step 2:** Use mock data from `lib/mock.ts` or seed DB and use Prisma in server components. Prefer Prisma once Task 1.2 is done.

**Step 3:** Commit: `feat: add public pages with mock or seeded data`.

---

### Task 2.2: Replace mock with Prisma (public read)

**Files:**
- Create: `app/api/public/events/route.ts` (GET list)
- Create: `app/api/public/events/[slug]/route.ts` (GET one) — or use server components only and read in page
- Modify: `app/(public)/page.tsx`, `app/(public)/events/page.tsx`, `app/(public)/events/[slug]/page.tsx`, venues/artists/promoters pages

**Step 1:** Implement server-side data in public pages: use `prisma.event.findMany` with `where: { status: 'PUBLISHED', visibility: 'PUBLIC' }`, include venue, artists, ticket links. Add pagination and filter params (date range, venueId, genreTags).

**Step 2:** Implement events list API if needed for client filter (e.g. `GET /api/public/events?from=&to=&venue=&genre=`) or keep server components with searchParams. Same for venues/artists/promoters (read from Prisma).

**Step 3:** Remove mock usage. Verify all public pages render with DB data. Commit: `feat: public pages read from Prisma`.

---

## Phase 3: Auth

### Task 3.1: Auth.js setup and Prisma adapter

**Files:**
- Create: `app/api/auth/[...nextauth]/route.ts`
- Create: `lib/auth/config.ts` (or `auth.ts`) — callbacks, providers, adapter
- Modify: `prisma/schema.prisma` (add NextAuth models if not already: Account, Session, VerificationToken per Auth.js Prisma adapter)

**Step 1:** Add to Prisma schema the Auth.js required models: `Account`, `Session`, `VerificationToken` (see Auth.js Prisma adapter docs). Run migration.

**Step 2:** Configure Auth.js: Credentials (email + password), Google OAuth. Use `@auth/prisma-adapter` with `prisma`. Set `NEXTAUTH_SECRET`, `NEXTAUTH_URL`. Register route handler at `app/api/auth/[...nextauth]/route.ts`.

**Step 3:** Create `lib/auth/config.ts` exporting config; in callbacks attach `user.id`, `user.role` to session. Commit: `feat: Auth.js with email/password and Google, Prisma adapter`.

---

### Task 3.2: Sign-in / sign-up and session

**Files:**
- Create: `app/(public)/login/page.tsx` (or under (auth))
- Create: `app/(public)/register/page.tsx`
- Create: `lib/auth/session.ts` (getServerSession wrapper)

**Step 1:** Implement login page (credentials form + Google button). Register page: email + password creation, then sign in. Use `signIn`, `signOut` from next-auth/react.

**Step 2:** Add `lib/auth/session.ts`: `getSession()` using `getServerSession(authOptions)`. Use in dashboard/admin layouts. Commit: `feat: login/register and session helper`.

---

## Phase 4: Fan system (follows + saves + feed)

### Task 4.1: Follow and save APIs

**Files:**
- Create: `app/api/me/follows/route.ts` (POST, DELETE)
- Create: `app/api/me/saved-events/route.ts` (POST, DELETE)
- Create: `lib/permissions/me.ts` (ensure authenticated user)

**Step 1:** Implement `POST /api/me/follows`: body `{ entityType, entityId }` (e.g. Venue, Artist, Promoter). Validate entity exists; create `Follow` for current user. `DELETE`: same body, remove follow. Use Prisma; check session in route.

**Step 2:** Implement `POST /api/me/saved-events`: body `{ eventId }`; create `SavedEvent`. `DELETE`: body `{ eventId }`; remove. Commit: `feat: API me/follows and me/saved-events`.

---

### Task 4.2: Feed API and fan UI

**Files:**
- Create: `app/api/me/feed/route.ts`
- Create: `app/(dashboard)/me/page.tsx` (or under (public) for “My feed” when logged in)

**Step 1:** Implement `GET /api/me/feed`: query params `from`, `to` (date range). Logic: get user’s Follows (venues, artists, promoters); get Events where event.venueId in followed venues OR event has EventArtist in followed artists OR event.promoterId in followed promoters; filter by date; return ordered. Use Prisma.

**Step 2:** Add “My feed” page: call feed API or server component; list events with EventCard. Add follow/save buttons on event and entity pages (venue/artist/promoter) that call the new APIs. Commit: `feat: feed API and fan follow/save UI`.

---

## Phase 5: Submissions and moderation

### Task 5.1: Submit event form and API

**Files:**
- Create: `app/api/public/events/route.ts` (POST for submit) or `app/api/dashboard/events/route.ts`
- Modify: `app/(public)/submit/page.tsx`
- Create: `lib/permissions/submit.ts` (optional: any logged-in user can submit)

**Step 1:** Implement submit form: title, description, startAt, endAt, venue (select or create?), promoter (optional), artists (multi-select or create), genre tags, age restriction, images (upload to S3; store heroImageUrl, posterImageUrl). Create event with `status: SUBMITTED`, `visibility: PUBLIC`, `createdByUserId: session.user.id`.

**Step 2:** POST API: validate body; create Venue/Artist if new; create Event + EventArtist; optionally upload images to S3. Return created event. Commit: `feat: submit event form and API`.

---

### Task 5.2: Moderation (admin)

**Files:**
- Create: `app/(admin)/admin/moderation/events/page.tsx`
- Create: `app/api/admin/moderation/events/route.ts` (GET list SUBMITTED, PATCH approve/reject)
- Create: `lib/permissions/admin.ts` (require ADMIN role)

**Step 1:** List events with `status: SUBMITTED`. Admin can approve (set APPROVED or PUBLISHED) or reject (set REJECTED). PATCH API: `{ eventId, action: 'approve' | 'reject' }`.

**Step 2:** Commit: `feat: admin moderation for submitted events`.

---

## Phase 6: Claim system (Eventbrite adoption)

### Task 6.1: Event claims model and permissions

**Files:**
- Create: `lib/permissions/claims.ts`
- Modify: dashboard event edit flow (later)

**Step 1:** Add helper: `canEditEvent(userId, eventId)`: true if user is ADMIN or has EventClaim for (eventId, platform) with `revokedAt: null`, or is VenueMember/ArtistMember/PromoterMember for that event’s venue/artist/promoter. Use in API routes that update events.

**Step 2:** Commit: `feat: claim-based edit permission helper`.

---

### Task 6.2: Eventbrite OAuth provider and adoption UI

**Files:**
- Create: `lib/auth/eventbrite-provider.ts` (custom Eventbrite OAuth provider for Auth.js)
- Create: `app/api/integrations/eventbrite/oauth/route.ts` (start OAuth, callback)
- Create: `app/(dashboard)/dashboard/adopt/eventbrite/page.tsx`
- Create: `app/api/integrations/eventbrite/events/route.ts` (fetch user’s org events)
- Modify: `lib/auth/config.ts` (add Eventbrite provider; store tokens in PlatformConnection)

**Step 1:** Implement custom Eventbrite OAuth: authorize URL, token exchange, store access/refresh in `PlatformConnection` (encrypt tokens; use env encryption key or KMS). Add “Connect Eventbrite” in dashboard integrations.

**Step 2:** Page “Adopt Eventbrite events”: list user’s Eventbrite org events (from Eventbrite API using stored token). For each, show match result (matched canonical event or “new”). User confirms → create or link: if matched, create EventClaim; if new, create Event + optional EventClaim.

**Step 3:** Commit: `feat: Eventbrite OAuth and adopt flow with claims`.

---

### Task 6.3: Claim verification job (nightly)

**Files:**
- Create: `lib/jobs/claim-verification.ts`
- Create: `app/api/cron/verify-claims/route.ts` (or BullMQ worker that runs nightly)
- Create: `lib/jobs/queue.ts` (BullMQ queue definition)

**Step 1:** Set up BullMQ queue (e.g. `claims`). Worker: fetch all EventClaims where `revokedAt: null`; for each, call Eventbrite API to verify event still exists and token is valid; if not, set `revokedAt: now()`. Schedule worker to run nightly (e.g. via cron triggering job or BullMQ repeatable job).

**Step 2:** Commit: `feat: nightly claim verification job`.

---

## Phase 7: Import framework and matching

### Task 7.1: PlatformEvent and public pull (Eventbrite)

**Files:**
- Create: `lib/connectors/eventbrite-public.ts` (fetch Cardiff events from public API)
- Create: `app/api/cron/import-eventbrite/route.ts` or job
- Create: `lib/connectors/normalize.ts` (raw → PlatformEvent shape: platform, externalId, fingerprint, rawJson)

**Step 1:** Implement fingerprint: `YYYY-MM-DD|normalizedVenue|normalizedTitle`. Normalize: lowercase, remove punctuation, remove “live at”, collapse whitespace, remove “the ” prefix. Store in `PlatformEvent.fingerprint`.

**Step 2:** Eventbrite public pull: fetch events (Cardiff), normalize to PlatformEvent, upsert by (platform, externalId). Set matchStatus = 'pending'. No automatic create of Event yet; matching runs separately or in same job.

**Step 3:** Commit: `feat: Eventbrite public pull and PlatformEvent fingerprint`.

---

### Task 7.2: Matching engine

**Files:**
- Create: `lib/matching/fingerprint.ts` (build + normalize)
- Create: `lib/matching/match.ts` (exact + same date/venue + similarity title > 0.8)
- Modify: import job to call matcher and create/update Event + TicketLink

**Step 1:** Exact match: find Event where fingerprint equals PlatformEvent.fingerprint (store fingerprint on Event or compute on fly). If none, same date + venue + similarity(title) > 0.8 (use string similarity lib or simple ratio). If matched: link PlatformEvent.matchedEventId, create/update TicketLink for platform. If not: create canonical Event from PlatformEvent (or flag for manual review).

**Step 2:** Canonical event always wins: when merging, never overwrite title/description from platform; only add TicketLink. Commit: `feat: matching engine and link PlatformEvent to Event`.

---

### Task 7.3: Ticketmaster pull (optional, same pattern)

**Files:**
- Create: `lib/connectors/ticketmaster-public.ts`
- Create: job/cron for Ticketmaster pull; use same matching and PlatformEvent flow.

**Step 1:** Same as Eventbrite: fetch Cardiff (or UK) events, normalize, fingerprint, upsert PlatformEvent, run matching. Commit: `feat: Ticketmaster public pull and match`.

---

## Phase 8: Admin and polish

### Task 8.1: Admin pages (claims, imports)

**Files:**
- Create: `app/(admin)/admin/claims/page.tsx` (list PageClaim, EventClaim; approve/revoke)
- Create: `app/(admin)/admin/imports/page.tsx` (list PlatformEvents, match status, manual match)
- Create: `app/api/admin/claims/route.ts`, `app/api/admin/imports/route.ts` (PATCH where needed)

**Step 1:** List claims; admin can set status or revoke. List imports (PlatformEvent); show matchedEventId; allow “link to event” manually. Commit: `feat: admin claims and imports UI`.

---

### Task 8.2: Dashboard home and navigation

**Files:**
- Create: `app/(dashboard)/dashboard/page.tsx`
- Create: `app/(dashboard)/dashboard/events/page.tsx` (list events user can edit)
- Create: `app/(dashboard)/dashboard/integrations/page.tsx` (list connected platforms)
- Modify: `app/(dashboard)/layout.tsx` (nav links)

**Step 1:** Dashboard home: summary (your events, claims, follows). Events: list where user can edit (via claim or membership). Integrations: show Eventbrite (and others) connection status. Commit: `feat: dashboard home, events list, integrations`.

---

### Task 8.3: Page claims (venue/artist/promoter ownership)

**Files:**
- Create: `app/api/claims/route.ts` (POST to request claim)
- Create: `app/(admin)/admin/claims/page.tsx` (already in 8.1; ensure PageClaim reviewed here)
- Create: UI for “Claim this venue/artist/promoter” on entity pages

**Step 1:** POST /api/claims: body `{ entityType, entityId, method, evidence }`. Create PageClaim (status pending). Admin reviews and approves → add VenueMember/ArtistMember/PromoterMember. Commit: `feat: page claim request and admin review`.

---

## Verification and handoff

- Run `npm run build` and fix any type or lint errors.
- Run `npx prisma validate` and ensure migrations are applied.
- Manually test: public pages, sign-in, follow/save, feed, submit, moderation, Eventbrite connect, adopt, claim verification job, matching (with seed PlatformEvents).
- Optional: add E2E or API tests for critical paths (auth, follow, save, feed, submit, match).

---

## Execution options

**Plan complete and saved to `docs/plans/2025-03-01-cardiff-gig-guide-implementation.md`.**

Two execution options:

1. **Subagent-Driven (this session)** — I dispatch a fresh subagent per task or phase, review between tasks, fast iteration.
2. **Parallel Session (separate)** — Open a new session with executing-plans in the same repo (or in a worktree per using-git-worktrees), batch execution with checkpoints.

Which approach do you want?
