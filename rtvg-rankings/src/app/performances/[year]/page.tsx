"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";
import { fetchUsers } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface PerformanceEntry {
  id: string;
  user_id: string;
  rank_position: number;
  actor_name: string;
  character_name: string | null;
  show_title: string;
  season_number: number;
}

export default function PerformanceRankingsPage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);

  const [users, setUsers] = useState<User[]>([]);
  const [rankings, setRankings] = useState<Record<string, PerformanceEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const [usersData, { data: entries }] = await Promise.all([
        fetchUsers(),
        supabase
          .from("performance_ranking_entries")
          .select(`
            id, user_id, rank_position, actor_name, character_name,
            seasons!inner (
              season_number,
              shows!inner ( title )
            )
          `)
          .eq("year", year)
          .order("rank_position", { ascending: true }),
      ]);

      setUsers(usersData);

      const grouped: Record<string, PerformanceEntry[]> = {};
      for (const u of usersData) grouped[u.id] = [];

      for (const row of (entries || []) as any[]) {
        const entry: PerformanceEntry = {
          id: row.id,
          user_id: row.user_id,
          rank_position: row.rank_position,
          actor_name: row.actor_name,
          character_name: row.character_name,
          show_title: row.seasons?.shows?.title || "Unknown",
          season_number: row.seasons?.season_number || 0,
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
      <div className="mb-10">
        <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-xs mb-2 block">
          Supplementary List
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          Best Performances of{" "}
          <span className="text-amber-500">{year}</span>
        </h1>
        <p className="text-gray-400">
          Top individual acting performances of the year.
        </p>
        <div className="flex gap-3 mt-4">
          <Link
            href={`/episodes/${year}`}
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
          >
            Episode Rankings &rarr;
          </Link>
          <Link
            href="/all-time"
            className="text-xs text-gray-500 hover:text-amber-500 transition-colors bg-white/5 px-3 py-1.5 rounded-lg"
          >
            All-Time &rarr;
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading performance rankings...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {users.map((user) => {
            const performances = rankings[user.id] || [];
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

                <div className="space-y-3">
                  {performances.map((perf) => (
                    <div
                      key={perf.id}
                      className="glass rounded-xl p-4 border border-white/5 hover:border-amber-500/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0",
                            perf.rank_position <= 3
                              ? "rank-badge-top3 text-black"
                              : "bg-white/5 text-gray-400"
                          )}
                        >
                          {perf.rank_position}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-white text-sm">
                            {perf.actor_name}
                          </h4>
                          {perf.character_name && (
                            <p className="text-xs text-gray-400 italic">
                              as {perf.character_name}
                            </p>
                          )}
                          <p className="text-[11px] text-amber-500/70 mt-1">
                            {perf.show_title} S{perf.season_number}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  {performances.length === 0 && (
                    <div className="glass rounded-xl p-6 text-center">
                      <p className="text-gray-500 text-sm">No performance rankings yet</p>
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
