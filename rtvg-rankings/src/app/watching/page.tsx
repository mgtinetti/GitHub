"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchCurrentlyWatching } from "@/lib/supabase/queries";
import type { CurrentlyWatchingItem } from "@/lib/supabase/queries";
import type { User } from "@/types";

export default function WatchingPage() {
  const [watching, setWatching] = useState<Record<string, CurrentlyWatchingItem[]>>({});
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<string>("");

  useEffect(() => {
    fetchCurrentlyWatching().then(({ items, users: u }) => {
      setWatching(items);
      setUsers(u);
      if (u.length > 0) setActiveTab(u[0].id);
      setLoading(false);
    });
  }, []);

  const hasAny = Object.values(watching).some((items) => items.length > 0);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="text-center mb-12">
        <span className="text-emerald-500 font-mono uppercase tracking-[0.5em] text-xs mb-4 block">
          Live
        </span>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          Currently <span className="text-amber-500">Watching</span>
        </h1>
        <p className="text-gray-400 max-w-xl mx-auto">
          What the crew is tuned into right now.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      ) : !hasAny ? (
        <div className="glass rounded-3xl p-12 text-center">
          <p className="text-gray-500 text-lg">Nobody is watching anything right now.</p>
        </div>
      ) : (
        <>
        {/* Mobile user tabs */}
        <div className="flex md:hidden mb-6 bg-white/5 p-1 rounded-xl glass">
          {users.filter((u) => (watching[u.id] || []).length > 0).map((user) => (
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
            const items = watching[user.id] || [];
            if (items.length === 0) return null;
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
                      {items.length} {items.length === 1 ? "show" : "shows"}
                    </p>
                  </div>
                  <div className="flex-grow h-px bg-white/10" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/show/${item.show.id}`}
                      className="glass rounded-xl border border-white/5 hover:border-amber-500/20 transition-all group"
                    >
                      <div className="relative aspect-[2/3] rounded-t-xl overflow-hidden">
                        <Image
                          src={item.show.poster_url || "/placeholder-poster.svg"}
                          alt={item.show.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                          sizes="(max-width: 768px) 40vw, 15vw"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <p className="text-[10px] text-amber-500/80 font-mono uppercase">
                            S{item.season_number}
                          </p>
                        </div>
                      </div>
                      <div className="p-3">
                        <p className="font-bold text-sm truncate group-hover:text-amber-500 transition-colors">
                          {item.show.title}
                        </p>
                        <p className="text-[11px] text-gray-500">{item.show.network}</p>
                      </div>
                    </Link>
                  ))}
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
