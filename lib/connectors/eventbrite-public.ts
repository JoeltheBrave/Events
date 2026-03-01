/**
 * Eventbrite public API pull (Cardiff events).
 * Store as PlatformEvent with fingerprint; matching runs separately.
 */
import { prisma } from "@/lib/prisma";
import { buildFingerprint } from "@/lib/matching/fingerprint";
import { findMatchingEvent } from "@/lib/matching/match";

const PLATFORM = "eventbrite";

export async function pullEventbriteCardiffEvents(): Promise<{ created: number; matched: number }> {
  if (!process.env.DATABASE_URL) return { created: 0, matched: 0 };
  // Stub: no Eventbrite API key in env → return. In production, call Eventbrite API and map to PlatformEvent.
  const apiToken = process.env.EVENTBRITE_PUBLIC_TOKEN;
  if (!apiToken) return { created: 0, matched: 0 };

  let created = 0;
  let matched = 0;
  // Example: fetch from https://www.eventbriteapi.com/v3/events/search/?location.address=Cardiff
  // For each: upsert PlatformEvent, run findMatchingEvent, set matchedEventId if found, create TicketLink
  const mockEvents: { id: string; name: string; start: string; venue: string }[] = [];
  for (const raw of mockEvents) {
    const startAt = new Date(raw.start);
    const fingerprint = buildFingerprint(startAt, raw.venue, raw.name);
    let platformEvent = await prisma.platformEvent.findFirst({
      where: { platform: PLATFORM, externalId: raw.id },
    });
    if (platformEvent) {
      await prisma.platformEvent.update({
        where: { id: platformEvent.id },
        data: { lastSeenAt: new Date(), rawJson: raw as unknown as object },
      });
    } else {
      platformEvent = await prisma.platformEvent.create({
        data: {
          platform: PLATFORM,
          externalId: raw.id,
          rawJson: raw as unknown as object,
          fingerprint,
          matchStatus: "pending",
        },
      });
    }

    const match = await findMatchingEvent(startAt, raw.venue, raw.name);
    if (match) {
      await prisma.platformEvent.update({
        where: { id: platformEvent.id },
        data: { matchedEventId: match.eventId, matchStatus: "matched" },
      });
      const existingLink = await prisma.ticketLink.findFirst({
        where: { eventId: match.eventId, platform: PLATFORM },
      });
      if (!existingLink) {
        await prisma.ticketLink.create({
          data: { eventId: match.eventId, platform: PLATFORM, url: `https://eventbrite.com/e/${raw.id}` },
        });
      }
      matched++;
    } else created++;
  }
  return { created, matched };
}
