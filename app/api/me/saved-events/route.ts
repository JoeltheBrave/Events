import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/permissions/me";

export async function POST(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { eventId } = body as { eventId?: string };
    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
    const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true } });
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });
    await prisma.savedEvent.upsert({
      where: { userId_eventId: { userId, eventId } },
      create: { userId, eventId },
      update: {},
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("SavedEvent POST:", e);
    return NextResponse.json({ error: "Failed to save event" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const body = await request.json();
    const { eventId } = body as { eventId?: string };
    if (!eventId) return NextResponse.json({ error: "eventId required" }, { status: 400 });
    await prisma.savedEvent.deleteMany({
      where: { userId, eventId },
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("SavedEvent DELETE:", e);
    return NextResponse.json({ error: "Failed to unsave event" }, { status: 500 });
  }
}
