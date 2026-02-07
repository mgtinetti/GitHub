"use client";

import { useState, useEffect } from "react";
import { TMDB_IMAGE_BASE } from "@/lib/constants";

interface TMDBSeason {
  id: number;
  season_number: number;
  name: string;
  air_date: string | null;
  episode_count: number;
  poster_path: string | null;
}

interface ShowDetails {
  id: number;
  name: string;
  poster_path: string | null;
  genres: { id: number; name: string }[];
  networks: { id: number; name: string }[];
  status: string;
  seasons: TMDBSeason[];
}

interface SeasonPickerProps {
  tmdbId: number;
  showName: string;
  year: number;
  existingSeasonIds: Set<string>;
  onSelect: (data: {
    tmdbId: number;
    showName: string;
    posterPath: string | null;
    genres: string[];
    network: string;
    status: string;
    seasonNumber: number;
    tmdbSeasonId: number;
    airDate: string | null;
    episodeCount: number;
    seasonPosterPath: string | null;
  }) => void;
  onCancel: () => void;
}

export default function SeasonPicker({
  tmdbId,
  showName,
  year,
  existingSeasonIds,
  onSelect,
  onCancel,
}: SeasonPickerProps) {
  const [details, setDetails] = useState<ShowDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDetails() {
      try {
        const res = await fetch(`/api/tmdb/show/${tmdbId}`);
        const data = await res.json();
        setDetails(data);
      } catch {
        console.error("Failed to fetch show details");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [tmdbId]);

  if (loading) {
    return (
      <div className="glass rounded-xl border border-white/10 p-6 text-center">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-gray-400 text-sm">Loading seasons for {showName}...</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="glass rounded-xl border border-white/10 p-6 text-center">
        <p className="text-red-400 text-sm">Failed to load show details.</p>
        <button
          onClick={onCancel}
          className="mt-3 text-xs text-gray-400 hover:text-white transition-colors"
        >
          Go back
        </button>
      </div>
    );
  }

  // Filter to real seasons (exclude specials / season 0)
  const seasons = details.seasons
    .filter((s) => s.season_number > 0)
    .sort((a, b) => b.season_number - a.season_number);

  return (
    <div className="glass rounded-xl border border-amber-500/20 p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-white">{showName}</h3>
          <p className="text-xs text-gray-400">Select a season to add to your {year} rankings</p>
        </div>
        <button
          onClick={onCancel}
          className="text-gray-500 hover:text-white transition-colors p-1"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {seasons.map((season) => {
          const seasonKey = `${tmdbId}-${season.season_number}`;
          const alreadyAdded = existingSeasonIds.has(seasonKey);

          return (
            <button
              key={season.id}
              disabled={alreadyAdded}
              onClick={() =>
                onSelect({
                  tmdbId: details.id,
                  showName: details.name,
                  posterPath: details.poster_path,
                  genres: details.genres.map((g) => g.name),
                  network: details.networks[0]?.name || "Unknown",
                  status: details.status,
                  seasonNumber: season.season_number,
                  tmdbSeasonId: season.id,
                  airDate: season.air_date,
                  episodeCount: season.episode_count,
                  seasonPosterPath: season.poster_path,
                })
              }
              className={`flex items-center gap-3 w-full px-4 py-3 rounded-lg text-left transition-all ${
                alreadyAdded
                  ? "opacity-40 cursor-not-allowed bg-white/5"
                  : "hover:bg-amber-500/10 hover:border-amber-500/30 border border-white/5"
              }`}
            >
              <div className="w-8 h-12 rounded overflow-hidden bg-white/5 shrink-0">
                {season.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}/w92${season.poster_path}`}
                    alt={season.name}
                    className="w-full h-full object-cover"
                  />
                ) : details.poster_path ? (
                  <img
                    src={`${TMDB_IMAGE_BASE}/w92${details.poster_path}`}
                    alt={season.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-600 text-[10px]">
                    S{season.season_number}
                  </div>
                )}
              </div>
              <div className="flex-grow min-w-0">
                <p className="font-semibold text-sm text-white">
                  Season {season.season_number}
                </p>
                <p className="text-xs text-gray-500">
                  {season.air_date
                    ? new Date(season.air_date).getFullYear()
                    : "TBA"}{" "}
                  &middot; {season.episode_count} episodes
                </p>
              </div>
              {alreadyAdded ? (
                <span className="text-[10px] text-gray-500 uppercase font-bold">Added</span>
              ) : (
                <span className="text-xs text-amber-500 font-bold">+ Add</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
