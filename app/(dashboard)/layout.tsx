import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/dashboard" className="font-semibold text-slate-900 dark:text-white">
            Dashboard
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard/events" className="text-slate-600 dark:text-slate-300 hover:text-white">
              Events
            </Link>
            <Link href="/dashboard/integrations" className="text-slate-600 dark:text-slate-300 hover:text-white">
              Integrations
            </Link>
            <Link href="/me" className="text-slate-600 dark:text-slate-300 hover:text-white">
              Me
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
