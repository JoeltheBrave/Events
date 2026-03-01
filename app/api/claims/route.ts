import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/permissions/me";

/**
 * POST: request a page claim (venue/artist/promoter ownership).
 */
export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await request.json();
  const { entityType, entityId, method, evidence } = body as {
    entityType?: string;
    entityId?: string;
    method?: string;
    evidence?: object;
  };
  if (!entityType || !entityId || !method) {
    return NextResponse.json({ error: "entityType, entityId and method required" }, { status: 400 });
  }
  if (!["Venue", "Artist", "Promoter"].includes(entityType)) {
    return NextResponse.json({ error: "Invalid entityType" }, { status: 400 });
  }
  const claim = await prisma.pageClaim.create({
    data: {
      entityType,
      entityId,
      userId,
      method,
      status: "pending",
      evidence: evidence ?? undefined,
    },
  });
  return NextResponse.json({ ok: true, id: claim.id });
}
