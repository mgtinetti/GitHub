"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchRankingsForYear, fetchActiveYears, fetchCurrentlyWatching } from "@/lib/supabase/queries";
import { YEARS } from "@/lib/constants";
import type { User } from "@/types";
import SiteSearch from "@/components/SiteSearch";

export default function HomePage() {
  const [years, setYears] = useState<number[]>([...YEARS]);
  const [latestYear, setLatestYear] = useState<number>(YEARS[0]);
  const [topShows, setTopShows] = useState<{ id: string; title: string; poster_url: string; network: string; season_number: number }[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [totalRankings, setTotalRankings] = useState(0);
  const [watchingCount, setWatchingCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);

      const [activeYears, watchingData] = await Promise.all([
        fetchActiveYears(),
        fetchCurrentlyWatching(),
      ]);

      const merged = activeYears.length > 0
        ? [...new Set([...activeYears, ...YEARS])].sort((a, b) => b - a)
        : [...YEARS];
      setYears(merged);
      const latest = merged[0];
      setLatestYear(latest);

      const count = Object.values(watchingData.items).reduce((sum, items) => sum + items.length, 0);
      setWatchingCount(count);

      const { rankings, users: u } = await fetchRankingsForYear(latest);
      setUsers(u);

      const total = Object.values(rankings).reduce((sum, r) => sum + r.length, 0);
      setTotalRankings(total);

      const showMap = new Map<string, { id: string; title: string; poster_url: string; network: string; season_number: number; totalRank: number; count: number }>();
      for (const entries of Object.values(rankings)) {
        for (const entry of entries) {
          if (!entry.show || !entry.season) continue;
          const key = entry.show.id;
          const existing = showMap.get(key);
          if (existing) {
            existing.totalRank += entry.rank_position;
            existing.count++;
          } else {
            showMap.set(key, {
              id: entry.show.id,
              title: entry.show.title,
              poster_url: entry.show.poster_url,
              network: entry.show.network,
              season_number: entry.season.season_number,
              totalRank: entry.rank_position,
              count: 1,
            });
          }
        }
      }
      const sorted = Array.from(showMap.values())
        .filter((s) => s.count >= 2)
        .sort((a, b) => a.totalRank / a.count - b.totalRank / b.count)
        .slice(0, 6);
      setTopShows(sorted);

      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative z-20 md:h-[55vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/30 to-bg-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto pt-12 pb-20 md:pt-0 md:pb-0">
          <span className="text-amber-500 font-mono uppercase tracking-[0.5em] text-[10px] md:text-xs mb-4 block animate-fade-in">
            The Definitive Record
          </span>
          <h1 className="text-4xl md:text-8xl font-black tracking-tighter mb-3 md:mb-4 uppercase">
            RTVG{" "}
            <span className="text-amber-500">Rankings</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-xl font-light mb-6 md:mb-8">
            TV season rankings by Tinetti, Chubbs &amp; Poteete.
            Every show watched, scored, and debated.
          </p>

          <div className="flex gap-3 md:gap-4 justify-center flex-wrap">
            <Link
              href={`/${latestYear}`}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-6 md:px-8 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20 text-sm"
            >
              {latestYear} Rankings
            </Link>
            <Link
              href="/watching"
              className="bg-white/5 hover:bg-white/10 text-white font-bold px-6 md:px-8 py-3 rounded-xl transition-colors border border-white/10 text-sm"
            >
              Currently Watching
            </Link>
            <Link
              href="/browse"
              className="bg-white/5 hover:bg-white/10 text-white font-bold px-6 md:px-8 py-3 rounded-xl transition-colors border border-white/10 text-sm"
            >
              Browse by Service
            </Link>
          </div>
          <div className="mt-8 md:mt-10">
            <SiteSearch />
          </div>
        </div>
      </section>

      {/* ═══════════════ FEATURED RANKINGS PREVIEW ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6 md:mb-8">
          <div>
            <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-[10px] block mb-1">
              Featured
            </span>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">
              {latestYear} <span className="text-amber-500">Top Shows</span>
            </h2>
          </div>
          <Link
            href={`/${latestYear}`}
            className="text-xs text-gray-400 hover:text-amber-500 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 font-semibold w-fit"
          >
            View All Rankings &rarr;
          </Link>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading rankings...</p>
          </div>
        ) : topShows.length > 0 ? (
          <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-3 md:gap-4">
            {topShows.map((show, i) => (
              <Link
                key={show.id}
                href={`/show/${show.id}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 border border-white/5 group-hover:border-amber-500/30 transition-all">
                  <Image
                    src={show.poster_url}
                    alt={show.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, 16vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <div className="absolute top-2 left-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black ${
                      i < 3 ? "rank-badge-top3 text-black" : "bg-black/60 text-gray-300"
                    }`}>
                      {i + 1}
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-[10px] text-amber-500/80 font-mono uppercase">
                      S{show.season_number}
                    </p>
                  </div>
                </div>
                <h4 className="font-bold text-xs truncate group-hover:text-amber-500 transition-colors">
                  {show.title}
                </h4>
                <p className="text-[10px] text-gray-500">{show.network}</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="glass rounded-2xl border border-white/5 p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No rankings for {latestYear} yet</p>
            <p className="text-gray-600 text-sm">
              Sign in and head to Manage Rankings to start adding shows.
            </p>
          </div>
        )}

        {/* Year selector strip */}
        {years.length > 1 && (
          <div className="flex gap-2 mt-6 flex-wrap">
            {years.map((year) => (
              <Link
                key={year}
                href={`/${year}`}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  year === latestYear
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        )}

        {/* Sub-links */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 mt-4">
          <Link
            href={`/${latestYear}/consensus`}
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors"
          >
            Consensus &rarr;
          </Link>
          <Link
            href={`/${latestYear}/disagreements`}
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors"
          >
            Biggest Disagreements &rarr;
          </Link>
          <Link
            href={`/${latestYear}/genre/Drama`}
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors"
          >
            By Genre &rarr;
          </Link>
        </div>
      </section>

      {/* ═══════════════ ABOUT RTVG ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16 mb-12 md:mb-16">
        <div className="glass rounded-2xl border border-white/5 p-5 sm:p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-[10px] block mb-2">
                About
              </span>
              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight mb-4">
                What is <span className="text-amber-500">RTVG</span>?
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4">
                RTVG Rankings is where three friends &mdash; Tinetti, Chubbs, and Poteete &mdash;
                keep the definitive record of their television journey. Every season ranked,
                every performance scored, every disagreement documented.
              </p>
              <p className="text-gray-400 text-sm leading-relaxed">
                From consensus picks to heated disagreements, from year-end awards to all-time
                favorites, this is our corner of the internet dedicated to the shows that matter most.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {users.length > 0 ? users.map((user) => (
                <div key={user.id} className="text-center">
                  {user.avatar_url ? (
                    <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-2 border-amber-500/30 mx-auto mb-2">
                      <Image
                        src={user.avatar_url}
                        alt={user.display_name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>
                  ) : (
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl border-2 border-amber-500/30 mx-auto mb-2">
                      {user.display_name[0]}
                    </div>
                  )}
                  <p className="font-bold text-sm">{user.display_name}</p>
                  <p className="text-[10px] text-gray-500 capitalize">{user.role}</p>
                </div>
              )) : (
                ["Tinetti", "Chubbs", "Poteete"].map((name) => (
                  <div key={name} className="text-center">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl border-2 border-amber-500/30 mx-auto mb-2">
                      {name[0]}
                    </div>
                    <p className="font-bold text-sm">{name}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/5">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-amber-500">
                {years.length}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
                Years Ranked
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-amber-500">
                {totalRankings || "—"}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
                Total Rankings
              </p>
            </div>
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black text-amber-500">3</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold mt-1">
                Rankers
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
