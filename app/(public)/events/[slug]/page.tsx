import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicEventBySlug } from "@/lib/public-data";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();

  const artistNames = event.artists?.map((a) => a.name).join(", ") || event.title;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <p className="text-sm text-sky-600 dark:text-sky-400 mb-2">
        <Link href={`/events?category=${event.category?.slug}`}>{event.category?.name}</Link>
      </p>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
        {artistNames}
      </h1>
      <dl className="space-y-2 text-slate-600 dark:text-slate-400">
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Date
          </dt>
          <dd>{formatDate(event.event_date)}</dd>
        </div>
        {event.doors_at && (
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
              Doors
            </dt>
            <dd>{formatTime(event.doors_at)}</dd>
          </div>
        )}
        <div>
          <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
            Venue
          </dt>
          <dd>
            <Link
              href={`/venues/${event.venue?.slug}?city=${encodeURIComponent(event.venue?.city ?? "")}`}
              className="text-sky-600 dark:text-sky-400 hover:underline"
            >
              {event.venue?.name}
              {event.venue?.city ? `, ${event.venue.city}` : ""}
            </Link>
          </dd>
        </div>
        {event.artists?.length ? (
          <div>
            <dt className="text-xs uppercase tracking-wider text-slate-500 dark:text-slate-500">
              Artist{event.artists.length > 1 ? "s" : ""}
            </dt>
            <dd className="flex flex-wrap gap-2">
              {event.artists.map((a) => (
                <Link
                  key={a.id}
                  href={`/artists/${a.slug}`}
                  className="text-sky-600 dark:text-sky-400 hover:underline"
                >
                  {a.name}
                </Link>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>
      {event.ticket_url && (
        <a
          href={event.ticket_url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 inline-block px-6 py-3 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700"
        >
          Get tickets
        </a>
      )}
    </div>
  );
}
