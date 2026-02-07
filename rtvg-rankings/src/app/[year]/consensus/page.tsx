import { notFound } from "next/navigation";
import { YEARS } from "@/lib/constants";
import { USERS, getRankingsByYear } from "@/lib/mock-data";
import { generateConsensusRankings } from "@/lib/utils";
import ConsensusView from "@/components/ranking/ConsensusView";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `Consensus Rankings ${year}`,
    description: `Group consensus TV season rankings for ${year} — averaged across Tinetti, Chubbs & Poteete`,
  };
}

export default async function ConsensusPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!YEARS.includes(year as (typeof YEARS)[number])) notFound();

  const rankings = getRankingsByYear(year);
  const consensus = generateConsensusRankings(rankings);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          {year}{" "}
          <span className="text-amber-500">Consensus</span>
        </h1>
        <p className="text-gray-400">
          Aggregate rankings based on average position across all contributors.
        </p>
      </div>

      <ConsensusView entries={consensus} users={USERS} />
    </div>
  );
}
