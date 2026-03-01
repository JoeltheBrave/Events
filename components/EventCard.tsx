import Link from "next/link";
import { Calendar, MapPin, ExternalLink } from "lucide-react";
import { CgCard } from "@/components/CgCard";
import { CgBadge } from "@/components/CgBadge";
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
  const ticketUrl = event.ticket_url ?? null;

  return (
    <CgCard>
      <article>
        <Link href={`/events/${event.slug}`} className="block p-4">
          <h3 className="font-medium text-slate-900 dark:text-white line-clamp-2">
            {artistNames}
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5 shrink-0" />
            {formatDate(event.event_date)}
          </p>
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 shrink-0" />
            {event.venue?.name}
            {event.venue?.city ? `, ${event.venue.city}` : ""}
          </p>
          {event.category && (
            <span className="inline-block mt-2">
              <CgBadge variant="secondary" className="text-xs">
                {event.category.name}
              </CgBadge>
            </span>
          )}
        </Link>
        {ticketUrl && (
          <div className="px-4 pb-4">
            <a
              href={ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-medium text-sky-600 dark:text-sky-400 hover:underline inline-flex items-center gap-1"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Tickets
            </a>
          </div>
        )}
      </article>
    </CgCard>
  );
}
