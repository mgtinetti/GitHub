import Image from "next/image";
import type { DisagreementEntry, User } from "@/types";

interface DisagreementsViewProps {
  entries: DisagreementEntry[];
  users: User[];
}

export default function DisagreementsView({
  entries,
  users,
}: DisagreementsViewProps) {
  if (entries.length === 0) {
    return (
      <div className="glass rounded-3xl p-12 text-center">
        <p className="text-gray-500">No disagreements found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {entries.slice(0, 20).map((entry, i) => (
        <div
          key={`${entry.show.id}-${entry.season.id}`}
          className="glass rounded-2xl p-4 border border-white/5 hover:border-red-500/20 transition-all group"
        >
          <div className="flex items-center gap-4">
            {/* Spread Badge */}
            <div className="w-14 h-14 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col items-center justify-center shrink-0">
              <span className="text-lg font-black text-red-400">
                {entry.spread}
              </span>
              <span className="text-[8px] text-red-400/60 uppercase tracking-wider">
                spread
              </span>
            </div>

            {/* Poster */}
            <div className="relative w-10 h-[3.75rem] rounded-lg overflow-hidden shrink-0">
              <Image
                src={entry.show.poster_url}
                alt={entry.show.title}
                fill
                className="object-cover"
                sizes="40px"
              />
            </div>

            {/* Show Info */}
            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-white truncate">
                {entry.show.title}
              </h3>
              <p className="text-xs text-gray-400">
                Season {entry.season.season_number}
              </p>
            </div>
          </div>

          {/* Rank breakdown */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-white/5">
            {users.map((user) => {
              const rank = entry.user_ranks[user.id];
              if (rank === undefined) return null;

              const ranks = Object.values(entry.user_ranks);
              const isHighest = rank === Math.min(...ranks);
              const isLowest = rank === Math.max(...ranks);

              return (
                <div
                  key={user.id}
                  className={`flex-1 flex items-center gap-2 rounded-lg px-3 py-1.5 ${
                    isHighest
                      ? "bg-emerald-500/10 border border-emerald-500/20"
                      : isLowest
                      ? "bg-red-500/10 border border-red-500/20"
                      : "bg-white/5"
                  }`}
                >
                  <span className="text-xs text-gray-400 truncate">
                    {user.display_name}
                  </span>
                  <span
                    className={`text-sm font-bold ml-auto ${
                      isHighest
                        ? "text-emerald-400"
                        : isLowest
                        ? "text-red-400"
                        : "text-gray-300"
                    }`}
                  >
                    #{rank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
