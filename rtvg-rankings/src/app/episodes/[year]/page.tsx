"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { fetchUsers, fetchActiveYears } from "@/lib/supabase/queries";
import { YEARS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface EpisodeEntry {
  id: string;
  user_id: string;
  rank_position: number;
  show_title: string;
  poster_url: string;
  season_number: number;
  episode_number: number;
  episode_title: string;
}

export default function EpisodeRankingsPage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);

  const [users, setUsers] = useState<User[]>([]);
  const [rankings, setRankings] = useState<Record<string, EpisodeEntry[]>>({});
  const [allYears, setAllYears] = useState<number[]>([...YEARS]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveYears().then((active) => {
      if (active.length > 0) {
        const merged = [...new Set([...active, ...YEARS])].sort((a, b) => b - a);
        setAllYears(merged);
      }
    });
  }, []);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [usersData, { data: entries }] = await Promise.all([
        fetchUsers(),
        supabase
          .from("episode_ranking_entries")
          .select(`
            id, user_id, rank_position, season_number, episode_number, episode_title,
            shows!inner ( title, poster_url )
          `)
          .eq("year", year)
          .order("rank_position", { ascending: true }),
      ]);

      setUsers(usersData);

      const grouped: Record<string, EpisodeEntry[]> = {};
      for (const u of usersData) grouped[u.id] = [];

      for (const row of (entries || []) as any[]) {
        const entry: EpisodeEntry = {
          id: row.id,
          user_id: row.user_id,
          rank_position: row.rank_position,
          show_title: row.shows?.title || "Unknown",
          poster_url: row.shows?.poster_url || "/placeholder-poster.svg",
          season_number: row.season_number,
          episode_number: row.episode_number,
          episode_title: row.episode_title,
        };
        if (!grouped[row.user_id]) grouped[row.user_id] = [];
        grouped[row.user_id].push(entry);
      }

      setRankings(grouped);
      setLoading(false);
    }
    loadData();
  }, [year]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Year Switcher */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {allYears.map((y) => (
          <Link
            key={y}
            href={`/episodes/${y}`}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              y === year
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {y}
          </Link>
        ))}
        <Link
          href="/all-time"
          className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
        >
          All-Time
        </Link>
      </div>

      <div className="mb-10">
        <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-xs mb-2 block">
          Supplementary List
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          Best Episodes of{" "}
          <span className="text-amber-500">{year}</span>
        </h1>
        <p className="text-gray-400">
          Our top individual episodes of the year, ranked.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href={`/performances/${year}`}
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
          >
            Performance Rankings &rarr;
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading episode rankings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {users.map((user) => {
            const episodes = rankings[user.id] || [];
            return (
              <div key={user.id}>
                <div className="flex items-center gap-3 mb-4 px-1">
                  {user.avatar_url ? (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden border-2 border-amber-500/50">
                      <Image
                        src={user.avatar_url}
                        alt={user.display_name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xs border-2 border-amber-500/50">
                      {user.display_name[0]}
                    </div>
                  )}
                  <h2 className="text-lg font-bold">{user.display_name}</h2>
                  <div className="flex-grow h-px bg-white/10" />
                </div>

                <div className="space-y-2">
                  {episodes.map((ep) => (
                    <div
                      key={ep.id}
                      className="flex items-center gap-3 p-3 rounded-xl glass hover:bg-white/10 transition-all"
                    >
                      <div
                        className={cn(
                          "w-8 h-8 flex items-center justify-center font-bold text-lg shrink-0",
                          ep.rank_position <= 3
                            ? "text-amber-500"
                            : "text-gray-500"
                        )}
                      >
                        {ep.rank_position}
                      </div>
                      <div className="relative w-10 h-14 shrink-0 overflow-hidden rounded-md">
                        <Image
                          src={ep.poster_url}
                          alt={ep.show_title}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-sm truncate">
                          {ep.episode_title}
                        </h4>
                        <p className="text-[11px] text-gray-400 truncate">
                          {ep.show_title} &middot; S{ep.season_number}E
                          {ep.episode_number}
                        </p>
                      </div>
                    </div>
                  ))}

                  {episodes.length === 0 && (
                    <div className="glass rounded-xl p-6 text-center">
                      <p className="text-gray-500 text-sm">No episode rankings yet</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
