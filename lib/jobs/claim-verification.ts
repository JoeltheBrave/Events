/**
 * Nightly job: verify EventClaims via platform API; set revokedAt if invalid.
 */
import { prisma } from "@/lib/prisma";

export async function verifyAllClaims(): Promise<{ checked: number; revoked: number }> {
  if (!process.env.DATABASE_URL) return { checked: 0, revoked: 0 };
  const claims = await prisma.eventClaim.findMany({
    where: { revokedAt: null },
    include: { event: { select: { id: true } } },
  });
  let revoked = 0;
  for (const claim of claims) {
    // Stub: in production call Eventbrite API to verify token and event still exists
    const isValid = true;
    if (!isValid) {
      await prisma.eventClaim.update({
        where: { id: claim.id },
        data: { revokedAt: new Date() },
      });
      revoked++;
    }
  }
  return { checked: claims.length, revoked };
}
