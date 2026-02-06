"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import RankingCard from "./RankingCard";
import type { RankingEntry, User } from "@/types";

interface SideBySideViewProps {
  rankings: Record<string, RankingEntry[]>;
  users: User[];
  year: number;
  limit?: number;
}

export default function SideBySideView({
  rankings,
  users,
  year,
  limit = 10,
}: SideBySideViewProps) {
  const [activeTab, setActiveTab] = useState(users[0]?.id || "");
  const [hoveredShow, setHoveredShow] = useState<string | null>(null);

  return (
    <div className="w-full">
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

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
        {users.map((user) => {
          const userRankings = (rankings[user.id] || []).slice(0, limit);

          return (
            <div
              key={user.id}
              className={`flex flex-col gap-3 ${
                activeTab === user.id ? "block" : "hidden md:flex"
              }`}
            >
              {/* User Header */}
              <div className="flex items-center gap-3 mb-2 px-1">
                <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-500/50">
                  <Image
                    src={user.avatar_url}
                    alt={user.display_name}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <h2 className="text-xl font-bold">{user.display_name}</h2>
                <div className="flex-grow h-px bg-white/10" />
                <span className="text-[10px] font-mono text-gray-500 uppercase">
                  Top {limit}
                </span>
              </div>

              {/* Rankings */}
              <div className="space-y-2">
                {userRankings.length > 0 ? (
                  userRankings.map((entry) => (
                    <div
                      key={entry.id}
                      onMouseEnter={() =>
                        setHoveredShow(entry.show?.title || null)
                      }
                      onMouseLeave={() => setHoveredShow(null)}
                    >
                      <RankingCard
                        entry={entry}
                        compact
                        highlighted={
                          hoveredShow !== null &&
                          hoveredShow === entry.show?.title
                        }
                      />
                    </div>
                  ))
                ) : (
                  <div className="glass rounded-xl p-8 text-center">
                    <p className="text-gray-500 text-sm">
                      No rankings yet for {year}
                    </p>
                  </div>
                )}
              </div>

              {/* View Full List */}
              {userRankings.length > 0 && (
                <Link
                  href={`/${year}/${user.display_name.toLowerCase()}`}
                  className="mt-2 py-3 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-xs font-bold text-gray-400 uppercase tracking-widest transition-colors text-center block"
                >
                  View Full List &rarr;
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
