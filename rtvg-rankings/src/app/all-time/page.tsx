"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { fetchUsers } from "@/lib/supabase/queries";
import type { User } from "@/types";

export default function AllTimeOverviewPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers().then((u) => {
      setUsers(u);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {users.map((user) => (
            <Link
              key={user.id}
              href={`/all-time/${user.display_name.toLowerCase()}`}
              className="glass rounded-2xl p-6 border border-white/5 hover:border-amber-500/30 transition-all group text-center"
            >
              {user.avatar_url ? (
                <div className="relative w-20 h-20 rounded-full mx-auto mb-4 overflow-hidden border-4 border-amber-500/30 group-hover:border-amber-500 transition-colors">
                  <Image
                    src={user.avatar_url}
                    alt={user.display_name}
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full mx-auto mb-4 bg-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-2xl border-4 border-amber-500/30 group-hover:border-amber-500 transition-colors">
                  {user.display_name[0]}
                </div>
              )}
              <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-amber-500 transition-colors">
                {user.display_name}
              </h3>
              <p className="text-xs text-gray-500 mt-1">View All-Time List &rarr;</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
