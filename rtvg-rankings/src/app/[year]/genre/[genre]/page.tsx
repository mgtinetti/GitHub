"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchRankingsForYear } from "@/lib/supabase/queries";
import { generateConsensusRankings, cn } from "@/lib/utils";
import GenreFilter from "@/components/ranking/GenreFilter";
import type { ConsensusEntry, User } from "@/types";

export default function GenrePage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);
  const genre = decodeURIComponent(params.genre as string);

  const [entries, setEntries] = useState<ConsensusEntry[]>([]);
  const [allGenres, setAllGenres] = useState<string[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { rankings, users: u } = await fetchRankingsForYear(year);
      setUsers(u);

      const consensus = generateConsensusRankings(rankings);

      // Collect all genres
      const genreSet = new Set<string>();
      consensus.forEach((e) => e.show?.genres?.forEach((g) => genreSet.add(g)));

      // Filter consensus by genre and re-number positions
      const filtered = consensus
        .filter((e) =>
          e.show?.genres?.some((g) => g.toLowerCase() === genre.toLowerCase())
        )
        .map((e, i) => ({ ...e, consensus_position: i + 1 }));

      setEntries(filtered);
      setAllGenres(Array.from(genreSet).sort());
      setLoading(false);
    }
    loadData();
  }, [year, genre]);

  const genreDisplay = genre
    .split(/[\s&]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" & ");

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-8">
        <Link
          href={`/${year}`}
          className="text-sm text-gray-500 hover:text-amber-500 transition-colors mb-4 block"
        >
          &larr; Back to {year} Rankings
        </Link>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          {year}{" "}
          <span className="text-amber-500">{genreDisplay}</span>
        </h1>
        <p className="text-gray-400">
          Consensus rankings filtered to {genreDisplay}. Shows ranked by at least 2 of 3 contributors.
        </p>
      </div>

      {!loading && allGenres.length > 0 && (
        <div className="mb-8">
          <GenreFilter genres={allGenres} year={year} activeGenre={genre} />
        </div>
      )}

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading genre rankings...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">
            No {genreDisplay} shows found in the {year} consensus rankings.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {entries.map((entry) => (
            <div
              key={`${entry.show.id}-${entry.season.id}`}
              className={cn(
                "glass rounded-2xl p-4 border border-white/5 hover:border-amber-500/20 transition-all group",
                entry.consensus_position <= 3 && "accent-glow"
              )}
            >
              <div className="flex items-center gap-4">
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

                <div className="relative w-12 h-[4.5rem] rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={entry.show.poster_url || "/placeholder-poster.svg"}
                    alt={entry.show.title}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                </div>

                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-white truncate group-hover:text-amber-500 transition-colors">
                    {entry.show.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    Season {entry.season.season_number} &middot;{" "}
                    {entry.show.network}
                  </p>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {entry.show.genres?.map((g) => (
                      <span key={g} className={cn(
                        "text-[9px] px-1.5 py-0.5 rounded-full uppercase tracking-wider",
                        g.toLowerCase() === genre.toLowerCase()
                          ? "bg-amber-500/20 text-amber-400"
                          : "bg-white/5 text-gray-500"
                      )}>
                        {g}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <p className="text-xs text-gray-500 uppercase tracking-wider">
                    Avg Rank
                  </p>
                  <p className="text-lg font-black text-amber-500">
                    {entry.average_rank.toFixed(1)}
                  </p>
                </div>
              </div>

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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
