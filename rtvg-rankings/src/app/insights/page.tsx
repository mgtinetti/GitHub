"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { YEARS, TIER_ICONS } from "@/lib/constants";
import { fetchRankingsForYear, fetchActiveYears } from "@/lib/supabase/queries";
import {
  generateConsensusRankings,
  generateDisagreements,
  cn,
} from "@/lib/utils";
import type {
  RankingEntry,
  User,
  ConsensusEntry,
  DisagreementEntry,
  Tier,
} from "@/types";

interface UserStats {
  totalShows: number;
  averageScore: number;
  averageRank: number;
  highestScore: { title: string; score: number; season: number } | null;
  lowestScore: { title: string; score: number; season: number } | null;
  topGenres: { genre: string; count: number }[];
  topNetworks: { network: string; count: number }[];
  tierBreakdown: Record<string, number>;
  instantClassics: string[];
}

interface VennGroup {
  userIds: string[];
  label: string;
  shows: {
    title: string;
    poster_url: string;
    season_number: number;
    avgRank: number;
    genres: string[];
  }[];
}

function computeUserStats(
  entries: RankingEntry[],
): UserStats {
  const scores = entries.filter((e) => e.score != null).map((e) => e.score!);
  const averageScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
  const averageRank =
    entries.length > 0
      ? entries.reduce((a, b) => a + b.rank_position, 0) / entries.length
      : 0;

  const withScore = entries.filter((e) => e.score != null && e.show && e.season);
  const sorted = [...withScore].sort((a, b) => b.score! - a.score!);
  const highestScore =
    sorted.length > 0
      ? {
          title: sorted[0].show!.title,
          score: sorted[0].score!,
          season: sorted[0].season!.season_number,
        }
      : null;
  const lowestScore =
    sorted.length > 0
      ? {
          title: sorted[sorted.length - 1].show!.title,
          score: sorted[sorted.length - 1].score!,
          season: sorted[sorted.length - 1].season!.season_number,
        }
      : null;

  const genreCounts: Record<string, number> = {};
  const networkCounts: Record<string, number> = {};
  const tierBreakdown: Record<string, number> = {};
  const instantClassics: string[] = [];

  for (const entry of entries) {
    if (entry.show) {
      for (const g of entry.show.genres) {
        genreCounts[g] = (genreCounts[g] || 0) + 1;
      }
      networkCounts[entry.show.network] =
        (networkCounts[entry.show.network] || 0) + 1;
    }
    if (entry.tier) {
      tierBreakdown[entry.tier] =
        (tierBreakdown[entry.tier] || 0) + 1;
      if (
        entry.tier === "Instant Classic" &&
        entry.show
      ) {
        instantClassics.push(entry.show.title);
      }
    }
  }

  const topGenres = Object.entries(genreCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([genre, count]) => ({ genre, count }));
  const topNetworks = Object.entries(networkCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([network, count]) => ({ network, count }));

  return {
    totalShows: entries.length,
    averageScore,
    averageRank,
    highestScore,
    lowestScore,
    topGenres,
    topNetworks,
    tierBreakdown,
    instantClassics,
  };
}

