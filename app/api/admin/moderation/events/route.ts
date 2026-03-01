import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/permissions/admin";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const events = await prisma.event.findMany({
    where: { status: "SUBMITTED" },
    include: {
      venue: { select: { id: true, name: true, slug: true, city: true } },
      artists: { include: { artist: { select: { id: true, name: true, slug: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      slug: e.slug,
      title: e.title,
      startAt: e.startAt.toISOString(),
      venue: e.venue,
      artists: e.artists.map((ea) => ea.artist),
      createdAt: e.createdAt.toISOString(),
    })),
  });
}

export async function PATCH(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await request.json();
  const { eventId, action } = body as { eventId?: string; action?: string };
  if (!eventId || !action || !["approve", "reject"].includes(action)) {
    return NextResponse.json({ error: "eventId and action (approve|reject) required" }, { status: 400 });
  }
  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { id: true, status: true } });
  if (!event || event.status !== "SUBMITTED") {
    return NextResponse.json({ error: "Event not found or not submitted" }, { status: 404 });
  }
  await prisma.event.update({
    where: { id: eventId },
    data: { status: action === "approve" ? "PUBLISHED" : "REJECTED" },
  });
  return NextResponse.json({ ok: true });
}
