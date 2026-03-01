import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.user?.role !== "ADMIN") redirect("/dashboard");
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link href="/admin/moderation/events" className="font-semibold text-slate-900 dark:text-white">
            Admin
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/admin/moderation/events" className="text-slate-600 dark:text-slate-300 hover:text-white">
              Moderation
            </Link>
            <Link href="/admin/claims" className="text-slate-600 dark:text-slate-300 hover:text-white">
              Claims
            </Link>
            <Link href="/admin/imports" className="text-slate-600 dark:text-slate-300 hover:text-white">
              Imports
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
