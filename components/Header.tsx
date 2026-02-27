import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link
          href="/"
          className="text-xl font-semibold text-slate-900 dark:text-white hover:text-sky-600 dark:hover:text-sky-400"
        >
          Events
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link
            href="/events"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            All events
          </Link>
          <Link
            href="/whatson/london"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            London
          </Link>
          <Link
            href="/artists"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Artists
          </Link>
          <Link
            href="/venues"
            className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Venues
          </Link>
        </nav>
      </div>
    </header>
  );
}
