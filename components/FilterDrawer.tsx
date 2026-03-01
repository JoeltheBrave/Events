"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { CgChip } from "@/components/CgChip";

export interface FilterDrawerProps {
  venues?: { id: string; name: string }[];
  genreTags?: string[];
  ageRestrictions?: string[];
}

export function FilterDrawer({
  venues = [],
  genreTags = [],
  ageRestrictions = ["All ages", "18+", "21+"],
}: FilterDrawerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";
  const venueId = searchParams.get("venue") ?? "";
  const genre = searchParams.get("genre") ?? "";
  const age = searchParams.get("age") ?? "";

  function setParam(key: string, value: string | null) {
    const next = new URLSearchParams(searchParams.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.push(`/events?${next.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-4 items-center text-sm">
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-slate-500 dark:text-slate-400">Date:</span>
        <input
          type="date"
          value={from}
          onChange={(e) => setParam("from", e.target.value || null)}
          className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
        />
        <span className="text-slate-400">–</span>
        <input
          type="date"
          value={to}
          onChange={(e) => setParam("to", e.target.value || null)}
          className="rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-sm"
        />
      </div>
      {venues.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-500 dark:text-slate-400">Venue:</span>
          <button
            onClick={() => setParam("venue", null)}
            className="contents"
          >
            <CgChip active={!venueId}>All</CgChip>
          </button>
          {venues.map((v) => (
            <button
              key={v.id}
              onClick={() => setParam("venue", venueId === v.id ? "" : v.id)}
              className="contents"
            >
              <CgChip active={venueId === v.id}>{v.name}</CgChip>
            </button>
          ))}
        </div>
      )}
      {genreTags.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-slate-500 dark:text-slate-400">Genre:</span>
          <button onClick={() => setParam("genre", null)} className="contents">
            <CgChip active={!genre}>All</CgChip>
          </button>
          {genreTags.map((g) => (
            <button
              key={g}
              onClick={() => setParam("genre", genre === g ? "" : g)}
              className="contents"
            >
              <CgChip active={genre === g}>{g}</CgChip>
            </button>
          ))}
        </div>
      )}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-slate-500 dark:text-slate-400">Age:</span>
        <button onClick={() => setParam("age", null)} className="contents">
          <CgChip active={!age}>Any</CgChip>
        </button>
        {ageRestrictions.map((a) => (
          <button
            key={a}
            onClick={() => setParam("age", age === a ? "" : a)}
            className="contents"
          >
            <CgChip active={age === a}>{a}</CgChip>
          </button>
        ))}
      </div>
    </div>
  );
}
