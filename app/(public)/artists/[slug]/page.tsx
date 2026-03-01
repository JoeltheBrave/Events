import { notFound } from "next/navigation";
import { getPublicArtistBySlug, getPublicArtistEvents } from "@/lib/public-data";
import { EventCard } from "@/components/EventCard";

export default async function ArtistPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [artist, events] = await Promise.all([
    getPublicArtistBySlug(slug),
    getPublicArtistEvents(slug),
  ]);
  if (!artist) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {artist.name}
      </h1>
      <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-6">
        Tour dates
      </h2>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          No upcoming events for {artist.name}.
        </p>
      )}
    </div>
  );
}
