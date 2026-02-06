"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import SideBySideView from "@/components/ranking/SideBySideView";
import ConsensusView from "@/components/ranking/ConsensusView";
import DisagreementsView from "@/components/ranking/DisagreementsView";
import RankingCard from "@/components/ranking/RankingCard";
import GenreFilter from "@/components/ranking/GenreFilter";
import type { RankingEntry, ConsensusEntry, DisagreementEntry, User } from "@/types";

type ViewMode = "side-by-side" | "consensus" | "disagreements" | "individual";

interface Props {
  year: number;
  rankings: Record<string, RankingEntry[]>;
  consensus: ConsensusEntry[];
  disagreements: DisagreementEntry[];
  users: User[];
  genres: string[];
}

export default function YearRankingsClient({
  year,
  rankings,
  consensus,
  disagreements,
  users,
  genres,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [selectedUser, setSelectedUser] = useState(users[0]?.id || "");

  const viewModes: { key: ViewMode; label: string }[] = [
    { key: "side-by-side", label: "Side by Side" },
    { key: "consensus", label: "Consensus" },
    { key: "disagreements", label: "Disagreements" },
    { key: "individual", label: "Individual" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-3 uppercase">
            {year}{" "}
            <span className="text-amber-500">Rankings</span>
          </h1>
          <div className="flex items-center gap-4 text-sm text-gray-500 font-mono uppercase">
            <span>Last Updated: Feb 6, 2026</span>
            {year < 2026 && (
              <>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                <span className="text-emerald-400">Finalized</span>
              </>
            )}
          </div>
        </div>

        {/* View Mode Tabs */}
        <div className="flex gap-1 bg-white/5 p-1 rounded-xl glass shrink-0 overflow-x-auto">
          {viewModes.map((mode) => (
            <button
              key={mode.key}
              onClick={() => setViewMode(mode.key)}
              className={`px-3 md:px-4 py-2 rounded-lg text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                viewMode === mode.key
                  ? "bg-amber-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>

      {/* Genre Filter */}
      {genres.length > 0 && (
        <div className="mb-8">
          <GenreFilter genres={genres} year={year} />
        </div>
      )}

      {/* Content */}
      {viewMode === "side-by-side" && (
        <SideBySideView
          rankings={rankings}
          users={users}
          year={year}
          limit={15}
        />
      )}

      {viewMode === "consensus" && (
        <div>
          <p className="text-gray-400 text-sm mb-6">
            Aggregate rankings based on average position across all contributors.
          </p>
          <ConsensusView entries={consensus} users={users} />
        </div>
      )}

      {viewMode === "disagreements" && (
        <div>
          <p className="text-gray-400 text-sm mb-6">
            Shows where our rankings differ the most. Sorted by spread (largest disagreement first).
          </p>
          <DisagreementsView entries={disagreements} users={users} />
        </div>
      )}

      {viewMode === "individual" && (
        <div>
          {/* User selector */}
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide mb-8">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => setSelectedUser(user.id)}
                className={`flex items-center gap-3 px-5 py-3 rounded-2xl glass shrink-0 transition-all ${
                  selectedUser === user.id
                    ? "ring-2 ring-amber-500 bg-amber-500/10"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <div className="relative w-8 h-8 rounded-full overflow-hidden">
                  <Image
                    src={user.avatar_url}
                    alt={user.display_name}
                    fill
                    className="object-cover"
                    sizes="32px"
                  />
                </div>
                <span className="font-bold">{user.display_name}</span>
              </button>
            ))}
          </div>

          {/* Full list */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(rankings[selectedUser] || []).map((entry) => (
              <RankingCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
