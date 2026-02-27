import { notFound } from "next/navigation";
import { getEvents, getCities } from "@/lib/data";
import { EventCard } from "@/components/EventCard";
import Link from "next/link";

function slugToCity(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(" ");
}

export default async function WhatsonCityPage({
  params,
}: {
  params: Promise<{ city: string }>;
}) {
  const { city: citySlug } = await params;
  const cityName = slugToCity(citySlug);
  const [events, cities] = await Promise.all([
    getEvents({ city: cityName, limit: 60 }),
    getCities(),
  ]);

  const cityMatch = cities.find(
    (c) => c.city.toLowerCase() === cityName.toLowerCase()
  );
  if (!cityMatch && events.length === 0) notFound();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        What’s on in {cityName}
      </h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Upcoming events in {cityName}.
      </p>
      <div className="flex flex-wrap gap-2 mb-6 text-sm">
        <span className="text-slate-500 dark:text-slate-400">Other cities:</span>
        {cities.slice(0, 12).map((c) => (
          <Link
            key={c.city}
            href={`/whatson/${c.city.toLowerCase().replace(/\s+/g, "-")}`}
            className="text-sky-600 dark:text-sky-400 hover:underline"
          >
            {c.city}
          </Link>
        ))}
      </div>
      {events.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400">
          No upcoming events in {cityName} yet.
        </p>
      )}
    </div>
  );
}
