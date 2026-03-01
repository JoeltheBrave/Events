import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/permissions/me";

const eventInclude = {
  venue: { select: { id: true, name: true, slug: true, city: true } },
  artists: { include: { artist: { select: { id: true, name: true, slug: true } } } },
  tickets: { select: { url: true } },
} as const;

function toFeedEvent(row: {
  id: string;
  title: string;
  slug: string;
  startAt: Date;
  venue: { id: string; name: string; slug: string; city: string } | null;
  artists: { artist: { id: string; name: string; slug: string } }[];
  tickets: { url: string }[];
}) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    startAt: row.startAt.toISOString(),
    venue: row.venue,
    artists: row.artists.map((ea) => ea.artist),
    ticketUrl: row.tickets[0]?.url ?? null,
  };
}

export async function GET(request: NextRequest) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date();
  const toParam = searchParams.get("to");
  const to = toParam ? new Date(toParam) : new Date(from.getTime() + 90 * 24 * 60 * 60 * 1000);

  const follows = await prisma.follow.findMany({
    where: { userId },
    select: { entityType: true, entityId: true },
  });
  const venueIds = follows.filter((f) => f.entityType === "Venue").map((f) => f.entityId);
  const artistIds = follows.filter((f) => f.entityType === "Artist").map((f) => f.entityId);
  const promoterIds = follows.filter((f) => f.entityType === "Promoter").map((f) => f.entityId);

  const orConditions: object[] = [];
  if (venueIds.length) orConditions.push({ venueId: { in: venueIds } });
  if (artistIds.length) orConditions.push({ artists: { some: { artistId: { in: artistIds } } } });
  if (promoterIds.length) orConditions.push({ promoterId: { in: promoterIds } });

  const events = await prisma.event.findMany({
    where: {
      status: "PUBLISHED",
      visibility: "PUBLIC",
      startAt: { gte: from, lte: to },
      ...(orConditions.length ? { OR: orConditions } : {}),
    },
    include: eventInclude,
    orderBy: { startAt: "asc" },
    take: 50,
  });

  if (follows.length === 0) {
    return NextResponse.json({ events: [], message: "Follow venues, artists or promoters to see events here." });
  }

  return NextResponse.json({
    events: events.map(toFeedEvent),
  });
}
