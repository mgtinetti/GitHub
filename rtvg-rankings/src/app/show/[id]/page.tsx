"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { fetchUsers } from "@/lib/supabase/queries";
import { TIER_ICONS } from "@/lib/constants";
import type { User } from "@/types";

interface ShowData {
  id: string;
  tmdb_id: number;
  title: string;
  poster_url: string | null;
  genres: string[];
  network: string;
  status: string;
}

interface TMDBDetails {
  overview?: string;
  first_air_date?: string;
  vote_average?: number;
  number_of_seasons?: number;
  episode_run_time?: number[];
  last_episode_runtime?: number | null;
  homepage?: string;
  networks?: { name: string }[];
}

interface RankingRow {
  id: string;
  user_id: string;
  year: number;
  rank_position: number;
  score: number | null;
  tier: string | null;
  review: string | null;
  season_number: number;
}

export default function ShowDetailPage() {
  const params = useParams();
  const showId = params.id as string;

  const [show, setShow] = useState<ShowData | null>(null);
  const [tmdbDetails, setTmdbDetails] = useState<TMDBDetails | null>(null);
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      // Fetch show, users, and all ranking entries for this show in parallel
      const [showResult, usersData] = await Promise.all([
        supabase.from("shows").select("*").eq("id", showId).single(),
        fetchUsers(),
      ]);

      if (showResult.error || !showResult.data) {
        setLoading(false);
        return;
      }

      const showData: ShowData = {
        id: showResult.data.id,
        tmdb_id: showResult.data.tmdb_id,
        title: showResult.data.title,
        poster_url: showResult.data.poster_url,
        genres: showResult.data.genres || [],
        network: showResult.data.network || "Unknown",
        status: showResult.data.status || "Unknown",
      };
      setShow(showData);
      setUsers(usersData);

      // Fetch all ranking entries for seasons of this show
      const { data: rankingData } = await supabase
        .from("ranking_entries")
        .select(
          `
          id,
          user_id,
          year,
          rank_position,
          score,
          tier,
          review,
          seasons!inner (
            season_number,
            show_id
          )
        `
        )
        .eq("seasons.show_id", showId)
        .order("year", { ascending: false })
        .order("rank_position", { ascending: true });

      if (rankingData) {
        setRankings(
          (rankingData as any[]).map((row) => ({
            id: row.id,
            user_id: row.user_id,
            year: row.year,
            rank_position: row.rank_position,
            score: row.score ? parseFloat(row.score) : null,
            tier: row.tier,
            review: row.review,
            season_number: row.seasons.season_number,
          }))
        );
      }

      // Fetch TMDB details for overview
      try {
        const res = await fetch(`/api/tmdb/show/${showData.tmdb_id}`);
        if (res.ok) {
          const tmdb = await res.json();
          setTmdbDetails({
            overview: tmdb.overview,
            first_air_date: tmdb.first_air_date,
            vote_average: tmdb.vote_average,
            number_of_seasons: tmdb.number_of_seasons,
            episode_run_time: tmdb.episode_run_time,
            last_episode_runtime: tmdb.last_episode_to_air?.runtime ?? null,
            homepage: tmdb.homepage,
            networks: tmdb.networks,
          });
        }
      } catch {
        // TMDB details are supplementary, not critical
      }

      setLoading(false);
    }
    loadData();
  }, [showId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading show details...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-400 text-lg mb-4">Show not found</p>
        <Link href="/" className="text-amber-500 text-sm font-semibold">
          Back to Home
        </Link>
      </div>
    );
  }

  // Group rankings by year
  const yearMap = new Map<number, RankingRow[]>();
  for (const r of rankings) {
    const arr = yearMap.get(r.year) || [];
    arr.push(r);
    yearMap.set(r.year, arr);
  }
  const sortedYears = [...yearMap.keys()].sort((a, b) => b - a);

  const getUserName = (userId: string) =>
    users.find((u) => u.id === userId)?.display_name || "Unknown";
  const getUser = (userId: string) => users.find((u) => u.id === userId);

  // Compute aggregate stats
  const allScores = rankings.filter((r) => r.score).map((r) => r.score!);
  const avgScore = allScores.length > 0
    ? (allScores.reduce((a, b) => a + b, 0) / allScores.length).toFixed(1)
    : null;
  const bestRank = rankings.length > 0
    ? Math.min(...rankings.map((r) => r.rank_position))
    : null;
  const timesRanked = rankings.length;

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Back link */}
      <div className="flex gap-3 mb-6">
        <Link
          href={`/${new Date().getFullYear()}`}
          className="text-xs text-gray-500 hover:text-amber-500 transition-colors"
        >
          &larr; Back to Rankings
        </Link>
        <Link
          href="/browse"
          className="text-xs text-gray-500 hover:text-amber-500 transition-colors"
        >
          Browse by Service
        </Link>
      </div>

      {/* Show Header */}
      <div className="flex flex-col md:flex-row gap-6 md:gap-10 mb-12">
        {/* Poster */}
        <div className="relative w-48 md:w-64 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl shrink-0 mx-auto md:mx-0">
          <Image
            src={show.poster_url || "/placeholder-poster.svg"}
            alt={show.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 192px, 256px"
            priority
          />
        </div>

        {/* Info */}
        <div className="flex-grow">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase mb-2">
            {show.title}
          </h1>
          <div className="flex items-center gap-3 flex-wrap mb-4">
            <span className="text-sm text-amber-500 font-bold">{show.network}</span>
            <span className="text-gray-600">&middot;</span>
            <span className="text-sm text-gray-400">{show.status}</span>
            {tmdbDetails?.number_of_seasons && (
              <>
                <span className="text-gray-600">&middot;</span>
                <span className="text-sm text-gray-400">
                  {tmdbDetails.number_of_seasons} {tmdbDetails.number_of_seasons === 1 ? "season" : "seasons"}
                </span>
              </>
            )}
            {tmdbDetails?.first_air_date && (
              <>
                <span className="text-gray-600">&middot;</span>
                <span className="text-sm text-gray-400">
                  Since {new Date(tmdbDetails.first_air_date).getFullYear()}
                </span>
              </>
            )}
            {(() => {
              const runTimes = tmdbDetails?.episode_run_time;
              const avgRuntime = runTimes && runTimes.length > 0
                ? Math.round(runTimes.reduce((a, b) => a + b, 0) / runTimes.length)
                : tmdbDetails?.last_episode_runtime || null;
              return avgRuntime ? (
                <>
                  <span className="text-gray-600">&middot;</span>
                  <span className="text-sm text-gray-400">~{avgRuntime} min/ep</span>
                </>
              ) : null;
            })()}
          </div>

          {/* Genre Tags */}
          <div className="flex flex-wrap gap-1.5 mb-6">
            {show.genres.map((g) => (
              <span
                key={g}
                className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-wider"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Overview */}
          {tmdbDetails?.overview && (
            <p className="text-gray-400 text-sm leading-relaxed mb-6 max-w-2xl">
              {tmdbDetails.overview}
            </p>
          )}

          {/* Where to Watch */}
          <div className="glass rounded-xl p-4 border border-white/5 inline-block">
            <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mb-1">
              Where to Watch
            </p>
            <p className="text-white font-bold">{show.network}</p>
            {tmdbDetails?.networks && tmdbDetails.networks.length > 1 && (
              <p className="text-xs text-gray-400 mt-0.5">
                Also on: {tmdbDetails.networks.slice(1).map((n) => n.name).join(", ")}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="glass rounded-xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-black text-amber-500">{timesRanked}</p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
            Times Ranked
          </p>
        </div>
        <div className="glass rounded-xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-black text-amber-500">
            {bestRank ? `#${bestRank}` : "\u2014"}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
            Highest Rank
          </p>
        </div>
        <div className="glass rounded-xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-black text-amber-500">
            {avgScore || "\u2014"}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
            Avg Score
          </p>
        </div>
        <div className="glass rounded-xl p-4 border border-white/5 text-center">
          <p className="text-2xl font-black text-amber-500">
            {tmdbDetails?.vote_average ? tmdbDetails.vote_average.toFixed(1) : "\u2014"}
          </p>
          <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
            TMDB Score
          </p>
        </div>
      </div>

      {/* Rankings by Year */}
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight mb-6">
          Ranking <span className="text-amber-500">History</span>
        </h2>

        {sortedYears.length === 0 ? (
          <div className="glass rounded-2xl border border-white/5 p-8 text-center">
            <p className="text-gray-500">This show hasn&apos;t been ranked yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedYears.map((year) => {
              const yearRankings = yearMap.get(year)!;
              return (
                <div key={year} className="glass rounded-2xl border border-white/5 p-6">
                  <Link
                    href={`/${year}`}
                    className="text-lg font-black text-amber-500 hover:text-amber-400 transition-colors mb-4 block"
                  >
                    {year}
                  </Link>
                  <div className="space-y-3">
                    {yearRankings.map((entry) => {
                      const u = getUser(entry.user_id);
                      return (
                        <div
                          key={entry.id}
                          className="flex items-center gap-4 p-3 rounded-xl bg-white/5"
                        >
                          {/* User avatar */}
                          <div className="shrink-0">
                            {u?.avatar_url ? (
                              <div className="relative w-8 h-8 rounded-full overflow-hidden border border-amber-500/50">
                                <Image
                                  src={u.avatar_url}
                                  alt={u.display_name}
                                  fill
                                  className="object-cover"
                                  sizes="32px"
                                />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs border border-amber-500/50">
                                {getUserName(entry.user_id)[0]}
                              </div>
                            )}
                          </div>

                          {/* Name */}
                          <span className="font-bold text-sm w-20 shrink-0">
                            {getUserName(entry.user_id)}
                          </span>

                          {/* Season */}
                          <span className="text-xs text-gray-400 shrink-0">
                            S{entry.season_number}
                          </span>

                          {/* Rank */}
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-black shrink-0 ${
                            entry.rank_position <= 3
                              ? "rank-badge-top3 text-black"
                              : "bg-white/10 text-gray-300"
                          }`}>
                            #{entry.rank_position}
                          </div>

                          {/* Score */}
                          {entry.score && (
                            <div className="px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20 text-amber-500 text-xs font-bold shrink-0">
                              ★ {entry.score}
                            </div>
                          )}

                          {/* Tier */}
                          {entry.tier && (
                            <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg shrink-0">
                              <span className="text-sm">
                                {TIER_ICONS[entry.tier] || ""}
                              </span>
                              <span className="text-[11px] font-semibold text-gray-400 hidden sm:inline">
                                {entry.tier}
                              </span>
                            </div>
                          )}

                          <div className="flex-grow" />

                          {/* Review snippet */}
                          {entry.review && (
                            <p className="text-[11px] text-gray-500 italic truncate max-w-[200px] hidden md:block">
                              &ldquo;{entry.review}&rdquo;
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
