import { notFound } from "next/navigation";
import Image from "next/image";
import { YEARS } from "@/lib/constants";
import { USERS, AWARD_CATEGORIES, AWARD_PICKS } from "@/lib/mock-data";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `TV Awards & Superlatives ${year}`,
    description: `Our personal TV awards ceremony for ${year}. Votes cast, arguments had, and group winners declared.`,
  };
}

export default async function AwardsPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (isNaN(year) || year < 2000 || year > 2100) notFound();

  const categories = AWARD_CATEGORIES.filter((c) => c.year === year);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-16">
        <span className="text-amber-500 font-mono uppercase tracking-[0.5em] text-xs mb-4 block">
          Year End Superlatives
        </span>
        <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 italic uppercase">
          {year} <span className="text-amber-500">Awards</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Our personal TV awards ceremony. Votes cast, arguments had, and group
          winners declared.
        </p>
      </div>

      {/* Award Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categories.map((category) => {
          const picks = AWARD_PICKS.filter(
            (p) => p.category_id === category.id
          );

          // Determine group winner (majority)
          const pickCounts: Record<string, number> = {};
          picks.forEach((p) => {
            if (p.season_id) {
              pickCounts[p.season_id] = (pickCounts[p.season_id] || 0) + 1;
            }
          });
          const winnerSeasonId = Object.entries(pickCounts).sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0];
          const winnerPick = picks.find(
            (p) => p.season_id === winnerSeasonId
          );
          const isUnanimous =
            winnerSeasonId && pickCounts[winnerSeasonId] === picks.length;

          return (
            <div
              key={category.id}
              className="relative group rounded-3xl glass p-6 md:p-8 overflow-hidden border border-white/5 hover:border-amber-500/30 transition-all"
            >
              {/* Unanimous badge */}
              {isUnanimous && (
                <div className="absolute top-4 right-4 bg-amber-500/20 text-amber-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-amber-500/30 animate-pulse-glow">
                  Unanimous
                </div>
              )}

              {/* Category Header */}
              <div className="mb-6">
                <span className="text-amber-500 text-3xl mb-3 block">
                  {category.name.includes("Disappointing") ||
                  category.name.includes("Overrated")
                    ? "😬"
                    : "🏆"}
                </span>
                <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight mb-2">
                  {category.name}
                </h2>
                <div className="h-0.5 w-12 bg-amber-500" />
              </div>

              {/* Group Winner */}
              {winnerPick && winnerPick.show && winnerPick.season && (
                <div className="bg-white/5 p-4 rounded-2xl border border-white/5 mb-4">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block mb-3">
                    Group Winner
                  </span>
                  <div className="flex items-center gap-4">
                    <div className="relative w-14 h-20 rounded-lg overflow-hidden shadow-xl shrink-0">
                      <Image
                        src={winnerPick.show.poster_url}
                        alt={winnerPick.show.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white">
                        {winnerPick.show.title}
                      </h4>
                      <p className="text-xs text-amber-500 font-bold uppercase tracking-widest">
                        Season {winnerPick.season.season_number}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Individual Picks */}
              <div className="space-y-2">
                {USERS.map((user) => {
                  const pick = picks.find((p) => p.user_id === user.id);
                  return (
                    <div
                      key={user.id}
                      className="flex items-center justify-between text-sm px-4 py-2.5 rounded-xl bg-white/5 border border-white/5"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative w-6 h-6 rounded-full overflow-hidden">
                          <Image
                            src={user.avatar_url}
                            alt={user.display_name}
                            fill
                            className="object-cover"
                            sizes="24px"
                          />
                        </div>
                        <span className="text-gray-400 font-medium">
                          {user.display_name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-200">
                          {pick?.show?.title || "—"}{" "}
                          {pick?.season
                            ? `S${pick.season.season_number}`
                            : ""}
                        </span>
                        {pick?.blurb && (
                          <p className="text-[10px] text-gray-500 mt-0.5 italic max-w-[200px] text-right">
                            &ldquo;{pick.blurb}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">
            No awards have been created for {year} yet.
          </p>
        </div>
      )}
    </div>
  );
}
