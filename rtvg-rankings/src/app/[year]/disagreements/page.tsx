import { notFound } from "next/navigation";
import { YEARS } from "@/lib/constants";
import { USERS, getRankingsByYear } from "@/lib/mock-data";
import { generateDisagreements } from "@/lib/utils";
import DisagreementsView from "@/components/ranking/DisagreementsView";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `Biggest Disagreements ${year}`,
    description: `See where Matt, Mike & Jake disagree most on their ${year} TV rankings`,
  };
}

export default async function DisagreementsPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!YEARS.includes(year as (typeof YEARS)[number])) notFound();

  const rankings = getRankingsByYear(year);
  const disagreements = generateDisagreements(rankings);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          {year}{" "}
          <span className="text-red-400">Disagreements</span>
        </h1>
        <p className="text-gray-400">
          Shows where our rankings differ the most. Sorted by spread.
        </p>
      </div>

      <DisagreementsView entries={disagreements} users={USERS} />
    </div>
  );
}
