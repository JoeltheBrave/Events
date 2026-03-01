"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function CgHeaderAuth() {
  const { data: session, status } = useSession();
  if (status === "loading") return <span className="text-slate-400">…</span>;
  if (session?.user) {
    return (
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white">
          Dashboard
        </Link>
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/" })}
          className="text-sky-600 dark:text-sky-400 hover:underline"
        >
          Sign out
        </button>
      </div>
    );
  }
  return (
    <Link href="/login" className="text-sky-600 dark:text-sky-400 hover:underline">
      Sign in
    </Link>
  );
}