function computeVennGroups(
  rankings: Record<string, RankingEntry[]>,
  users: User[],
): VennGroup[] {
  const showByUser: Record<string, Set<string>> = {};
  const showData: Record<
    string,
    { title: string; poster_url: string; season_number: number; ranks: number[]; genres: string[] }
  > = {};

  for (const user of users) {
    showByUser[user.id] = new Set();
    for (const entry of rankings[user.id] || []) {
      if (!entry.show || !entry.season) continue;
      const key = entry.season_id;
      showByUser[user.id].add(key);
      if (!showData[key]) {
        showData[key] = {
          title: entry.show.title,
          poster_url: entry.show.poster_url,
          season_number: entry.season.season_number,
          ranks: [],
          genres: entry.show.genres,
        };
      }
      showData[key].ranks.push(entry.rank_position);
    }
  }

  const groups: VennGroup[] = [];

  if (users.length >= 2) {
    for (let i = 0; i < users.length; i++) {
      for (let j = i + 1; j < users.length; j++) {
        const shared = [...showByUser[users[i].id]].filter(
          (s) =>
            showByUser[users[j].id].has(s) &&
            !users.every((u) => showByUser[u.id].has(s)),
        );
        if (shared.length > 0) {
          const otherUsers = users.filter(
            (u) => u.id !== users[i].id && u.id !== users[j].id,
          );
          const otherNames = otherUsers.map((u) => u.display_name).join(" & ");
          groups.push({
            userIds: [users[i].id, users[j].id],
            label: `${users[i].display_name} & ${users[j].display_name} watched (${otherNames} didn't)`,
            shows: shared.map((key) => ({
              title: showData[key].title,
              poster_url: showData[key].poster_url,
              season_number: showData[key].season_number,
              avgRank:
                showData[key].ranks.reduce((a, b) => a + b, 0) /
                showData[key].ranks.length,
              genres: showData[key].genres,
            })),
          });
        }
      }
    }

    for (const user of users) {
      const onlyThisUser = [...showByUser[user.id]].filter((s) =>
        users.every((u) => u.id === user.id || !showByUser[u.id].has(s)),
      );
      if (onlyThisUser.length > 0) {
        groups.push({
          userIds: [user.id],
          label: `Only ${user.display_name} watched`,
          shows: onlyThisUser.map((key) => ({
            title: showData[key].title,
            poster_url: showData[key].poster_url,
            season_number: showData[key].season_number,
            avgRank:
              showData[key].ranks.reduce((a, b) => a + b, 0) /
              showData[key].ranks.length,
            genres: showData[key].genres,
          })),
        });
      }
    }
  }

  return groups;
}

function getGenreSummary(
  shows: { genres: string[] }[],
): string {
  const genreCounts: Record<string, number> = {};
  for (const show of shows) {
    for (const g of show.genres) {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    }
  }
  const sorted = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]);
  if (sorted.length === 0) return "various genres";
  if (sorted[0][1] >= shows.length * 0.5) {
    return `mostly ${sorted[0][0]}`;
  }
  return sorted
    .slice(0, 2)
    .map(([g]) => g)
    .join(" & ");
}

