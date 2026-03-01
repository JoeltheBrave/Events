"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { CgButton } from "@/components/CgButton";

type Venue = { id: string; name: string; slug: string; city: string };
type Artist = { id: string; name: string; slug: string };

export default function SubmitPage() {
  const { status } = useSession();
  const [venues, setVenues] = useState<Venue[]>([]);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [venueId, setVenueId] = useState("");
  const [artistIds, setArtistIds] = useState<string[]>([]);
  const [genreTags, setGenreTags] = useState("");
  const [ageRestriction, setAgeRestriction] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/public/venues-list")
      .then((r) => r.json())
      .then((d) => setVenues(d.venues ?? []))
      .catch(() => {});
    fetch("/api/public/artists-list")
      .then((r) => r.json())
      .then((d) => setArtists(d.artists ?? []))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await fetch("/api/dashboard/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title,
        description: description || undefined,
        startAt: startAt || undefined,
        endAt: endAt || undefined,
        venueId: venueId || undefined,
        artistIds: artistIds.length ? artistIds : undefined,
        genreTags: genreTags ? genreTags.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
        ageRestriction: ageRestriction || undefined,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Submission failed");
      return;
    }
    setDone(true);
  }

  if (status === "unauthenticated") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Submit an event</h1>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          <Link href="/login" className="text-sky-600 dark:text-sky-400 hover:underline">Sign in</Link> to submit an event.
        </p>
      </div>
    );
  }

  if (done) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Event submitted</h1>
        <p className="text-slate-600 dark:text-slate-400">
          Thanks! Your event has been submitted for review.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Submit an event</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Start date & time *</label>
            <input
              type="datetime-local"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              required
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">End date & time</label>
            <input
              type="datetime-local"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Venue</label>
          <select
            value={venueId}
            onChange={(e) => setVenueId(e.target.value)}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="">Select venue</option>
            {venues.map((v) => (
              <option key={v.id} value={v.id}>{v.name}, {v.city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Artists (hold Ctrl for multiple)</label>
          <select
            multiple
            value={artistIds}
            onChange={(e) => setArtistIds(Array.from(e.target.selectedOptions, (o) => o.value))}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            {artists.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Genres (comma-separated)</label>
          <input
            type="text"
            value={genreTags}
            onChange={(e) => setGenreTags(e.target.value)}
            placeholder="e.g. rock, indie"
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Age restriction</label>
          <select
            value={ageRestriction}
            onChange={(e) => setAgeRestriction(e.target.value)}
            className="w-full rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm"
          >
            <option value="">Any</option>
            <option value="All ages">All ages</option>
            <option value="18+">18+</option>
            <option value="21+">21+</option>
          </select>
        </div>
        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
        <CgButton type="submit" disabled={loading}>{loading ? "Submitting…" : "Submit event"}</CgButton>
      </form>
    </div>
  );
}
