import { notFound } from "next/navigation";
import Link from "next/link";
import { YEARS } from "@/lib/constants";
import { USERS, getRankingsByYear } from "@/lib/mock-data";
import SideBySideView from "@/components/ranking/SideBySideView";
import GenreFilter from "@/components/ranking/GenreFilter";
import type { RankingEntry } from "@/types";

interface Props {
  params: Promise<{ year: string; genre: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year, genre } = await params;
  const genreDisplay = genre.charAt(0).toUpperCase() + genre.slice(1);
  return {
    title: `Best ${genreDisplay} Shows of ${year}`,
    description: `${genreDisplay} TV season rankings for ${year}`,
  };
}

export default async function GenrePage({ params }: Props) {
  const { year: yearStr, genre } = await params;
  const year = parseInt(yearStr, 10);
  if (!YEARS.includes(year as (typeof YEARS)[number])) notFound();

  const rankings = getRankingsByYear(year);

  // Filter rankings by genre
  const filteredRankings: Record<string, RankingEntry[]> = {};
  const allGenres = new Set<string>();

  for (const [userId, entries] of Object.entries(rankings)) {
    entries.forEach((e) => e.show?.genres.forEach((g) => allGenres.add(g)));

    const filtered = entries
      .filter((e) =>
        e.show?.genres.some(
          (g) => g.toLowerCase() === genre.toLowerCase()
        )
      )
      .map((e, i) => ({ ...e, rank_position: i + 1 }));

    filteredRankings[userId] = filtered;
  }

  const genreDisplay = genre.charAt(0).toUpperCase() + genre.slice(1);
  const genres = Array.from(allGenres).sort();

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-8">
        <Link
          href={`/${year}`}
          className="text-sm text-gray-500 hover:text-amber-500 transition-colors mb-4 block"
        >
          &larr; Back to {year} Rankings
        </Link>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          {year}{" "}
          <span className="text-amber-500">{genreDisplay}</span>
        </h1>
        <p className="text-gray-400">
          {genreDisplay} shows filtered from {year} rankings.
        </p>
      </div>

      <div className="mb-8">
        <GenreFilter genres={genres} year={year} activeGenre={genre} />
      </div>

      <SideBySideView
        rankings={filteredRankings}
        users={USERS}
        year={year}
        limit={20}
      />
    </div>
  );
}
