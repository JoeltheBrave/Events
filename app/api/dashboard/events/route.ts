import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/permissions/me";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const {
      title,
      description,
      startAt,
      endAt,
      venueId,
      promoterId,
      artistIds,
      genreTags,
      ageRestriction,
      heroImageUrl,
      posterImageUrl,
    } = body as {
      title?: string;
      description?: string;
      startAt?: string;
      endAt?: string;
      venueId?: string;
      promoterId?: string;
      artistIds?: string[];
      genreTags?: string[];
      ageRestriction?: string;
      heroImageUrl?: string;
      posterImageUrl?: string;
    };
    if (!title || !startAt) {
      return NextResponse.json({ error: "Title and startAt required" }, { status: 400 });
    }
    const start = new Date(startAt);
    const end = endAt ? new Date(endAt) : null;
    const slug = slugify(title) + "-" + start.getTime();
    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description: description ?? null,
        startAt: start,
        endAt: end,
        venueId: venueId || null,
        promoterId: promoterId || null,
        status: "SUBMITTED",
        visibility: "PUBLIC",
        genreTags: Array.isArray(genreTags) ? genreTags : [],
        ageRestriction: ageRestriction ?? null,
        heroImageUrl: heroImageUrl ?? null,
        posterImageUrl: posterImageUrl ?? null,
        createdByUserId: userId,
        managedByUserId: userId,
      },
    });
    if (Array.isArray(artistIds) && artistIds.length > 0) {
      await prisma.eventArtist.createMany({
        data: artistIds.map((artistId, i) => ({
          eventId: event.id,
          artistId,
          billingOrder: i,
        })),
      });
    }
    return NextResponse.json({ ok: true, event: { id: event.id, slug: event.slug } });
  } catch (e) {
    console.error("Submit event:", e);
    return NextResponse.json({ error: "Failed to submit event" }, { status: 500 });
  }
}
