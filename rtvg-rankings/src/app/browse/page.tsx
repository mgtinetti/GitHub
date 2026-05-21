"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { YEARS } from "@/lib/constants";
import { fetchRankingsForYear, fetchActiveYears } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import type { RankingEntry, User } from "@/types";

const USER_COLORS = [
  { bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/30", dot: "bg-amber-500" },
  { bg: "bg-sky-500/10", text: "text-sky-400", border: "border-sky-500/30", dot: "bg-sky-500" },
  { bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/30", dot: "bg-rose-500" },
];

interface RankedShow {
  showId: string;
  title: string;
  posterUrl: string;
  network: string;
  genres: string[];
  seasonNumber: number;
  seasonId: string;
  avgRank: number;
  avgScore: number | null;
  rankedByCount: number;
  userRanks: Record<string, { rank: number; score: number | null }>;
}

export default function BrowsePage() {
  const [year, setYear] = useState<number>(YEARS[0]);
  const [allYears, setAllYears] = useState<number[]>([...YEARS]);
  const [rankings, setRankings] = useState<Record<string, RankingEntry[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedNetworks, setSelectedNetworks] = useState<Set<string>>(
    new Set()
  );

  useEffect(() => {
    fetchActiveYears().then((active: number[]) => {
      const merged = [...new Set([...active, ...YEARS])].sort(
        (a: number, b: number) => b - a
      );
      setAllYears(merged);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRankingsForYear(year).then(
      ({ rankings: r, users: u }: { rankings: Record<string, RankingEntry[]>; users: User[] }) => {
        setRankings(r);
        setUsers(u);
        setLoading(false);
      }
    );
  }, [year]);

  const rankedShows = useMemo(() => {
    const showMap = new Map<
      string,
      {
        showId: string;
        title: string;
        posterUrl: string;
        network: string;
        genres: string[];
        seasonNumber: number;
        seasonId: string;
        totalRank: number;
        totalScore: number;
        scoredCount: number;
        count: number;
        userRanks: Record<string, { rank: number; score: number | null }>;
      }
    >();

    for (const userId of Object.keys(rankings)) {
      for (const entry of rankings[userId] || []) {
        if (!entry.show || !entry.season) continue;
        const key = entry.season_id;
        if (!showMap.has(key)) {
          showMap.set(key, {
            showId: entry.show.id,
            title: entry.show.title,
            posterUrl: entry.show.poster_url,
            network: entry.show.network,
            genres: entry.show.genres,
            seasonNumber: entry.season.season_number,
            seasonId: entry.season_id,
            totalRank: 0,
            totalScore: 0,
            scoredCount: 0,
            count: 0,
            userRanks: {},
          });
        }
        const data = showMap.get(key)!;
        data.totalRank += entry.rank_position;
        data.count++;
        data.userRanks[userId] = {
          rank: entry.rank_position,
          score: entry.score,
        };
        if (entry.score != null) {
          data.totalScore += entry.score;
          data.scoredCount++;
        }
      }
    }

    const shows: RankedShow[] = Array.from(showMap.values()).map((d) => ({
      showId: d.showId,
      title: d.title,
      posterUrl: d.posterUrl,
      network: d.network,
      genres: d.genres,
      seasonNumber: d.seasonNumber,
      seasonId: d.seasonId,
      avgRank: d.totalRank / d.count,
      avgScore: d.scoredCount > 0 ? d.totalScore / d.scoredCount : null,
      rankedByCount: d.count,
      userRanks: d.userRanks,
    }));

    return shows.sort((a: RankedShow, b: RankedShow) => a.avgRank - b.avgRank);
  }, [rankings]);

  const allNetworks = useMemo(() => {
    const nets = new Set<string>();
    for (const show of rankedShows) {
      if (show.network && show.network !== "Unknown") {
        nets.add(show.network);
      }
    }
    return [...nets].sort();
  }, [rankedShows]);

  const networkRankings = useMemo(() => {
    const netMap: Record<string, { totalRank: number; count: number }> = {};
    for (const show of rankedShows) {
      if (!show.network || show.network === "Unknown") continue;
      if (!netMap[show.network]) netMap[show.network] = { totalRank: 0, count: 0 };
      netMap[show.network].totalRank += show.avgRank;
      netMap[show.network].count++;
    }
    return Object.entries(netMap)
      .map(([network, d]) => ({
        network,
        avgRank: d.totalRank / d.count,
        showCount: d.count,
      }))
      .filter((n) => n.showCount >= 2)
      .sort((a, b) => a.avgRank - b.avgRank);
  }, [rankedShows]);

  const filteredShows = useMemo(() => {
    if (selectedNetworks.size === 0) return rankedShows;
    return rankedShows.filter((s: RankedShow) => selectedNetworks.has(s.network));
  }, [rankedShows, selectedNetworks]);

  function toggleNetwork(network: string) {
    setSelectedNetworks((prev) => {
      const next = new Set(prev);
      if (next.has(network)) {
        next.delete(network);
      } else {
        next.add(network);
      }
      return next;
    });
  }

  function selectAll() {
    setSelectedNetworks(new Set(allNetworks));
  }

  function clearAll() {
    setSelectedNetworks(new Set());
  }

  const hasData = rankedShows.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-10">
        <span className="text-emerald-500 font-mono uppercase tracking-[0.5em] text-xs mb-4 block">
          Filter &amp; Discover
        </span>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-3">
          Browse by{" "}
          <span className="text-emerald-500">Service</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Select one or more streaming services to see our ranked shows on those
          platforms, ordered by average group ranking.
        </p>
      </div>

      {/* Year selector */}
      <div className="flex gap-2 justify-center flex-wrap mb-8">
        {allYears.map((y: number) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              y === year
                ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      ) : !hasData ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">No rankings data for {year}.</p>
        </div>
      ) : (
        <>
          {/* Service leaderboard */}
          {networkRankings.length > 0 && (
            <div className="glass rounded-2xl p-5 border border-white/5 mb-8">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                Service Rankings — By Average Show Rank
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
                {networkRankings.map((net, i: number) => {
                  const medal =
                    i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                  return (
                    <button
                      key={net.network}
                      onClick={() => {
                        setSelectedNetworks(new Set([net.network]));
                      }}
                      className={cn(
                        "shrink-0 flex items-center gap-3 px-4 py-3 rounded-xl border transition-all hover:border-emerald-500/30",
                        i < 3
                          ? "bg-emerald-500/5 border-emerald-500/15"
                          : "bg-white/5 border-white/5"
                      )}
                    >
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0",
                          i < 3
                            ? "bg-emerald-500 text-black"
                            : "bg-white/10 text-gray-400"
                        )}
                      >
                        {medal || i + 1}
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-white whitespace-nowrap">
                          {net.network}{" "}
                          <span className="text-gray-500 font-normal">
                            ({net.showCount})
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Avg rank{" "}
                          <span className="text-emerald-400 font-bold">
                            #{net.avgRank.toFixed(1)}
                          </span>
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Network filter */}
          <div className="glass rounded-2xl p-5 border border-white/5 mb-8">
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Streaming Services
              </p>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-[10px] text-emerald-500 hover:text-emerald-400 font-bold uppercase tracking-wider transition-colors"
                >
                  Select All
                </button>
                <span className="text-gray-700">|</span>
                <button
                  onClick={clearAll}
                  className="text-[10px] text-gray-500 hover:text-white font-bold uppercase tracking-wider transition-colors"
                >
                  Clear
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {allNetworks.map((network: string) => {
                const isSelected = selectedNetworks.has(network);
                const count = rankedShows.filter(
                  (s: RankedShow) => s.network === network
                ).length;
                return (
                  <button
                    key={network}
                    onClick={() => toggleNetwork(network)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border",
                      isSelected
                        ? "bg-emerald-500 text-black border-emerald-500 shadow-lg shadow-emerald-500/10"
                        : "bg-white/5 text-gray-400 border-white/10 hover:border-emerald-500/30 hover:text-white"
                    )}
                  >
                    {network}{" "}
                    <span
                      className={
                        isSelected ? "text-black/50" : "text-gray-600"
                      }
                    >
                      ({count})
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Results summary + legend */}
          <div className="flex items-center justify-between mb-6 px-1 flex-wrap gap-3">
            <p className="text-sm text-gray-400">
              {selectedNetworks.size === 0 ? (
                <span className="text-gray-500 italic">
                  Select a service above to filter — showing all{" "}
                  {rankedShows.length} shows
                </span>
              ) : (
                <>
                  <span className="text-emerald-500 font-bold">
                    {filteredShows.length}
                  </span>{" "}
                  {filteredShows.length === 1 ? "show" : "shows"} on{" "}
                  {[...selectedNetworks].join(", ")}
                </>
              )}
            </p>
            <div className="hidden md:flex items-center gap-4">
              {users.map((u: User, i: number) => {
                const color = USER_COLORS[i % USER_COLORS.length];
                return (
                  <div key={u.id} className="flex items-center gap-1.5">
                    <div className={cn("w-2.5 h-2.5 rounded-sm", color.dot)} />
                    <span className="text-[10px] text-gray-400 font-medium">
                      {u.display_name}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Shows list */}
          <div className="space-y-2">
            {filteredShows.map((show: RankedShow, i: number) => (
              <Link
                key={show.seasonId}
                href={`/show/${show.showId}`}
                className="flex items-center gap-4 p-4 rounded-xl glass border border-white/5 hover:border-emerald-500/20 transition-all group"
              >
                {/* Position */}
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black shrink-0",
                    i < 3
                      ? "bg-gradient-to-br from-amber-500 to-amber-600 text-black"
                      : "bg-white/5 text-gray-400"
                  )}
                >
                  {i + 1}
                </div>

                {/* Poster */}
                <div className="relative w-11 h-16 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={show.posterUrl || "/placeholder-poster.svg"}
                    alt={show.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="44px"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-white group-hover:text-emerald-500 transition-colors truncate">
                    {show.title}{" "}
                    <span className="text-gray-500 font-normal">
                      S{show.seasonNumber}
                    </span>
                  </p>
                  <div className="flex items-center gap-3 mt-0.5">
                    <span className="text-[11px] text-emerald-500 font-bold">
                      {show.network}
                    </span>
                    <span className="text-[10px] text-gray-600">
                      {show.genres.slice(0, 3).join(", ")}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  {/* Avg rank */}
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                      Avg Rank
                    </p>
                    <p className="text-lg font-black text-white">
                      #{show.avgRank.toFixed(1)}
                    </p>
                  </div>

                  {/* Avg score */}
                  {show.avgScore != null && (
                    <div className="text-right">
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Avg Score
                      </p>
                      <p className="text-lg font-black text-amber-500">
                        {show.avgScore.toFixed(1)}
                      </p>
                    </div>
                  )}

                  {/* Individual ranks */}
                  <div className="flex gap-1">
                    {users.map((u: User, idx: number) => {
                      const data = show.userRanks[u.id];
                      const color = USER_COLORS[idx % USER_COLORS.length];
                      return (
                        <div
                          key={u.id}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-bold border",
                            data
                              ? `${color.bg} ${color.text} ${color.border}`
                              : "bg-white/5 text-gray-600 border-white/5"
                          )}
                          title={`${u.display_name}: ${data ? `#${data.rank}` : "N/A"}`}
                        >
                          {data ? `#${data.rank}` : "—"}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile stats */}
                <div className="md:hidden text-right shrink-0">
                  <p className="text-sm font-black text-white">
                    #{show.avgRank.toFixed(1)}
                  </p>
                  {show.avgScore != null && (
                    <p className="text-[10px] text-amber-500 font-bold">
                      {show.avgScore.toFixed(1)}/10
                    </p>
                  )}
                  <p className="text-[10px] text-gray-600">
                    {show.rankedByCount}/{users.length} ranked
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {filteredShows.length === 0 && selectedNetworks.size > 0 && (
            <div className="glass rounded-2xl p-12 text-center mt-4">
              <p className="text-gray-500">
                No ranked shows on{" "}
                {[...selectedNetworks].join(", ")} for {year}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
