import Link from "next/link";
import { getPublicArtists } from "@/lib/public-data";

export default async function ArtistsPage() {
  const artists = await getPublicArtists();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">
        Artists
      </h1>
      <ul className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
        {artists.map((artist) => (
          <li key={artist.id}>
            <Link
              href={`/artists/${artist.slug}`}
              className="block py-2 text-slate-700 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400"
            >
              {artist.name}
            </Link>
          </li>
        ))}
      </ul>
      {artists.length === 0 && (
        <p className="text-slate-500 dark:text-slate-400">No artists yet.</p>
      )}
    </div>
  );
}
