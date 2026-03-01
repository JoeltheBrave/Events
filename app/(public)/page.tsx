import Link from "next/link";
import {
  getPublicUpcoming,
  getPublicFeaturedByGenre,
} from "@/lib/public-data";
import { EventCard } from "@/components/EventCard";

export default async function HomePage() {
  const [onSaleSoon, music, comedy, theatre] = await Promise.all([
    getPublicUpcoming(8),
    getPublicFeaturedByGenre("music", 8),
    getPublicFeaturedByGenre("comedy", 8),
    getPublicFeaturedByGenre("theatre", 8),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
          Cardiff Gig Guide — Live music, comedy, theatre
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Find gigs, shows and events in Cardiff. No clutter — just what’s on.
        </p>
      </section>

      {onSaleSoon.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
            On sale soon
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {onSaleSoon.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {music.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Music</h2>
            <Link
              href="/events?category=music"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              All music
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {music.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {comedy.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Comedy</h2>
            <Link
              href="/events?category=comedy"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              All comedy
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comedy.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {theatre.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Theatre &amp; Arts
            </h2>
            <Link
              href="/events?category=theatre"
              className="text-sm text-sky-600 dark:text-sky-400 hover:underline"
            >
              All theatre
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {theatre.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </section>
      )}

      {onSaleSoon.length === 0 && music.length === 0 && comedy.length === 0 && theatre.length === 0 && (
        <section className="py-12 text-center text-slate-500 dark:text-slate-400">
          <p className="mb-4">No events yet. Browse events or add your own.</p>
          <Link href="/events" className="text-sky-600 dark:text-sky-400 hover:underline">
            Browse events
          </Link>
        </section>
      )}
    </div>
  );
}
