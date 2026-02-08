"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { fetchRankingsForYear } from "@/lib/supabase/queries";
import { generateConsensusRankings } from "@/lib/utils";
import ConsensusView from "@/components/ranking/ConsensusView";
import type { ConsensusEntry, User } from "@/types";

export default function ConsensusPage() {
  const params = useParams();
  const year = parseInt(params.year as string, 10);

  const [consensus, setConsensus] = useState<ConsensusEntry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