function StatCard({
  label,
  value,
  sub,
  accent = false,
}: {
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div className="glass rounded-2xl p-4 border border-white/5">
      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p
        className={cn(
          "text-2xl font-black",
          accent ? "text-amber-500" : "text-white",
        )}
      >
        {value}
      </p>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function InsightsPage() {
  const [year, setYear] = useState<number>(YEARS[0]);
  const [allYears, setAllYears] = useState<number[]>([...YEARS]);
  const [rankings, setRankings] = useState<Record<string, RankingEntry[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveYears().then((active) => {
      const merged = [...new Set([...active, ...YEARS])].sort((a, b) => b - a);
      setAllYears(merged);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchRankingsForYear(year).then(({ rankings: r, users: u }) => {
      setRankings(r);
      setUsers(u);
      setLoading(false);
    });
  }, [year]);

  const userStats = useMemo(() => {
    const map: Record<string, UserStats> = {};
    for (const user of users) {
      map[user.id] = computeUserStats(rankings[user.id] || []);
    }
    return map;
  }, [rankings, users]);

  const consensus = useMemo(
    () => generateConsensusRankings(rankings),
    [rankings],
  );

  const disagreements = useMemo(
    () => generateDisagreements(rankings),
    [rankings],
  );

  const vennGroups = useMemo(
    () => computeVennGroups(rankings, users),
    [rankings, users],
  );

  const allShows = useMemo(() => {
    const all: RankingEntry[] = [];
    for (const userId of Object.keys(rankings)) {
      all.push(...(rankings[userId] || []));
    }
    return all;
  }, [rankings]);

  const globalAvgScore = useMemo(() => {
    const scores = allShows
      .filter((e: RankingEntry) => e.score != null)
      .map((e: RankingEntry) => e.score!);
    return scores.length > 0
      ? scores.reduce((a: number, b: number) => a + b, 0) / scores.length
      : 0;
  }, [allShows]);

  const everyoneWatched = useMemo(() => {
    if (users.length === 0) return [] as string[];
    const seasonSets = users.map(
      (u: User) => new Set((rankings[u.id] || []).map((e: RankingEntry) => e.season_id)),
    );
    const intersection = [...seasonSets[0]].filter((s: string) =>
      seasonSets.every((set: Set<string>) => set.has(s)),
    );
    return intersection;
  }, [rankings, users]);

  const totalUniqueShows = useMemo(() => {
    const ids = new Set<string>();
    for (const userId of Object.keys(rankings)) {
      for (const e of (rankings[userId] || [])) {
        ids.add(e.season_id);
      }
    }
    return ids.size;
  }, [rankings]);

  const hasData = allShows.length > 0;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="text-center mb-12">
        <span className="text-amber-500 font-mono uppercase tracking-[0.5em] text-xs mb-4 block">
          Cross-Reference Station
        </span>
        <h1 className="text-4xl md:text-7xl font-black tracking-tighter uppercase mb-3">
          {year} <span className="text-amber-500">Insights</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Fun facts, comparisons, and deep dives into our viewing habits.
        </p>
      </div>

      {/* Year selector */}
      <div className="flex gap-2 justify-center flex-wrap mb-12">
        {allYears.map((y: number) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              y === year
                ? "bg-purple-500 text-white shadow-lg shadow-purple-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {/* Cross-link */}
      <div className="text-center mb-8">
        <Link
          href={`/${year}`}
          className="text-xs text-gray-500 hover:text-amber-500 transition-colors"
        >
          View {year} Rankings &rarr;
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Crunching numbers...</p>
        </div>
      ) : !hasData ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">
            No rankings data for {year} yet.
          </p>
        </div>
      ) : (
        <div className="space-y-16">
          {/* ═══ OVERVIEW ═══ */}
          <section>
            <SectionHeader title="The Big Picture" icon="overview" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard
                label="Total Shows Ranked"
                value={totalUniqueShows}
                sub="unique seasons across all users"
              />
              <StatCard
                label="Everyone Watched"
                value={everyoneWatched.length}
                sub={`of ${totalUniqueShows} total`}
                accent
              />
              <StatCard
                label="Group Avg Score"
                value={globalAvgScore.toFixed(1)}
                sub="out of 10"
              />
              <StatCard
                label="Biggest Disagreement"
                value={
                  disagreements.length > 0
                    ? `${disagreements[0].spread} spots`
                    : "N/A"
                }
                sub={
                  disagreements.length > 0
                    ? `${disagreements[0].show.title} S${disagreements[0].season.season_number}`
                    : undefined
                }
              />
            </div>
          </section>

          {/* ═══ USER HEAD-TO-HEAD ═══ */}
          <section>
            <SectionHeader title="Head to Head" icon="compare" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {users.map((user: User) => {
                const stats = userStats[user.id];
                if (!stats || stats.totalShows === 0) return null;
                return (
                  <div
                    key={user.id}
                    className="glass rounded-2xl p-6 border border-white/5 hover:border-purple-500/20 transition-all"
                  >
                    {/* User header */}
                    <div className="flex items-center gap-3 mb-5">
                      {user.avatar_url ? (
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-purple-500/50">
                          <Image
                            src={user.avatar_url}
                            alt={user.display_name}
                            fill
                            className="object-cover"
                            sizes="40px"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500 font-bold text-sm border-2 border-purple-500/50">
                          {user.display_name[0]}
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold">
                          {user.display_name}
                        </h3>
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          {stats.totalShows} shows ranked
                        </p>
                      </div>
                    </div>

                    {/* Key stats */}
                    <div className="grid grid-cols-2 gap-3 mb-5">
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Avg Score
                        </p>
                        <p className="text-xl font-black text-white">
                          {stats.averageScore.toFixed(1)}
                        </p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-3">
                        <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                          Shows Ranked
                        </p>
                        <p className="text-xl font-black text-white">
                          {stats.totalShows}
                        </p>
                      </div>
                    </div>

                    {/* Highest & Lowest */}
                    {stats.highestScore && (
                      <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                        <span className="text-gray-500">Highest rated</span>
                        <span className="text-emerald-400 font-bold">
                          {stats.highestScore.title} ({stats.highestScore.score})
                        </span>
                      </div>
                    )}
                    {stats.lowestScore && (
                      <div className="flex items-center justify-between text-sm py-2 border-b border-white/5">
                        <span className="text-gray-500">Lowest rated</span>
                        <span className="text-red-400 font-bold">
                          {stats.lowestScore.title} ({stats.lowestScore.score})
                        </span>
                      </div>
                    )}

                    {/* Top genres */}
                    <div className="mt-4">
                      <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                        Top Genres
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {stats.topGenres.map(({ genre, count }: { genre: string; count: number }) => (
                          <span
                            key={genre}
                            className="px-2 py-1 text-[10px] font-bold rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
                          >
                            {genre} ({count})
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Tier */}
                    {Object.keys(stats.tierBreakdown).length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">
                          Tier
                        </p>
                        <div className="space-y-1.5">
                          {(
                            [
                              "Instant Classic",
                              "Great",
                              "Very Good",
                              "Good",
                              "Average",
                              "Bad",
                              "ASS",
                            ] as Tier[]
                          ).map((level) => {
                            const count =
                              stats.tierBreakdown[level] || 0;
                            if (count === 0) return null;
                            const pct =
                              (count / stats.totalShows) * 100;
                            return (
                              <div
                                key={level}
                                className="flex items-center gap-2 text-xs"
                              >
                                <span className="w-4 text-center">
                                  {TIER_ICONS[level]}
                                </span>
                                <span className="w-28 text-gray-400 shrink-0 truncate">
                                  {level}
                                </span>
                                <div className="flex-grow h-2 bg-white/5 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-purple-500/60 rounded-full transition-all"
                                    style={{ width: `${pct}%` }}
                                  />
                                </div>
                                <span className="text-gray-500 w-6 text-right shrink-0">
                                  {count}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Instant Classics callout */}
                    {stats.instantClassics.length > 0 && (
                      <div className="mt-4 bg-amber-500/5 border border-amber-500/10 rounded-xl p-3">
                        <p className="text-[10px] text-amber-500 uppercase tracking-widest font-bold mb-1">
                          Instant Classics
                        </p>
                        <p className="text-xs text-gray-300">
                          {stats.instantClassics.join(", ")}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* ═══ SCORE COMPARISON BAR ═══ */}
          <section>
            <SectionHeader title="Average Score Showdown" icon="scores" />
            <div className="glass rounded-2xl p-6 border border-white/5">
              <div className="space-y-4">
                {users
                  .filter((u: User) => userStats[u.id]?.totalShows > 0)
                  .sort(
                    (a: User, b: User) =>
                      userStats[b.id].averageScore -
                      userStats[a.id].averageScore,
                  )
                  .map((user: User, i: number) => {
                    const stats = userStats[user.id];
                    const maxScore = Math.max(
                      ...users.map((u: User) => userStats[u.id]?.averageScore || 0),
                    );
                    const pct =
                      maxScore > 0
                        ? (stats.averageScore / 10) * 100
                        : 0;
                    const colors = [
                      "bg-amber-500",
                      "bg-purple-500",
                      "bg-emerald-500",
                    ];
                    return (
                      <div key={user.id}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {i === 0 && (
                              <span className="text-amber-500 text-sm">
                                #1
                              </span>
                            )}
                            <span className="text-sm font-bold text-white">
                              {user.display_name}
                            </span>
                          </div>
                          <span className="text-sm font-black text-white">
                            {stats.averageScore.toFixed(2)}
                          </span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-700",
                              colors[i % colors.length],
                            )}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
              </div>
              <p className="text-[10px] text-gray-600 mt-4 text-center">
                Based on scored shows only (scale of 1-10)
              </p>
            </div>
          </section>

          {/* ═══ VIEWING OVERLAP ═══ */}
          {vennGroups.length > 0 && (
            <section>
              <SectionHeader title="Who Watched What" icon="venn" />
              <div className="space-y-6">
                {vennGroups.map((group: VennGroup, idx: number) => {
                  const avgRank =
                    group.shows.length > 0
                      ? group.shows.reduce((a: number, b) => a + b.avgRank, 0) /
                        group.shows.length
                      : 0;
                  const genreSummary = getGenreSummary(group.shows);
                  return (
                    <div
                      key={idx}
                      className="glass rounded-2xl p-6 border border-white/5"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2 mb-4">
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            {group.label}
                          </h3>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {group.shows.length}{" "}
                            {group.shows.length === 1 ? "show" : "shows"} —{" "}
                            {genreSummary} — avg rank{" "}
                            <span className="text-purple-400 font-bold">
                              #{avgRank.toFixed(0)}
                            </span>
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {group.shows
                          .sort((a, b) => a.avgRank - b.avgRank)
                          .map((show) => (
                            <div
                              key={show.title + show.season_number}
                              className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2 border border-white/5"
                            >
                              <div className="relative w-7 h-10 rounded overflow-hidden shrink-0">
                                <Image
                                  src={
                                    show.poster_url ||
                                    "/placeholder-poster.svg"
                                  }
                                  alt={show.title}
                                  fill
                                  className="object-cover"
                                  sizes="28px"
                                />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-white truncate max-w-[150px]">
                                  {show.title}
                                </p>
                                <p className="text-[10px] text-gray-500">
                                  S{show.season_number} · Avg #{show.avgRank.toFixed(0)}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* ═══ TOP CONSENSUS ═══ */}
          {consensus.length > 0 && (
            <section>
              <SectionHeader title="We All Agree On" icon="consensus" />
              <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {consensus.slice(0, 10).map((entry: ConsensusEntry) => (
                    <div
                      key={entry.season.id}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0",
                          entry.consensus_position <= 3
                            ? "bg-amber-500 text-black"
                            : "bg-white/5 text-gray-400",
                        )}
                      >
                        {entry.consensus_position}
                      </div>
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={entry.show.poster_url}
                          alt={entry.show.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-sm text-white truncate">
                          {entry.show.title}{" "}
                          <span className="text-gray-500">
                            S{entry.season.season_number}
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Avg rank: {entry.average_rank.toFixed(1)} · Ranked by{" "}
                          {entry.ranked_by_count}/{users.length}
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {users.map((u: User) => {
                          const rank = entry.user_ranks[u.id];
                          return (
                            <div
                              key={u.id}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                rank != null
                                  ? "bg-purple-500/20 text-purple-400"
                                  : "bg-white/5 text-gray-600",
                              )}
                              title={`${u.display_name}: ${rank != null ? `#${rank}` : "N/A"}`}
                            >
                              {rank != null ? `#${rank}` : "—"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ═══ BIGGEST DISAGREEMENTS ═══ */}
          {disagreements.length > 0 && (
            <section>
              <SectionHeader title="We Can't Agree On" icon="disagree" />
              <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {disagreements.slice(0, 8).map((entry: DisagreementEntry) => (
                    <div
                      key={entry.season.id}
                      className="flex items-center gap-4 p-4 hover:bg-white/5 transition-colors"
                    >
                      <div className="w-12 h-8 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-xs font-black text-red-400 shrink-0">
                        {entry.spread}
                      </div>
                      <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0">
                        <Image
                          src={entry.show.poster_url}
                          alt={entry.show.title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-sm text-white truncate">
                          {entry.show.title}{" "}
                          <span className="text-gray-500">
                            S{entry.season.season_number}
                          </span>
                        </p>
                        <p className="text-[10px] text-gray-500">
                          Spread: {entry.spread} positions apart
                        </p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {users.map((u: User) => {
                          const rank = entry.user_ranks[u.id];
                          const ranks = Object.values(entry.user_ranks) as number[];
                          const isMax = rank === Math.max(...ranks);
                          const isMin = rank === Math.min(...ranks);
                          return (
                            <div
                              key={u.id}
                              className={cn(
                                "w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold",
                                rank != null
                                  ? isMin
                                    ? "bg-emerald-500/20 text-emerald-400"
                                    : isMax
                                      ? "bg-red-500/20 text-red-400"
                                      : "bg-white/5 text-gray-400"
                                  : "bg-white/5 text-gray-600",
                              )}
                              title={`${u.display_name}: ${rank != null ? `#${rank}` : "N/A"}`}
                            >
                              {rank != null ? `#${rank}` : "—"}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <p className="text-[10px] text-gray-600 mt-3 text-center">
                Spread = difference between highest and lowest rank among users
              </p>
            </section>
          )}

          {/* ═══ NETWORK BREAKDOWN ═══ */}
          <section>
            <SectionHeader title="Network Wars" icon="network" />
            <div className="glass rounded-2xl p-6 border border-white/5">
              {(() => {
                const networkMap: Record<
                  string,
                  { count: number; totalScore: number; scoredCount: number }
                > = {};
                for (const entries of Object.keys(rankings).map((k) => rankings[k] || [])) {
                  for (const e of entries) {
                    if (!e.show) continue;
                    const net = e.show.network;
                    if (!networkMap[net])
                      networkMap[net] = {
                        count: 0,
                        totalScore: 0,
                        scoredCount: 0,
                      };
                    networkMap[net].count++;
                    if (e.score != null) {
                      networkMap[net].totalScore += e.score;
                      networkMap[net].scoredCount++;
                    }
                  }
                }
                const sorted = Object.entries(networkMap)
                  .sort((a, b) => b[1].count - a[1].count)
                  .slice(0, 10);
                const maxCount = sorted[0]?.[1].count || 1;

                return (
                  <div className="space-y-3">
                    {sorted.map(([network, data]) => {
                      const avgScore =
                        data.scoredCount > 0
                          ? data.totalScore / data.scoredCount
                          : 0;
                      return (
                        <div key={network}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-bold text-white">
                              {network}
                            </span>
                            <div className="flex items-center gap-3">
                              {avgScore > 0 && (
                                <span className="text-[10px] text-gray-500">
                                  avg {avgScore.toFixed(1)}/10
                                </span>
                              )}
                              <span className="text-xs text-gray-400 font-bold">
                                {data.count} rankings
                              </span>
                            </div>
                          </div>
                          <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-purple-500 to-amber-500 rounded-full transition-all duration-700"
                              style={{
                                width: `${(data.count / maxCount) * 100}%`,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>

          {/* ═══ GENRE CLOUD ═══ */}
          <section>
            <SectionHeader title="Genre Breakdown" icon="genres" />
            <div className="glass rounded-2xl p-6 border border-white/5">
              {(() => {
                const genreMap: Record<
                  string,
                  { count: number; totalScore: number; scoredCount: number }
                > = {};
                for (const entries of Object.keys(rankings).map((k) => rankings[k] || [])) {
                  for (const e of entries) {
                    if (!e.show) continue;
                    for (const g of e.show.genres) {
                      if (!genreMap[g])
                        genreMap[g] = {
                          count: 0,
                          totalScore: 0,
                          scoredCount: 0,
                        };
                      genreMap[g].count++;
                      if (e.score != null) {
                        genreMap[g].totalScore += e.score;
                        genreMap[g].scoredCount++;
                      }
                    }
                  }
                }
                const sorted = Object.entries(genreMap).sort(
                  (a, b) => b[1].count - a[1].count,
                );
                const maxCount = sorted[0]?.[1].count || 1;

                return (
                  <div className="flex flex-wrap gap-2">
                    {sorted.map(([genre, data]) => {
                      const size = Math.max(
                        0.7,
                        (data.count / maxCount) * 1.5,
                      );
                      const avgScore =
                        data.scoredCount > 0
                          ? data.totalScore / data.scoredCount
                          : 0;
                      return (
                        <div
                          key={genre}
                          className="glass rounded-xl px-4 py-2.5 border border-white/5 hover:border-purple-500/20 transition-all group cursor-default"
                          style={{
                            transform: `scale(${size})`,
                            transformOrigin: "center",
                          }}
                        >
                          <p className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">
                            {genre}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {data.count} shows
                            {avgScore > 0 && ` · ${avgScore.toFixed(1)} avg`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </section>

          {/* ═══ FUN FACTS ═══ */}
          <section>
            <SectionHeader title="Fun Facts" icon="fun" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {generateFunFacts(rankings, users, userStats, consensus, disagreements, vennGroups).map(
                (fact, i) => (
                  <div
                    key={i}
                    className="glass rounded-2xl p-5 border border-white/5 hover:border-purple-500/20 transition-all"
                  >
                    <p className="text-sm text-gray-300 leading-relaxed">
                      {fact}
                    </p>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) {
  const icons: Record<string, string> = {
    overview: "📊",
    compare: "⚔️",
    scores: "📈",
    venn: "🔄",
    consensus: "🤝",
    disagree: "💥",
    network: "📺",
    genres: "🎭",
    fun: "💡",
  };
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="text-2xl">{icons[icon] || "📊"}</span>
      <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
        {title}
      </h2>
      <div className="flex-grow h-px bg-white/10" />
    </div>
  );
}

function generateFunFacts(
  rankings: Record<string, RankingEntry[]>,
  users: User[],
  userStats: Record<string, UserStats>,
  consensus: ConsensusEntry[],
  disagreements: DisagreementEntry[],
  vennGroups: VennGroup[],
): string[] {
  const facts: string[] = [];

  const scoredUsers = users.filter(
    (u) => userStats[u.id]?.averageScore > 0,
  );
  if (scoredUsers.length >= 2) {
    const sorted = [...scoredUsers].sort(
      (a, b) => userStats[b.id].averageScore - userStats[a.id].averageScore,
    );
    const generous = sorted[0];
    const harsh = sorted[sorted.length - 1];
    const diff = (
      userStats[generous.id].averageScore -
      userStats[harsh.id].averageScore
    ).toFixed(1);
    facts.push(
      `${generous.display_name} is the most generous grader with an average score of ${userStats[generous.id].averageScore.toFixed(1)}, while ${harsh.display_name} is the toughest critic at ${userStats[harsh.id].averageScore.toFixed(1)} — a gap of ${diff} points.`,
    );
  }

  const rankedCounts = users.map((u) => ({
    name: u.display_name,
    count: userStats[u.id]?.totalShows || 0,
  }));
  const mostWatched = rankedCounts.sort((a, b) => b.count - a.count)[0];
  const leastWatched = rankedCounts.sort((a, b) => a.count - b.count)[0];
  if (mostWatched && leastWatched && mostWatched.count !== leastWatched.count) {
    facts.push(
      `${mostWatched.name} ranked the most shows (${mostWatched.count}), while ${leastWatched.name} ranked the fewest (${leastWatched.count}).`,
    );
  }

  if (consensus.length > 0) {
    const top = consensus[0];
    facts.push(
      `The group's #1 consensus pick is ${top.show.title} S${top.season.season_number} with an average rank of ${top.average_rank.toFixed(1)}.`,
    );
  }

  if (disagreements.length > 0) {
    const worst = disagreements[0];
    const ranks = Object.entries(worst.user_ranks);
    const high = ranks.sort((a, b) => a[1] - b[1])[0];
    const low = ranks.sort((a, b) => b[1] - a[1])[0];
    const highUser = users.find((u) => u.id === high[0]);
    const lowUser = users.find((u) => u.id === low[0]);
    if (highUser && lowUser) {
      facts.push(
        `The biggest disagreement is ${worst.show.title} S${worst.season.season_number} — ${highUser.display_name} ranked it #${high[1]} while ${lowUser.display_name} put it at #${low[1]}, a spread of ${worst.spread} spots.`,
      );
    }
  }

  for (const group of vennGroups) {
    if (group.userIds.length === 2 && group.shows.length > 0) {
      const names = group.userIds
        .map((id) => users.find((u) => u.id === id)?.display_name || "?")
        .join(" and ");
      const avgRank =
        group.shows.reduce((a, b) => a + b.avgRank, 0) / group.shows.length;
      const genreSummary = getGenreSummary(group.shows);
      facts.push(
        `${names} watched ${group.shows.length} ${group.shows.length === 1 ? "show" : "shows"} that the others didn't — ${genreSummary} with an average rank of #${avgRank.toFixed(0)}.`,
      );
    }
  }

  const allInstantClassics: Record<string, string[]> = {};
  for (const user of users) {
    const ics = userStats[user.id]?.instantClassics || [];
    for (const ic of ics) {
      if (!allInstantClassics[ic]) allInstantClassics[ic] = [];
      allInstantClassics[ic].push(user.display_name);
    }
  }
  const sharedICs = Object.entries(allInstantClassics).filter(
    ([, names]) => names.length >= 2,
  );
  if (sharedICs.length > 0) {
    const [show, names] = sharedICs[0];
    facts.push(
      `${names.join(" and ")} both rated ${show} as an "Instant Classic" tier.`,
    );
  }

  for (const user of users) {
    const stats = userStats[user.id];
    if (stats?.topNetworks.length > 0) {
      const topNet = stats.topNetworks[0];
      if (topNet.count >= 3) {
        facts.push(
          `${user.display_name}'s most-watched network is ${topNet.network} with ${topNet.count} shows ranked.`,
        );
      }
    }
  }

  return facts;
}
