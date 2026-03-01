"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CgButton } from "@/components/CgButton";

type EventRow = {
  id: string;
  slug: string;
  title: string;
  startAt: string;
  venue: { name: string; city: string } | null;
  artists: { name: string }[];
  createdAt: string;
};

export function ModerationEventsList() {
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function fetchEvents() {
    const res = await fetch("/api/admin/moderation/events");
    const data = await res.json();
    if (res.ok) setEvents(data.events ?? []);
    setLoading(false);
  }

  useEffect(() => {
    fetchEvents();
  }, []);

  async function handleAction(eventId: string, action: "approve" | "reject") {
    await fetch("/api/admin/moderation/events", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ eventId, action }),
    });
    setEvents((prev) => prev.filter((e) => e.id !== eventId));
  }

  if (loading) return <p className="text-slate-500">Loading…</p>;
  if (events.length === 0) return <p className="text-slate-500">No events awaiting moderation.</p>;

  return (
    <ul className="space-y-4">
      {events.map((e) => (
        <li
          key={e.id}
          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 dark:border-slate-700 p-4"
        >
          <div>
            <Link href={`/events/${e.slug}`} className="font-medium text-sky-600 dark:text-sky-400 hover:underline">
              {e.title}
            </Link>
            <p className="text-sm text-slate-500">
              {new Date(e.startAt).toLocaleString()} · {e.venue ? `${e.venue.name}, ${e.venue.city}` : "No venue"}
              {e.artists.length ? ` · ${e.artists.map((a) => a.name).join(", ")}` : ""}
            </p>
          </div>
          <div className="flex gap-2">
            <CgButton size="sm" onClick={() => handleAction(e.id, "approve")}>Approve</CgButton>
            <CgButton size="sm" variant="destructive" onClick={() => handleAction(e.id, "reject")}>Reject</CgButton>
          </div>
        </li>
      ))}
    </ul>
  );
}
