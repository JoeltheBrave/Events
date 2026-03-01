import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getFeedForUser } from "@/lib/public-data";
import { EventCard } from "@/components/EventCard";

export default async function MePage() {
  const session = await getSession();
  const userId = session?.user?.id ?? "";
  const feedEvents = userId ? await getFeedForUser(userId, { limit: 20 }) : [];

  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Me</h1>
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-3">My feed</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
          Events from venues, artists and promoters you follow.
        </p>
        {feedEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {feedEvents.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">
            Follow some <Link href="/venues" className="text-sky-600 hover:underline">venues</Link>,{" "}
            <Link href="/artists" className="text-sky-600 hover:underline">artists</Link> or{" "}
            <Link href="/promoters" className="text-sky-600 hover:underline">promoters</Link> to see events here.
          </p>
        )}
      </section>
    </div>
  );
}
