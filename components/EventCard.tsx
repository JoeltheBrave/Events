import Link from "next/link";
import type { EventWithRelations } from "@/lib/types";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function EventCard({ event }: { event: EventWithRelations }) {
  const artistNames = event.artists?.map((a) => a.name).join(", ") || event.title;

  return (
    <article className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 overflow-hidden hover:border-sky-300 dark:hover:border-sky-600 transition-colors">
      <Link href={`/events/${event.slug}`} className="block p-4">
        <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">
          {artistNames}
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {formatDate(event.event_date)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
          {event.venue?.name}
          {event.venue?.city ? `, ${event.venue.city}` : ""}
        </p>
        {event.category && (
          <span className="inline-block mt-2 text-xs text-sky-600 dark:text-sky-400">
            {event.category.name}
          </span>
        )}
      </Link>
      {event.ticket_url && (
        <div className="px-4 pb-4">
          <a
            href={event.ticket_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline"
          >
            Tickets →
          </a>
        </div>
      )}
    </article>
  );
}
