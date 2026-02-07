"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import SideBySideView from "@/components/ranking/SideBySideView";
import { fetchRankingsForYear, fetchActiveYears } from "@/lib/supabase/queries";
import { YEARS } from "@/lib/constants";
import type { RankingEntry, User } from "@/types";

export default function HomePage() {
  const [years, setYears] = useState<number[]>([...YEARS]);
  const [displayYear, setDisplayYear] = useState<number>(YEARS[0]);
  const [rankings, setRankings] = useState<Record<string, RankingEntry[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveYears().then((activeYears) => {
      if (activeYears.length > 0) {
        const merged = [...new Set([...activeYears, ...YEARS])].sort((a, b) => b - a);
        setYears(merged);
        setDisplayYear(merged[0]);
      }
    });
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { rankings: r, users: u } = await fetchRankingsForYear(displayYear);
      setRankings(r);
      setUsers(u);
      setLoading(false);
    }
    loadData();
  }, [displayYear]);

  const totalEntries = Object.values(rankings).reduce((sum, r) => sum + r.length, 0);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative h-[35vh] md:h-[45vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-bg-surface/30 to-bg-primary" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(245,158,11,0.05)_0%,_transparent_70%)]" />
        </div>

        <div className="relative z-10 text-center px-4">
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter mb-4 uppercase">
            RTVG{" "}
            <span className="text-amber-500">Rankings</span>
          </h1>
          <p className="max-w-2xl mx-auto text-gray-400 text-lg md:text-xl font-light">
            The definitive record of our television journey
          </p>

          {/* Year Quick Links */}
          <div className="flex gap-3 justify-center mt-8 flex-wrap">
            {years.map((year) => (
              <Link
                key={year}
                href={`/${year}`}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                  year === displayYear
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
                }`}
              >
                {year}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tight">
            {displayYear} Rankings
          </h2>
          <div className="h-1 w-20 bg-amber-500 rounded-full hidden sm:block" />
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-500 text-sm">Loading rankings...</p>
          </div>
        ) : totalEntries > 0 ? (
          <SideBySideView
            rankings={rankings}
            users={users}
            year={displayYear}
            limit={10}
          />
        ) : (
          <div className="glass rounded-2xl border border-white/5 p-12 text-center">
            <p className="text-gray-400 text-lg mb-2">No rankings for {displayYear} yet</p>
            <p className="text-gray-600 text-sm">
              Sign in and head to Manage Rankings to start adding shows.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
