"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchRankingsForYear, fetchActiveYears, fetchCurrentlyWatching } from "@/lib/supabase/queries";
import { YEARS, PRESET_AWARD_CATEGORIES } from "@/lib/constants";
import { BLOG_POSTS } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";
import type { User } from "@/types";

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

      // Build consensus top shows (aggregate across all users)
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

  const latestPost = [...BLOG_POSTS].sort(
    (a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()
  )[0];

  return (
    <div className="animate-fade-in">
      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative h-[50vh] md:h-[55vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/30 to-bg-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.08)_0%,_transparent_70%)]" />
        </div>

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <span className="text-amber-500 font-mono uppercase tracking-[0.5em] text-[10px] md:text-xs mb-4 block animate-fade-in">
            The Definitive Record
          </span>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 uppercase">
            RTVG{" "}
            <span className="text-amber-500">Rankings</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-sm md:text-xl font-light mb-6 md:mb-8">
            TV season rankings by Tinetti, Chubbs &amp; Poteete.
            Every show watched, scored, and debated.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href={`/${latestYear}`}
              className="bg-amber-500 hover:bg-amber-400 text-black font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-amber-500/20 text-sm"
            >
              {latestYear} Rankings
            </Link>
            <Link
              href={`/${latestYear}/consensus`}
              className="bg-white/5 hover:bg-white/10 text-white font-bold px-8 py-3 rounded-xl transition-colors border border-white/10 text-sm"
            >
              Consensus List
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ QUICK NAVIGATION ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 -mt-4 md:-mt-8 relative z-20">
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          <Link
            href={`/${latestYear}`}
            className="glass rounded-2xl p-3 sm:p-5 border border-white/5 hover:border-amber-500/30 transition-all group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-amber-500/20 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-500 transition-colors">Rankings</h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 hidden sm:block">{years.length} years of data</p>
          </Link>

          <Link
            href="/watching"
            className="glass rounded-2xl p-3 sm:p-5 border border-white/5 hover:border-emerald-500/30 transition-all group relative"
          >
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-emerald-500/20 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-emerald-500 transition-colors">Watching</h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 hidden sm:block">{watchingCount > 0 ? `${watchingCount} shows live` : "See what\u2019s on"}</p>
          </Link>

          <Link
            href={`/awards/${latestYear}`}
            className="glass rounded-2xl p-3 sm:p-5 border border-white/5 hover:border-amber-500/30 transition-all group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-amber-500/20 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-500 transition-colors">Awards</h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 hidden sm:block">{PRESET_AWARD_CATEGORIES.length} categories</p>
          </Link>

          <Link
            href={`/episodes/${latestYear}`}
            className="glass rounded-2xl p-3 sm:p-5 border border-white/5 hover:border-amber-500/30 transition-all group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-amber-500/20 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-500 transition-colors">Lists</h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 hidden sm:block">Episodes & more</p>
          </Link>

          <Link
            href="/blog"
            className="glass rounded-2xl p-3 sm:p-5 border border-white/5 hover:border-amber-500/30 transition-all group"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-500/10 flex items-center justify-center mb-2 sm:mb-3 group-hover:bg-amber-500/20 transition-colors">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="font-bold text-xs sm:text-sm text-white group-hover:text-amber-500 transition-colors">Blog</h3>
            <p className="text-[10px] sm:text-[11px] text-gray-500 mt-0.5 hidden sm:block">Writeups & discussion</p>
          </Link>
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

      {/* ═══════════════ AWARDS PREVIEW ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <div>
            <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-[10px] block mb-1">
              Year-End Superlatives
            </span>
            <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">
              {latestYear} <span className="text-amber-500">Awards</span>
            </h2>
          </div>
          <Link
            href={`/awards/${latestYear}`}
            className="text-xs text-gray-400 hover:text-amber-500 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 font-semibold w-fit"
          >
            All Awards &rarr;
          </Link>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3">
          {PRESET_AWARD_CATEGORIES.slice(0, 5).map((category) => (
            <Link
              key={category}
              href={`/awards/${latestYear}`}
              className="glass rounded-xl p-3 sm:p-4 border border-white/5 hover:border-amber-500/20 transition-all group text-center"
            >
              <span className="text-xl sm:text-2xl mb-1 sm:mb-2 block">
                {category.includes("Disappointing") || category.includes("Overrated") ? "😬" : "🏆"}
              </span>
              <h4 className="text-[10px] sm:text-xs font-bold text-white group-hover:text-amber-500 transition-colors leading-tight">
                {category}
              </h4>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ LISTS PREVIEW ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
        <div className="mb-6">
          <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-[10px] block mb-1">
            Supplementary
          </span>
          <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">
            More <span className="text-amber-500">Lists</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href={`/episodes/${latestYear}`}
            className="glass rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-amber-500 transition-colors">
                  Best Episodes
                </h3>
                <p className="text-[11px] text-gray-500">{latestYear} top episodes ranked</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Our favorite individual episodes of the year, ranked by each member.
            </p>
          </Link>

          <Link
            href={`/performances/${latestYear}`}
            className="glass rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-amber-500 transition-colors">
                  Best Performances
                </h3>
                <p className="text-[11px] text-gray-500">Top acting of {latestYear}</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Standout individual acting performances that defined the year.
            </p>
          </Link>

          <Link
            href="/all-time"
            className="glass rounded-2xl p-6 border border-white/5 hover:border-amber-500/20 transition-all group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-white group-hover:text-amber-500 transition-colors">
                  All-Time Rankings
                </h3>
                <p className="text-[11px] text-gray-500">The best of the best</p>
              </div>
            </div>
            <p className="text-xs text-gray-400">
              Our all-time favorite TV seasons, spanning every year we&apos;ve ranked.
            </p>
          </Link>
        </div>
      </section>

      {/* ═══════════════ BLOG PREVIEW ═══════════════ */}
      {latestPost && (
        <section className="max-w-7xl mx-auto px-4 md:px-8 mt-12 md:mt-16">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
            <div>
              <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-[10px] block mb-1">
                From the Blog
              </span>
              <h2 className="text-xl md:text-3xl font-black uppercase tracking-tight">
                Latest <span className="text-amber-500">Post</span>
              </h2>
            </div>
            <Link
              href="/blog"
              className="text-xs text-gray-400 hover:text-amber-500 transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-lg border border-white/10 font-semibold w-fit"
            >
              All Posts &rarr;
            </Link>
          </div>

          <Link
            href={`/blog/${latestPost.slug}`}
            className="block glass rounded-2xl p-6 md:p-8 border border-white/5 hover:border-amber-500/20 transition-all group"
          >
            {latestPost.is_pinned && (
              <span className="inline-block text-[10px] font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full uppercase tracking-widest mb-3 border border-amber-500/20">
                Pinned
              </span>
            )}
            <h3 className="text-xl md:text-2xl font-bold group-hover:text-amber-500 transition-colors mb-2">
              {latestPost.title}
            </h3>
            <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
              {latestPost.author && (
                <span className="font-medium">{latestPost.author.display_name}</span>
              )}
              <span className="text-gray-600">&middot;</span>
              <span>{formatDate(latestPost.published_at)}</span>
            </div>
            <p className="text-gray-400 text-sm line-clamp-2">
              {latestPost.body.replace(/[#*\[\]`]/g, "").slice(0, 200)}...
            </p>
            <div className="flex gap-2 mt-4">
              {latestPost.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase tracking-wider"
                >
                  {tag}
                </span>
              ))}
            </div>
          </Link>
        </section>
      )}

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
                {totalRankings || "\u2014"}
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
