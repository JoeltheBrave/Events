"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { Category } from "@/lib/types";

const POPULAR_CITIES = [
  "London",
  "Manchester",
  "Birmingham",
  "Leeds",
  "Glasgow",
  "Liverpool",
  "Bristol",
  "Brighton",
  "Edinburgh",
  "Cardiff",
];

export function EventFilters({
  categories,
  currentCategory,
  currentCity,
}: {
  categories: Category[];
  currentCategory?: string;
  currentCity?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(key: "category" | "city", value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/events?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 items-center text-sm">
      <span className="text-slate-500 dark:text-slate-400">Category:</span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("category", null)}
          className={`px-3 py-1.5 rounded-full ${
            !currentCategory
              ? "bg-sky-600 text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setFilter("category", cat.slug)}
            className={`px-3 py-1.5 rounded-full ${
              currentCategory === cat.slug
                ? "bg-sky-600 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
      <span className="text-slate-500 dark:text-slate-400 ml-4">City:</span>
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("city", null)}
          className={`px-3 py-1.5 rounded-full ${
            !currentCity
              ? "bg-sky-600 text-white"
              : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
          }`}
        >
          All
        </button>
        {POPULAR_CITIES.map((city) => (
          <button
            key={city}
            onClick={() => setFilter("city", city)}
            className={`px-3 py-1.5 rounded-full ${
              currentCity === city
                ? "bg-sky-600 text-white"
                : "bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600"
            }`}
          >
            {city}
          </button>
        ))}
      </div>
    </div>
  );
}
