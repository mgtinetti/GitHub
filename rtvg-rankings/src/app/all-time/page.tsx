"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase/client";
import { fetchUsers } from "@/lib/supabase/queries";
import { cn } from "@/lib/utils";
import type { User } from "@/types";

interface AllTimeEntry {
  id: string;
  rank_position: number;
  show_title: string;
  poster_url: string;
  network: string;
}

export default function AllTimePage() {
  const [users, setUsers] = useState<User[]>([]);
  const [rankings, setRankings] = useState<Record<string, AllTimeEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("");

  useEffect(() => {
    async function loadData() {
      const users = await fetchUsers();
      setUsers(users);
      if (users.length > 0) setActiveTab(users[0].id);

      const allRankings: Record<string, AllTimeEntry[]> = {};

      await Promise.all(
        users.map(async (user) => {
          const { data } = await supabase
            .from("all_time_entries")
            .select("id, rank_position, shows!inner(title, poster_url, network)")
            .eq("user_id", user.id)
            .order("rank_position", { ascending: true });

          allRankings[user.id] = ((data || []) as any[]).map((row) => ({
            id: row.id,
            rank_position: row.rank_position,
            show_title: row.shows?.title || "Unknown",
            poster_url: row.shows?.poster_url || "/placeholder-poster.svg",
            network: row.shows?.network || "Unknown",
          }));
        })
      );

      setRankings(allRankings);
      setLoading(false);
    }
    loadData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <span className="text-amber-500 font-mono uppercase tracking-[0.3em] text-xs mb-2 block">
          Supplementary List
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          All-Time <span className="text-amber-500">Rankings</span>
        </h1>
        <p className="text-gray-400">
          Our personal top TV shows of all time, regardless of year.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        </div>
      ) : (
        <>
          {/* Mobile Tabs */}
          <div className="flex md:hidden mb-6 bg-white/5 p-1 rounded-xl glass">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setActiveTab(user.id)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  activeTab === user.id
                    ? "bg-amber-500 text-black shadow-lg"
                    : "text-gray-400"
                }`}
              >
                {user.display_name}
              </button>
            ))}
          </div>

          {/* Side-by-side columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {users.map((user) => {
              const userRankings = rankings[user.id] || [];

              return (
                <div
                  key={user.id}
                  className={`flex flex-col gap-3 ${
                    activeTab === user.id ? "block" : "hidden md:flex"
                  }`}
                >
                  {/* User Header */}
                  <div className="flex items-center gap-3 mb-2 px-1">
                    {user.avatar_url ? (
                      <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/50">
                        <Image
                          src={user.avatar_url}
                          alt={user.display_name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-sm border-2 border-amber-500/50">
                        {user.display_name[0]}
                      </div>
                    )}
                    <h2 className="text-xl font-bold">{user.display_name}</h2>
                    <div className="flex-grow h-px bg-white/10" />
                    <span className="text-[10px] font-mono text-gray-500 uppercase">
                      {userRankings.length} shows
                    </span>
                  </div>

                  {/* Rankings */}
                  <div className="space-y-2">
                    {userRankings.length > 0 ? (
                      userRankings.map((entry) => (
                        <div
                          key={entry.id}
                          className={cn(
                            "flex items-center gap-3 p-3 rounded-xl glass border border-white/5 hover:border-amber-500/20 transition-all group",
                            entry.rank_position <= 3 && "accent-glow"
                          )}
                        >
                          <div
                            className={cn(
                              "w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black shrink-0",
                              entry.rank_position <= 3
                                ? "rank-badge-top3 text-black"
                                : "bg-white/5 text-gray-400"
                            )}
                          >
                            {entry.rank_position}
                          </div>

                          <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0">
                            <Image
                              src={entry.poster_url}
                              alt={entry.show_title}
                              fill
                              className="object-cover"
                              sizes="40px"
                            />
                          </div>

                          <div className="flex-grow min-w-0">
                            <h3 className="font-bold text-white text-sm group-hover:text-amber-500 transition-colors truncate">
                              {entry.show_title}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                              {entry.network}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="glass rounded-xl p-8 text-center">
                        <p className="text-gray-500 text-sm">
                          No all-time rankings yet
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
