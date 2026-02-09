"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchRankingsForYear, fetchActiveYears } from "@/lib/supabase/queries";
import { YEARS } from "@/lib/constants";
import { generateConsensusRankings } from "@/lib/utils";
import ConsensusView from "@/components/ranking/ConsensusView";
import type { ConsensusEntry, User } from "@/types";

export default function ConsensusPage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);

  const [consensus, setConsensus] = useState<ConsensusEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
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
      const { rankings, users: u } = await fetchRankingsForYear(year);
      setUsers(u);
      setConsensus(generateConsensusRankings(rankings));
      setLoading(false);
    }
    loadData();
  }, [year]);

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Year Switcher */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {allYears.map((y) => (
          <Link
            key={y}
            href={`/${y}/consensus`}
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

      <div className="mb-10">
        <Link
          href={`/${year}`}
          className="text-sm text-gray-500 hover:text-amber-500 transition-colors mb-4 block"
        >
          &larr; Back to {year} Rankings
        </Link>
        <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase mb-3">
          {year}{" "}
          <span className="text-amber-500">Consensus</span>
        </h1>
        <p className="text-gray-400">
          Aggregate rankings based on average position. Only includes shows ranked by at least 2 of 3 contributors.
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading consensus...</p>
        </div>
      ) : (
        <ConsensusView entries={consensus} users={users} />
      )}
    </div>
  );
}
