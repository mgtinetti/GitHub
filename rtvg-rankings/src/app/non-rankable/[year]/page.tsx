"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { fetchNonRankable, fetchActiveYears } from "@/lib/supabase/queries";
import type { NonRankableItem } from "@/lib/supabase/queries";
import type { User } from "@/types";
import { YEARS } from "@/lib/constants";

export default function NonRankablePage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);

  const [items, setItems] = useState<Record<string, NonRankableItem[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [allYears, setAllYears] = useState<number[]>([...YEARS]);
  const [activeTab, setActiveTab] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveYears().then((active) => {
      const merged = [...new Set([...active, ...YEARS])].sort((a, b) => b - a);
      setAllYears(merged);
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    fetchNonRankable(year).then(({ items: data, users: u }) => {
      setItems(data);
      setUsers(u);
      if (u.length > 0 && !activeTab) setActiveTab(u[0].id);
      setLoading(false);
    });
  }, [year]);

  const hasAny = Object.values(items).some((list) => list.length > 0);

  // Group items by category for each user
  function groupByCategory(list: NonRankableItem[]) {
    const groups: Record<string, NonRankableItem[]> = {};
    for (const item of list) {
      if (!groups[item.category]) groups[item.category] = [];
      groups[item.category].push(item);
    }
    return groups;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="text-center mb-8">
        <span className="text-amber-500 font-mono uppercase tracking-[0.5em] text-xs mb-4 block">
          Also Watched
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          {year} <span className="text-amber-500">Non-Rankable</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          Documentaries, reality TV, previous-year shows, and more — currently watching and loved, but not rankable.
        </p>
      </div>

      {/* Year selector */}
      <div className="flex gap-2 justify-center flex-wrap mb-8">
        {allYears.map((y) => (
          <Link
            key={y}
            href={`/non-rankable/${y}`}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              y === year
                ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/10"
            }`}
          >
            {y}
          </Link>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      ) : !hasAny ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">No non-rankable shows for {year} yet.</p>
        </div>
      ) : (
        <>
          {/* Mobile user tabs */}
          <div className="flex md:hidden mb-6 bg-white/5 p-1 rounded-xl glass">
            {users.filter((u) => (items[u.id] || []).length > 0).map((user) => (
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {users.map((user) => {
              const userItems = items[user.id] || [];
              if (userItems.length === 0) return null;
              const grouped = groupByCategory(userItems);

              return (
                <div
                  key={user.id}
                  className={activeTab === user.id ? "block" : "hidden md:block"}
                >
                  <div className="flex items-center gap-3 mb-5">
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
                    <div>
                      <h2 className="text-xl font-bold">{user.display_name}</h2>
                      <p className="text-[10px] text-gray-500 uppercase tracking-wider">
                        {userItems.length} {userItems.length === 1 ? "show" : "shows"}
                      </p>
                    </div>
                    <div className="flex-grow h-px bg-white/10" />
                  </div>

                  {Object.entries(grouped).map(([category, catItems]) => (
                    <div key={category} className="mb-5">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        {category}
                      </p>
                      <div className="space-y-2">
                        {catItems.map((item) => (
                          <Link
                            key={item.id}
                            href={`/show/${item.show.id}`}
                            className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-amber-500/20 transition-all group"
                          >
                            <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0">
                              <Image
                                src={item.show.poster_url || "/placeholder-poster.svg"}
                                alt={item.show.title}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="40px"
                              />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="font-bold text-sm truncate group-hover:text-amber-500 transition-colors">
                                {item.show.title}
                              </p>
                              <p className="text-[11px] text-gray-500">
                                S{item.season_number} · {item.show.network}
                              </p>
                              {item.note && (
                                <p className="text-[10px] text-gray-600 italic mt-0.5 truncate">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
