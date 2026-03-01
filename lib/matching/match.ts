import { prisma } from "@/lib/prisma";
import { buildFingerprint } from "./fingerprint";

function similarity(a: string, b: string): number {
  if (!a || !b) return 0;
  const sa = new Set(a.split(/\s+/));
  const sb = new Set(b.split(/\s+/));
  let intersection = 0;
  Array.from(sa).forEach((w) => { if (sb.has(w)) intersection++; });
  return (2 * intersection) / (sa.size + sb.size);
}

/**
 * Find canonical event for a platform event (date + venue + title).
 * 1. Exact fingerprint match
 * 2. Same date + venue + title similarity > 0.8
 * 3. Otherwise null (manual review)
 */
export async function findMatchingEvent(
  date: Date,
  venueName: string,
  title: string
): Promise<{ eventId: string } | null> {
  const fingerprint = buildFingerprint(date, venueName, title);
  const dateStr = date.toISOString().slice(0, 10);

  const eventsOnDate = await prisma.event.findMany({
    where: {
      startAt: {
        gte: new Date(dateStr + "T00:00:00.000Z"),
        lt: new Date(new Date(dateStr).getTime() + 24 * 60 * 60 * 1000),
      },
      status: { in: ["PUBLISHED", "APPROVED"] },
    },
    include: { venue: { select: { name: true } } },
  });

  for (const event of eventsOnDate) {
    const candidateFp = buildFingerprint(
      event.startAt,
      event.venue?.name ?? "",
      event.title
    );
    if (candidateFp === fingerprint) return { eventId: event.id };
  }

  const titleNorm = fingerprint.split("|")[2];
  for (const event of eventsOnDate) {
    const eventVenue = event.venue?.name ?? "";
    if (normalizeVenue(eventVenue) !== normalizeVenue(venueName)) continue;
    const eventTitleNorm = event.title.toLowerCase().replace(/\s+/g, " ");
    const sim = similarity(titleNorm, eventTitleNorm);
    if (sim >= 0.8) return { eventId: event.id };
  }

  return null;
}

function normalizeVenue(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim();
}
