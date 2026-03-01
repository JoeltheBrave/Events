import { notFound } from "next/navigation";
import { getPublicVenueBySlug, getPublicVenueEvents } from "@/lib/public-data";
import { EventCard } from "@/components/EventCard";

export default async function VenuePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ city?: string }>;
}) {
  const { slug } = await params;
  const { city } = await searchParams;
  const venue = await getPublicVenueBySlug(slug, city ?? undefined);
  if (!venue) notFound();

  const events = await getPublicVenueEvents(venue.id);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
        {venue.name}
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        {venue.city}
        {venue.region ? `, ${venue.region}` : ""}
      </p>
      <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
        Upcoming events
      </h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          No upcoming events at {venue.name}.
        </p>
      )}
    </div>
  );
}
