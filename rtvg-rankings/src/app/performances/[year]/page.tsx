import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { YEARS } from "@/lib/constants";
import { USERS, PERFORMANCE_RANKINGS_2025 } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `Best TV Performances of ${year}`,
    description: `The best individual acting performances of ${year} as ranked by Tinetti, Chubbs & Poteete`,
  };
}

export default async function PerformanceRankingsPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!YEARS.includes(year as (typeof YEARS)[number])) notFound();

  const perfRankings =
    year === 2025 ? PERFORMANCE_RANKINGS_2025 : ({} as Record<string, never[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-xs mb-2 block">
          Supplementary List
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          Best Performances of{" "}
          <span className="text-amber-500">{year}</span>
        </h1>
        <p className="text-gray-400">
          Top individual acting performances of the year.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href={`/episodes/${year}`}
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
          >
            Episode Rankings &rarr;
          </Link>
          <Link
            href="/all-time"
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
          >
            All-Time &rarr;
          </Link>
        </div>
      </div>

      {/* Side by side performance rankings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {USERS.map((user) => {
          const performances = perfRankings[user.id] || [];
          return (
            <div key={user.id}>
              <div className="flex items-center gap-3 mb-4 px-1">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-amber-500/50">
                  <Image
                    src={user.avatar_url}
                    alt={user.display_name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <h2 className="text-lg font-bold">{user.display_name}</h2>
                <div className="flex-grow h-px bg-white/10" />
              </div>

              <div className="space-y-3">
                {performances.map((perf) => (
                  <div
                    key={perf.id}
                    className="glass rounded-xl p-4 border border-white/5 hover:border-amber-500/20 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0",
                          perf.rank_position <= 3
                            ? "rank-badge-top3 text-black"
                            : "bg-white/5 text-gray-400"
                        )}
                      >
                        {perf.rank_position}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-white text-sm">
                          {perf.actor_name}
                        </h4>
                        {perf.character_name && (
                          <p className="text-xs text-gray-400 italic">
                            as {perf.character_name}
                          </p>
                        )}
                        <p className="text-[11px] text-amber-500/70 mt-1">
                          {perf.show?.title} S{perf.season?.season_number}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {performances.length === 0 && (
                  <div className="glass rounded-xl p-6 text-center">
                    <p className="text-gray-500 text-sm">No performance rankings yet</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
