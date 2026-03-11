"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
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
  genres: string[];
}

export default function UserAllTimePage() {
  const params = useParams();
  const username = params.username as string;

  const [user, setUser] = useState<User | null>(null);
  const [entries, setEntries] = useState<AllTimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const users = await fetchUsers();
      const matched = users.find(
        (u) => u.display_name.toLowerCase() === username.toLowerCase()
      );

      if (!matched) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setUser(matched);

      const { data } = await supabase
        .from("all_time_entries")
        .select(`
          id, rank_position,
          shows!inner ( title, poster_url, network, genres )
        `)
        .eq("user_id", matched.id)
        .order("rank_position", { ascending: true });

      const mapped: AllTimeEntry[] = ((data || []) as any[]).map((row) => ({
        id: row.id,
        rank_position: row.rank_position,
        show_title: row.shows?.title || "Unknown",
        poster_url: row.shows?.poster_url || "/placeholder-poster.svg",
        network: row.shows?.network || "Unknown",
        genres: row.shows?.genres || [],
      }));

      setEntries(mapped);
      setLoading(false);
    }
    loadData();
  }, [username]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading rankings...</p>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-black mb-4">User Not Found</h1>
        <Link href="/all-time" className="text-amber-500">Back to All-Time</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="mb-10">
        <Link
          href="/all-time"
          className="text-sm text-gray-500 hover:text-amber-500 transition-colors mb-4 block"
        >
          &larr; All Users
        </Link>
        <div className="flex items-center gap-4">
          {user.avatar_url ? (
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-amber-500/50">
              <Image
                src={user.avatar_url}
                alt={user.display_name}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>
          ) : (
            <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl border-2 border-amber-500/50">
              {user.display_name[0]}
            </div>
          )}
          <div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
              {user.display_name}&apos;s{" "}
              <span className="text-amber-500">All-Time</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Top {entries.length} TV shows of all time
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className={cn(
              "flex items-center gap-4 p-4 rounded-2xl glass border border-white/5 hover:border-amber-500/20 transition-all group",
              entry.rank_position <= 3 && "accent-glow"
            )}
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black shrink-0",
                entry.rank_position <= 3
                  ? "rank-badge-top3 text-black"
                  : "bg-white/5 text-gray-400"
              )}
            >
              {entry.rank_position}
            </div>

            <div className="relative w-14 h-20 rounded-lg overflow-hidden shrink-0">
              <Image
                src={entry.poster_url}
                alt={entry.show_title}
                fill
                className="object-cover"
                sizes="56px"
              />
            </div>

            <div className="flex-grow min-w-0">
              <h3 className="font-bold text-white text-lg group-hover:text-amber-500 transition-colors truncate">
                {entry.show_title}
              </h3>
              <p className="text-sm text-gray-400">
                {entry.network}
              </p>
            </div>

            <div className="flex flex-wrap gap-1 shrink-0 hidden sm:flex">
              {entry.genres.map((g) => (
                <span
                  key={g}
                  className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-gray-400 uppercase"
                >
                  {g}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {entries.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">No all-time rankings yet.</p>
        </div>
      )}
    </div>
  );
}
