import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 text-sm text-slate-500 dark:text-slate-400">
        <div className="flex flex-wrap gap-6">
          <Link href="/events" className="hover:text-slate-700 dark:hover:text-slate-300">
            All events
          </Link>
          <Link href="/whatson/london" className="hover:text-slate-700 dark:hover:text-slate-300">
            London
          </Link>
          <Link href="/artists" className="hover:text-slate-700 dark:hover:text-slate-300">
            Artists
          </Link>
          <Link href="/venues" className="hover:text-slate-700 dark:hover:text-slate-300">
            Venues
          </Link>
        </div>
        <p className="mt-4">Live music, comedy, theatre and shows across the UK.</p>
      </div>
    </footer>
  );
}
