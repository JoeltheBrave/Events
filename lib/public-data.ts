import { prisma } from "@/lib/prisma";
import type { EventWithRelations, Venue, Artist, Category } from "@/lib/types";

function hasDatabase(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

/** Map Prisma Event + relations to the legacy EventWithRelations shape for public UI */
function toPublicEvent(row: {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  startAt: Date;
  endAt: Date | null;
  genreTags: string[];
  venue: { id: string; name: string; slug: string; city: string } | null;
  artists: { artist: { id: string; name: string; slug: string }; billingOrder: number }[];
  tickets: { url: string }[];
}): EventWithRelations {
  const primaryGenre = row.genreTags[0];
  const category: Category = {
    id: primaryGenre ?? "other",
    name: primaryGenre ? primaryGenre.charAt(0).toUpperCase() + primaryGenre.slice(1) : "Other",
    slug: (primaryGenre as "music" | "comedy" | "theatre" | "family" | "other") ?? "other",
  };
  const venue: Venue = row.venue
    ? {
        id: row.venue.id,
        name: row.venue.name,
        slug: row.venue.slug,
        city: row.venue.city,
        region: "",
        address: null,
      }
    : { id: "", name: "TBA", slug: "tba", city: "", region: "", address: null };
  const artists: Artist[] = row.artists.map((ea) => ({
      id: ea.artist.id,
      name: ea.artist.name,
      slug: ea.artist.slug,
      image_url: null,
    }));
  const ticket_url = row.tickets[0]?.url ?? null;
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    event_date: row.startAt.toISOString(),
    doors_at: null,
    ticket_url,
    on_sale_at: null,
    category_id: category.id,
    venue_id: row.venue?.id ?? "",
    category,
    venue,
    artists,
  };
}

const eventInclude = {
  venue: { select: { id: true, name: true, slug: true, city: true } },
  artists: { include: { artist: { select: { id: true, name: true, slug: true } } } },
  tickets: { select: { url: true } },
} as const;

export async function getPublicEvents(options?: {
  from?: string;
  to?: string;
  venueId?: string;
  genre?: string;
  city?: string;
  limit?: number;
}): Promise<EventWithRelations[]> {
  if (!hasDatabase()) return [];
  const startAt: { gte: Date; lte?: Date } = { gte: new Date(options?.from ?? Date.now()) };
  if (options?.to) startAt.lte = new Date(options.to);
  const where = {
    status: "PUBLISHED" as const,
    visibility: "PUBLIC" as const,
    startAt,
    ...(options?.venueId && { venueId: options.venueId }),
    ...(options?.genre && { genreTags: { has: options.genre } }),
    ...(options?.city && { venue: { city: options.city } }),
  };

  const rows = await prisma.event.findMany({
    where,
    include: eventInclude,
    orderBy: { startAt: "asc" },
    take: options?.limit ?? 50,
  });
  return rows.map(toPublicEvent);
}

export async function getPublicEventBySlug(slug: string): Promise<EventWithRelations | null> {
  if (!hasDatabase()) return null;
  const row = await prisma.event.findFirst({
    where: { slug, status: "PUBLISHED", visibility: "PUBLIC" },
    include: eventInclude,
  });
  if (!row) return null;
  return toPublicEvent(row);
}

export async function getPublicVenues(limit = 200): Promise<Venue[]> {
  if (!hasDatabase()) return [];
  const rows = await prisma.venue.findMany({
    orderBy: [{ city: "asc" }, { name: "asc" }],
    take: limit,
  });
  return rows.map((v) => ({
    id: v.id,
    name: v.name,
    slug: v.slug,
    city: v.city,
    region: "",
    address: v.addressLine1 ?? null,
  }));
}

export async function getPublicVenueBySlug(slug: string, city?: string): Promise<Venue | null> {
  if (!hasDatabase()) return null;
  const row = await prisma.venue.findFirst({
    where: city ? { slug, city } : { slug },
  });
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    city: row.city,
    region: "",
    address: row.addressLine1 ?? null,
  };
}

