import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/permissions/me";

const ENTITY_TYPES = ["Venue", "Artist", "Promoter"] as const;

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { entityType, entityId } = body as { entityType?: string; entityId?: string };
    if (!entityType || !entityId || !ENTITY_TYPES.includes(entityType as typeof ENTITY_TYPES[number])) {
      return NextResponse.json({ error: "Invalid entityType or entityId" }, { status: 400 });
    }
    const exists = await checkEntityExists(entityType, entityId);
    if (!exists) return NextResponse.json({ error: "Entity not found" }, { status: 404 });
    await prisma.follow.upsert({
      where: {
        userId_entityType_entityId: { userId, entityType, entityId },
      },
      create: { userId, entityType, entityId },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Follow POST:", e);
    return NextResponse.json({ error: "Failed to follow" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { entityType, entityId } = body as { entityType?: string; entityId?: string };
    if (!entityType || !entityId) {
      return NextResponse.json({ error: "entityType and entityId required" }, { status: 400 });
    }
    await prisma.follow.deleteMany({
      where: { userId, entityType, entityId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Follow DELETE:", e);
    return NextResponse.json({ error: "Failed to unfollow" }, { status: 500 });
  }
}

async function checkEntityExists(entityType: string, entityId: string): Promise<boolean> {
  if (entityType === "Venue") {
    const v = await prisma.venue.findUnique({ where: { id: entityId }, select: { id: true } });
    return !!v;
  }
  if (entityType === "Artist") {
    const a = await prisma.artist.findUnique({ where: { id: entityId }, select: { id: true } });
    return !!a;
  }
  if (entityType === "Promoter") {
    const p = await prisma.promoter.findUnique({ where: { id: entityId }, select: { id: true } });
    return !!p;
  }
  return false;
}
