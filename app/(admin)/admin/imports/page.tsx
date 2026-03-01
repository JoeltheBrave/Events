import Link from "next/link";

export default function AdminImportsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Imports</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Platform imports (PlatformEvent) and matching status. Run the Eventbrite pull job to populate; match status is updated by the matching engine.
      </p>
    </div>
  );
}