export async function getPublicVenueEvents(venueId: string, limit = 30): Promise<EventWithRelations[]> {
  if (!hasDatabase()) return [];
  const rows = await prisma.event.findMany({
    where: { venueId, status: "PUBLISHED", visibility: "PUBLIC", startAt: { gte: new Date() } },
    include: eventInclude,
    orderBy: { startAt: "asc" },
    take: limit,
  });
  return rows.map(toPublicEvent);
}

export async function getPublicArtists(limit = 100): Promise<Artist[]> {
  if (!hasDatabase()) return [];
  const rows = await prisma.artist.findMany({
    orderBy: { name: "asc" },
    take: limit,
  });
  return rows.map((a) => ({ id: a.id, name: a.name, slug: a.slug, image_url: a.pressPhotoUrl ?? null }));
}

export async function getPublicArtistBySlug(slug: string): Promise<Artist | null> {
  if (!hasDatabase()) return null;
  const row = await prisma.artist.findUnique({ where: { slug } });
  if (!row) return null;
  return { id: row.id, name: row.name, slug: row.slug, image_url: row.pressPhotoUrl ?? null };
}

export async function getPublicArtistEvents(artistSlug: string): Promise<EventWithRelations[]> {
  if (!hasDatabase()) return [];
  const artist = await prisma.artist.findUnique({ where: { slug: artistSlug }, select: { id: true } });
  if (!artist) return [];
  const rows = await prisma.event.findMany({
    where: {
      artists: { some: { artistId: artist.id } },
      status: "PUBLISHED",
      visibility: "PUBLIC",
      startAt: { gte: new Date() },
    },
    include: eventInclude,
    orderBy: { startAt: "asc" },
  });
  return rows.map(toPublicEvent);
}

/** For home: upcoming events (on sale soon / featured by genre) */
export async function getPublicUpcoming(limit = 8): Promise<EventWithRelations[]> {
  if (!hasDatabase()) return [];
  const rows = await prisma.event.findMany({
    where: { status: "PUBLISHED", visibility: "PUBLIC", startAt: { gte: new Date() } },
    include: eventInclude,
    orderBy: { startAt: "asc" },
    take: limit,
  });
  return rows.map(toPublicEvent);
}

export async function getPublicFeaturedByGenre(genre: string, limit = 8): Promise<EventWithRelations[]> {
  if (!hasDatabase()) return [];
  const rows = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      startAt: { gte: new Date() },
      genreTags: { has: genre },
    },
    include: eventInclude,
    orderBy: { startAt: "asc" },
    take: limit,
  });
  return rows.map(toPublicEvent);
}

/** Categories for filters: derived from genreTags in use (music, comedy, theatre, etc.) */
export async function getPublicCategories(): Promise<Category[]> {
  return [
    { id: "music", name: "Music", slug: "music" },
    { id: "comedy", name: "Comedy", slug: "comedy" },
    { id: "theatre", name: "Theatre & Arts", slug: "theatre" },
    { id: "family", name: "Family", slug: "family" },
    { id: "other", name: "Other", slug: "other" },
  ];
}

/** Feed: events from followed venues/artists/promoters for a user */
export async function getFeedForUser(
  userId: string,
  options?: { from?: Date; to?: Date; limit?: number }
): Promise<EventWithRelations[]> {
  if (!hasDatabase()) return [];
  const follows = await prisma.follow.findMany({
    where: { userId },
    select: { entityType: true, entityId: true },
  });
  const venueIds = follows.filter((f) => f.entityType === "Venue").map((f) => f.entityId);
  const artistIds = follows.filter((f) => f.entityType === "Artist").map((f) => f.entityId);
  const promoterIds = follows.filter((f) => f.entityType === "Promoter").map((f) => f.entityId);
  const from = options?.from ?? new Date();
  const to = options?.to ?? new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);
  const orConditions: object[] = [];
  if (venueIds.length) orConditions.push({ venueId: { in: venueIds } });
  if (artistIds.length) orConditions.push({ artists: { some: { artistId: { in: artistIds } } } });
  if (promoterIds.length) orConditions.push({ promoterId: { in: promoterIds } });
  const rows = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      startAt: { gte: from, lte: to },
      ...(orConditions.length ? { OR: orConditions } : {}),
    },
    include: eventInclude,
    orderBy: { startAt: "asc" },
    take: options?.limit ?? 50,
  });
  return rows.map(toPublicEvent);
}
