import { notFound } from "next/navigation";
import { YEARS } from "@/lib/constants";
import { USERS, getRankingsByYear } from "@/lib/mock-data";
import { generateConsensusRankings, generateDisagreements } from "@/lib/utils";
import YearRankingsClient from "./YearRankingsClient";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateStaticParams() {
  return YEARS.map((year) => ({ year: String(year) }));
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `Best TV Shows of ${year}`,
    description: `See how Tinetti, Chubbs & Poteete ranked the best TV seasons of ${year}`,
  };
}

export default async function YearRankingsPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!YEARS.includes(year as (typeof YEARS)[number])) {
    notFound();
  }

  const rankings = getRankingsByYear(year);
  const consensus = generateConsensusRankings(rankings);
  const disagreements = generateDisagreements(rankings);

  // Extract all genres from this year's rankings
  const genreSet = new Set<string>();
  Object.values(rankings).forEach((entries) =>
    entries.forEach((e) => e.show?.genres.forEach((g) => genreSet.add(g)))
  );
  const genres = Array.from(genreSet).sort();

  return (
    <YearRankingsClient
      year={year}
      rankings={rankings}
      consensus={consensus}
      disagreements={disagreements}
      users={USERS}
      genres={genres}
    />
  );
}
