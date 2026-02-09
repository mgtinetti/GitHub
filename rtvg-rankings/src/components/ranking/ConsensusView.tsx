import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";
import type { ConsensusEntry, User } from "@/types";

interface ConsensusViewProps {
  entries: ConsensusEntry[];
  users: User[];
}

export default function ConsensusView({ entries, users }: ConsensusViewProps) {
  if (entries.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <p className="text-gray-500">
          Not enough data to generate consensus rankings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <Link
          href={`/show/${entry.show.id}`}
          key={`${entry.show.id}-${entry.season.id}`}
          className={cn(
            "glass rounded-2xl p-4 border border-white/5 hover:border-amber-500/20 transition-all group block",
            entry.consensus_position <= 3 && "accent-glow"
          )}
        >
          <div className="flex items-center gap-4">
            {/* Rank */}
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0",
                entry.consensus_position <= 3
                  ? "rank-badge-top3 text-black"
                  : "bg-white/5 text-gray-400"
              )}
            >
              {entry.consensus_position}
            </div>

            {/* Poster */}
            <div className="relative w-12 h-[4.5rem] rounded-lg overflow-hidden shrink-0">
              <Image
                src={entry.show.poster_url}
                alt={entry.show.title}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>

            {/* Info */}
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-white truncate group-hover:text-amber-500 transition-colors">
                {entry.show.title}
              </h3>
              <p className="text-xs text-gray-400">
                Season {entry.season.season_number} &middot;{" "}
                {entry.show.network}
              </p>
            </div>

            {/* Average */}
            <div className="text-right shrink-0 hidden sm:block">
              <p className="text-xs text-gray-500 uppercase tracking-wider">
                Avg Rank
              </p>
              <p className="text-lg font-black text-amber-500">
                {entry.average_rank.toFixed(1)}
              </p>
            </div>
          </div>

          {/* User ranks breakdown */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
            {users.map((user) => {
              const rank = entry.user_ranks[user.id];
              return (
                <div
                  key={user.id}
                  className="flex-1 flex items-center gap-2 bg-white/5 rounded-lg px-3 py-1.5"
                >
                  <span className="text-xs text-gray-400 truncate">
                    {user.display_name}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-bold ml-auto",
                      rank ? "text-gray-200" : "text-gray-600"
                    )}
                  >
                    {rank ? `#${rank}` : "—"}
                  </span>
                </div>
              );
            })}
          </div>
        </Link>
      ))}
    </div>
  );
}
