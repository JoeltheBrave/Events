import Link from "next/link";
import { getVenues } from "@/lib/data";

export default async function VenuesPage() {
  const venues = await getVenues();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Venues
      </h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {venues.map((venue) => (
          <li key={venue.id}>
            <Link
              href={`/venues/${venue.slug}?city=${encodeURIComponent(venue.city)}`}
              className="block py-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
            >
              <span className="font-medium">{venue.name}</span>
              <span className="text-slate-500 dark:text-slate-400 text-sm ml-1">
                {venue.city}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      {venues.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">No venues yet.</p>
      )}
    </div>
  );
}
