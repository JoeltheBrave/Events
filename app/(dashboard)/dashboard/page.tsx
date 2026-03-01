import Link from "next/link";

export default function DashboardPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Dashboard</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">Your events, integrations, and feed.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/me"
          className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-sky-300 dark:hover:border-sky-600"
        >
          <h2 className="font-medium text-slate-900 dark:text-white">My feed</h2>
          <p className="text-sm text-slate-500">Events from who you follow</p>
        </Link>
        <Link
          href="/dashboard/events"
          className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-sky-300 dark:hover:border-sky-600"
        >
          <h2 className="font-medium text-slate-900 dark:text-white">Your events</h2>
          <p className="text-sm text-slate-500">Events you can edit</p>
        </Link>
        <Link
          href="/dashboard/integrations"
          className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 hover:border-sky-300 dark:hover:border-sky-600"
        >
          <h2 className="font-medium text-slate-900 dark:text-white">Integrations</h2>
          <p className="text-sm text-slate-500">Connect Eventbrite</p>
        </Link>
      </div>
    </div>
  );
}
