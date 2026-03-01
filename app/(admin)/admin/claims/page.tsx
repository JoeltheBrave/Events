import Link from "next/link";

export default function AdminClaimsPage() {
  return (
    <div>
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Claims</h1>
      <p className="text-slate-600 dark:text-slate-400">
        Review venue, artist and promoter ownership claims. Use the database or a future admin API to list and approve PageClaim records.
      </p>
    </div>
  );
}
