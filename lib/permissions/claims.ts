import { prisma } from "@/lib/prisma";

/**
 * User can edit event if they are ADMIN, or have an active EventClaim for this event,
 * or are a member of the event's venue/artist/promoter.
 */
export async function canEditEvent(userId: string, eventId: string): Promise<boolean> {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: {
      venueId: true,
      promoterId: true,
      claims: { where: { revokedAt: null }, select: { userId: true } },
    },
  });
  if (!event) return false;

  const [isAdmin, hasClaim, venueMember, artistMember, promoterMember] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { role: true } }).then((u) => u?.role === "ADMIN"),
    event.claims.some((c) => c.userId === userId),
    event.venueId
      ? prisma.venueMember.findUnique({ where: { venueId_userId: { venueId: event.venueId, userId } } }).then(Boolean)
      : false,
    prisma.eventArtist.findFirst({ where: { eventId }, select: { artistId: true } }).then(async (ea) => {
      if (!ea) return false;
      return prisma.artistMember.findUnique({ where: { artistId_userId: { artistId: ea.artistId, userId } } }).then(Boolean);
    }),
    event.promoterId
      ? prisma.promoterMember.findUnique({ where: { promoterId_userId: { promoterId: event.promoterId, userId } } }).then(Boolean)
      : false,
  ]);

  return isAdmin || hasClaim || venueMember || artistMember || promoterMember;
}
