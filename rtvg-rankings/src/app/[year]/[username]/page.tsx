"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import RankingCard from "@/components/ranking/RankingCard";
import { fetchRankingsForYear } from "@/lib/supabase/queries";
import type { RankingEntry, User } from "@/types";

export default function UserRankingsPage() {
  const params = useParams();
  const yearStr = params.year as string;
  const username = params.username as string;
  const year = parseInt(yearStr, 10);

  const [user, setUser] = useState<User | null>(null);
  const [userRankings, setUserRankings] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const { rankings, users } = await fetchRankingsForYear(year);

      const matchedUser = users.find(
        (u) => u.display_name.toLowerCase() === username.toLowerCase()
      );

      if (!matchedUser) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setUser(matchedUser);
      setUserRankings(rankings[matchedUser.id] || []);
      setLoading(false);
    }
    loadData();
  }, [year, username]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 text-center">
        <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-gray-500 text-sm">Loading rankings...</p>
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 text-center">
        <h1 className="text-3xl font-black mb-4">User Not Found</h1>
        <p className="text-gray-400 mb-6">Could not find rankings for &quot;{username}&quot; in {year}.</p>
        <Link href={`/${year}`} className="text-amber-500 hover:text-amber-400 font-bold">
          Back to {year} Rankings
        </Link>
      </div>
    );
  }

  const avgScore = userRankings.filter((e) => e.score).length > 0
    ? (userRankings.reduce((sum, e) => sum + (e.score || 0), 0) / userRankings.filter((e) => e.score).length).toFixed(1)
    : "—";

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="mb-10">
        <div className="flex items-center gap-4 mb-4">
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
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase">
              {user.display_name}&apos;s{" "}
              <span className="text-amber-500">{year}</span>
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              {userRankings.length} shows ranked
            </p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      {userRankings.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">
              {userRankings.length}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Shows Ranked
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">{avgScore}</p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Avg Score
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">
              {userRankings.filter((e) => e.tier === "Instant Classic").length}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Instant Classics
            </p>
          </div>
          <div className="glass rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-amber-500">
              {new Set(userRankings.flatMap((e) => e.show?.genres || [])).size}
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">
              Genres
            </p>
          </div>
        </div>
      )}

      {/* Rankings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {userRankings.map((entry) => (
          <RankingCard key={entry.id} entry={entry} />
        ))}
      </div>

      {userRankings.length === 0 && (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">
            No rankings yet for {year}.
          </p>
        </div>
      )}
    </div>
  );
}
