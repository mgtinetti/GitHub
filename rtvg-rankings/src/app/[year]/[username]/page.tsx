import { notFound } from "next/navigation";
import { YEARS } from "@/lib/constants";
import { USERS, getRankingsByYear } from "@/lib/mock-data";
import RankingCard from "@/components/ranking/RankingCard";

interface Props {
  params: Promise<{ year: string; username: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year, username } = await params;
  const user = USERS.find(
    (u) => u.display_name.toLowerCase() === username.toLowerCase()
  );
  if (!user) return { title: "Not Found" };
  return {
    title: `${user.display_name}'s Top TV Shows of ${year}`,
    description: `${user.display_name}'s complete TV season rankings for ${year}`,
  };
}

export default async function UserRankingsPage({ params }: Props) {
  const { year: yearStr, username } = await params;
  const year = parseInt(yearStr, 10);
  if (!YEARS.includes(year as (typeof YEARS)[number])) notFound();

  const user = USERS.find(
    (u) => u.display_name.toLowerCase() === username.toLowerCase()
  );
  if (!user) notFound();

  const rankings = getRankingsByYear(year);
  const userRankings = rankings[user.id] || [];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/50">
            <img
              src={user.avatar_url}
              alt={user.display_name}
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              {user.display_name}&apos;s{" "}
              <span className="text-amber-500">{year}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {userRankings.length} shows ranked &middot; Last updated Feb 6,
              2026
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {userRankings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">
              {userRankings.length}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Shows Ranked
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">
              {(
                userRankings.reduce((sum, e) => sum + (e.score || 0), 0) /
                userRankings.filter((e) => e.score).length
              ).toFixed(1)}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Avg Score
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">
              {
                userRankings.filter(
                  (e) => e.rewatchability === "Instant Classic"
                ).length
              }
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Instant Classics
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">
              {new Set(userRankings.flatMap((e) => e.show?.genres || [])).size}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Genres
            </p>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userRankings.map((entry) => (
          <RankingCard key={entry.id} entry={entry} />
        ))}
      </div>

      {userRankings.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">
            No rankings yet for {year}.
          </p>
        </div>
      )}
    </div>
  );
}
