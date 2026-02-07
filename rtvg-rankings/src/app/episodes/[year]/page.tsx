import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { YEARS } from "@/lib/constants";
import { USERS, EPISODE_RANKINGS_2025 } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

interface Props {
  params: Promise<{ year: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { year } = await params;
  return {
    title: `Best TV Episodes of ${year}`,
    description: `The best individual episodes of ${year} as ranked by Tinetti, Chubbs & Poteete`,
  };
}

export default async function EpisodeRankingsPage({ params }: Props) {
  const { year: yearStr } = await params;
  const year = parseInt(yearStr, 10);
  if (!YEARS.includes(year as (typeof YEARS)[number])) notFound();

  const episodeRankings =
    year === 2025 ? EPISODE_RANKINGS_2025 : ({} as Record<string, never[]>);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-xs mb-2 block">
          Supplementary List
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          Best Episodes of{" "}
          <span className="text-amber-500">{year}</span>
        </h1>
        <p className="text-gray-400">
          Our top individual episodes of the year, ranked.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href={`/performances/${year}`}
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
          >
            Performance Rankings &rarr;
          </Link>
          <Link
            href="/all-time"
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
          >
            All-Time &rarr;
          </Link>
        </div>
      </div>

      {/* Side by side episode rankings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {USERS.map((user) => {
          const episodes = episodeRankings[user.id] || [];
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

              <div className="space-y-2">
                {episodes.map((ep) => (
                  <div
                    key={ep.id}
                    className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/10 transition-all"
                  >
                    <div
                      className={cn(
                        "w-8 h-8 flex items-center justify-center font-bold text-lg shrink-0",
                        ep.rank_position <= 3
                          ? "text-amber-500"
                          : "text-gray-500"
                      )}
                    >
                      {ep.rank_position}
                    </div>
                    <div className="relative w-10 h-14 shrink-0 overflow-hidden rounded-md">
                      <Image
                        src={ep.show?.poster_url || "/placeholder-poster.svg"}
                        alt={ep.show?.title || ""}
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">
                        {ep.episode_title}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate">
                        {ep.show?.title} &middot; S{ep.season_number}E
                        {ep.episode_number}
                      </p>
                    </div>
                  </div>
                ))}

                {episodes.length === 0 && (
                  <div className="glass rounded-xl p-6 text-center">
                    <p className="text-gray-500 text-sm">No episode rankings yet</p>
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
