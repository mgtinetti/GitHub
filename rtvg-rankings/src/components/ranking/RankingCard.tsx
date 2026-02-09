import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { REWATCH_ICONS } from "@/lib/constants";
import type { RankingEntry } from "@/types";

interface RankingCardProps {
  entry: RankingEntry;
  compact?: boolean;
  highlighted?: boolean;
}

export default function RankingCard({
  entry,
  compact = false,
  highlighted = false,
}: RankingCardProps) {
  const show = entry.show;
  const season = entry.season;
  if (!show || !season) return null;

  if (compact) {
    return (
      <Link
        href={`/show/${show.id}`}
        className={cn(
          "flex items-center gap-3 p-2.5 rounded-xl glass hover:bg-white/10 transition-all cursor-pointer group",
          highlighted && "ring-2 ring-amber-500 bg-amber-500/5"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 flex items-center justify-center font-bold text-lg shrink-0",
            entry.rank_position <= 3 ? "text-amber-500" : "text-gray-500"
          )}
        >
          {entry.rank_position}
        </div>
        <div className="relative w-10 h-14 shrink-0 overflow-hidden rounded-md">
          <Image
            src={show.poster_url}
            alt={show.title}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="flex-grow min-w-0">
          <h4 className="font-bold text-sm truncate group-hover:text-white transition-colors">
            {show.title}
          </h4>
          <p className="text-xs text-gray-400">
            S{season.season_number} &middot; {show.network}
          </p>
        </div>
        {entry.score && (
          <span className="text-xs font-bold text-amber-500/80 shrink-0">
            {entry.score}
          </span>
        )}
      </Link>
    );
  }

  return (
    <Link
      href={`/show/${show.id}`}
      className={cn(
        "relative overflow-hidden group rounded-2xl glass p-4 hover:shadow-2xl hover:shadow-amber-500/5 transition-all border border-white/5 hover:border-amber-500/20 block",
        highlighted && "ring-1 ring-amber-500/50"
      )}
    >
      {/* Rank Badge */}
      <div
        className={cn(
          "absolute -top-1 -left-1 w-12 h-12 flex items-center justify-center text-lg font-black rounded-br-2xl z-10",
          entry.rank_position <= 3
            ? "rank-badge-top3 text-black"
            : "bg-white/10 text-gray-300"
        )}
      >
        #{entry.rank_position}
      </div>

      <div className="flex gap-4 sm:gap-5">
        {/* Poster */}
        <div className="relative shrink-0 w-28 sm:w-36 aspect-[2/3] overflow-hidden rounded-xl shadow-2xl">
          <Image
            src={show.poster_url}
            alt={show.title}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            sizes="(max-width: 640px) 112px, 144px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
            <span className="text-[10px] font-bold text-white uppercase tracking-widest">
              {show.network}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="flex flex-col justify-between flex-grow py-1 min-w-0">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="text-lg sm:text-xl font-bold leading-tight group-hover:text-white truncate">
                {show.title}
              </h3>
              {entry.score && (
                <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold whitespace-nowrap shrink-0">
                  ★ {entry.score}/10
                </div>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-3">
              Season {season.season_number} &middot; {show.network}
            </p>

            {/* Genre Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {show.genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-wider"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>

          {/* Footer info */}
          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/5 pt-3">
            <div className="flex items-center gap-1.5">
              <span className="opacity-70">Episodes:</span>
              <span className="font-medium text-gray-200">
                {season.episode_count}
              </span>
            </div>
            {entry.rewatchability && (
              <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-lg">
                <span className="text-sm" title={entry.rewatchability}>
                  {REWATCH_ICONS[entry.rewatchability]}
                </span>
                <span className="font-semibold text-gray-300 hidden sm:inline">
                  {entry.rewatchability}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
