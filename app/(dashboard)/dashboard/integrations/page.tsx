import Link from "next/link";
import { CgButton } from "@/components/CgButton";

export default function IntegrationsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Integrations</h1>
      <p className="text-slate-600 dark:text-slate-400 mb-6">
        Connect your event platforms to adopt events and manage them here.
      </p>
      <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 flex items-center justify-between">
        <div>
          <h2 className="font-medium text-slate-900 dark:text-white">Eventbrite</h2>
          <p className="text-sm text-slate-500">Import and adopt your Eventbrite events</p>
        </div>
        <a href="/api/integrations/eventbrite/oauth">
          <CgButton variant="outline">Connect Eventbrite</CgButton>
        </a>
      </div>
      <p className="mt-4 text-sm text-slate-500">
        <Link href="/dashboard/adopt/eventbrite" className="text-sky-600 hover:underline">Adopt Eventbrite events</Link> after connecting.
      </p>
    </div>
  );
}
