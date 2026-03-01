import { Suspense } from "react";
import { getPublicEvents, getPublicCategories } from "@/lib/public-data";
import { EventCard } from "@/components/EventCard";
import { EventFilters } from "@/components/EventFilters";

type SearchParams = { category?: string; city?: string; from?: string; to?: string; venue?: string; genre?: string };

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [events, categories] = await Promise.all([
    getPublicEvents({
      genre: params.genre ?? params.category ?? undefined,
      city: params.city ?? undefined,
      from: params.from ?? undefined,
      to: params.to ?? undefined,
      venueId: params.venue ?? undefined,
      limit: 60,
    }),
    getPublicCategories(),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        All events
      </h1>
      <Suspense fallback={null}>
        <EventFilters categories={categories} currentCategory={params.genre ?? params.category} currentCity={params.city} />
      </Suspense>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        {events.map((event) => (
          <EventCard key={event.id} event={event} />
        ))}
      </div>
      {events.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400 py-8">No events match your filters.</p>
      )}
    </div>
  );
}
