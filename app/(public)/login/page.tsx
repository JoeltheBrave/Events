"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { CgButton } from "@/components/CgButton";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password");
      return;
    }
    if (res?.ok) window.location.href = "/dashboard";
  }

  return (
    <div className="max-w-sm mx-auto px-4 py-12">
      <h1 className="text-xl font-bold text-slate-900 dark:text-white mb-4">Sign in</h1>
      <form onSubmit={handleCredentials} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <CgButton type="submit" disabled={loading} className="w-full">
          {loading ? "Signing in…" : "Sign in"}
        </CgButton>
      </form>
      {process.env.NEXT_PUBLIC_GOOGLE_ENABLED !== "false" && (
        <div className="mt-4">
          <CgButton
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            Sign in with Google
          </CgButton>
        </div>
      )}
      <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
        No account? <Link href="/register" className="text-sky-600 dark:text-sky-400 hover:underline">Register</Link>
      </p>
    </div>
  );
}
