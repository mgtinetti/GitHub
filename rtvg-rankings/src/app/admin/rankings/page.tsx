"use client";

import { Suspense, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { fetchActiveYears } from "@/lib/supabase/queries";
import ShowSearch from "@/components/manage/ShowSearch";
import SeasonPicker from "@/components/manage/SeasonPicker";
import RankingList, { type ManagedEntry } from "@/components/manage/RankingList";
import { YEARS } from "@/lib/constants";
import { TMDB_IMAGE_BASE } from "@/lib/constants";
import type { Tier } from "@/types";

interface SelectedShow {
  tmdbId: number;
  name: string;
  posterPath: string | null;
}

export default function ManageRankingsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      }
    >
      <ManageRankingsContent />
    </Suspense>
  );
}

function ManageRankingsContent() {
  const { user, displayName, loading: authLoading } = useAuth();
  const [year, setYear] = useState<number>(YEARS[0]);
  const [availableYears, setAvailableYears] = useState<number[]>([...YEARS]);
  const [entries, setEntries] = useState<ManagedEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [selectedShow, setSelectedShow] = useState<SelectedShow | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [showAddYear, setShowAddYear] = useState(false);
  const [newYearInput, setNewYearInput] = useState("");

  // Load available years
  useEffect(() => {
    fetchActiveYears().then((activeYears) => {
      const merged = [...new Set([...activeYears, ...YEARS])].sort((a, b) => b - a);
      setAvailableYears(merged);
    });
  }, []);

  // Load existing rankings from Supabase
  const loadRankings = useCallback(
    async function loadRankings() {
      if (!user) return;
      setLoadingEntries(true);

      const { data, error } = await supabase
        .from("ranking_entries")
        .select(
          `
        id,
        rank_position,
        score,
        tier,
        review,
        season_id,
        seasons!inner (
          id,
          season_number,
          tmdb_season_id,
          air_date_start,
          episode_count,
          poster_url,
          show_id,
          shows!inner (
            id,
            tmdb_id,
            title,
            poster_url,
            genres,
            network,
            status
          )
        )
      `
        )
        .eq("user_id", user.id)
        .eq("year", year)
        .order("rank_position", { ascending: true });

      if (error) {
        console.error("Failed to load rankings:", error.message);
        setEntries([]);
        setLoadingEntries(false);
        return;
      }

      const mapped: ManagedEntry[] = (data || []).map((row: any) => {
        const season = row.seasons;
        const show = season?.shows;
        return {
          localId: `db-${row.id}`,
          tmdbId: show?.tmdb_id || 0,
          showName: show?.title || "Unknown",
          posterPath: show?.poster_url || null,
          network: show?.network || "Unknown",
          genres: show?.genres || [],
          seasonNumber: season?.season_number || 0,
          tmdbSeasonId: season?.tmdb_season_id || 0,
          airDate: season?.air_date_start || null,
          episodeCount: season?.episode_count || 0,
          score: row.score,
          tier: row.tier,
          review: row.review,
          dbId: row.id,
          showDbId: show?.id,
          seasonDbId: season?.id,
        };
      });

      setEntries(mapped);
      setLoadingEntries(false);
      setHasChanges(false);
    },
    [user, year]
  );

  useEffect(() => {
    if (user) {
      loadRankings();
    }
  }, [user, year, loadRankings]);

  // Set of existing show+season combos to prevent duplicates
  const existingSeasonIds = new Set(
    entries.map((e) => `${e.tmdbId}-${e.seasonNumber}`)
  );

  function handleShowSelected(show: { id: number; name: string; poster_path: string | null }) {
    setSelectedShow({
      tmdbId: show.id,
      name: show.name,
      posterPath: show.poster_path,
    });
  }

  async function handleSeasonSelected(data: {
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
  }) {
    // Ensure show exists in DB
    const posterUrl = data.posterPath
      ? `${TMDB_IMAGE_BASE}/w342${data.posterPath}`
      : null;

    const { data: existingShow } = await supabase
      .from("shows")
      .select("id")
      .eq("tmdb_id", data.tmdbId)
      .single();

    let showDbId: string;
    if (existingShow) {
      showDbId = existingShow.id;
    } else {
      const { data: newShow, error: showErr } = await supabase
        .from("shows")
        .insert({
          tmdb_id: data.tmdbId,
          title: data.showName,
          poster_url: posterUrl,
          genres: data.genres,
          network: data.network,
          status: data.status,
        })
        .select("id")
        .single();

      if (showErr || !newShow) {
        console.error("Failed to create show:", showErr?.message);
        return;
      }
      showDbId = newShow.id;
    }

    // Ensure season exists in DB
    const { data: existingSeason } = await supabase
      .from("seasons")
      .select("id")
      .eq("show_id", showDbId)
      .eq("season_number", data.seasonNumber)
      .single();

    let seasonDbId: string;
    if (existingSeason) {
      seasonDbId = existingSeason.id;
    } else {
      const { data: newSeason, error: seasonErr } = await supabase
        .from("seasons")
        .insert({
          show_id: showDbId,
          tmdb_season_id: data.tmdbSeasonId,
          season_number: data.seasonNumber,
          air_date_start: data.airDate,
          episode_count: data.episodeCount,
          poster_url: data.seasonPosterPath
            ? `${TMDB_IMAGE_BASE}/w342${data.seasonPosterPath}`
            : null,
        })
        .select("id")
        .single();

      if (seasonErr || !newSeason) {
        console.error("Failed to create season:", seasonErr?.message);
        return;
      }
      seasonDbId = newSeason.id;
    }

    // Add to local entries list
    const newEntry: ManagedEntry = {
      localId: `new-${Date.now()}`,
      tmdbId: data.tmdbId,
      showName: data.showName,
      posterPath: data.posterPath,
      network: data.network,
      genres: data.genres,
      seasonNumber: data.seasonNumber,
      tmdbSeasonId: data.tmdbSeasonId,
      airDate: data.airDate,
      episodeCount: data.episodeCount,
      score: null,
      tier: null,
      review: null,
      showDbId,
      seasonDbId,
    };

    setEntries((prev) => [...prev, newEntry]);
    setSelectedShow(null);
    setHasChanges(true);
  }

  function handleReorder(newEntries: ManagedEntry[]) {
    setEntries(newEntries);
    setHasChanges(true);
  }

  function handleRemove(localId: string) {
    setEntries((prev) => prev.filter((e) => e.localId !== localId));
    setHasChanges(true);
  }

  function handleUpdateEntry(localId: string, updates: Partial<ManagedEntry>) {
    setEntries((prev) =>
      prev.map((e) => (e.localId === localId ? { ...e, ...updates } : e))
    );
    setHasChanges(true);
  }

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    setSaveMessage(null);

    try {
      // Delete all existing entries for this user+year
      const { error: deleteErr } = await supabase
        .from("ranking_entries")
        .delete()
        .eq("user_id", user.id)
        .eq("year", year);

      if (deleteErr) {
        throw new Error(`Delete failed: ${deleteErr.message}`);
      }

      // Insert all entries with new positions
      if (entries.length > 0) {
        const rows = entries.map((entry, index) => ({
          user_id: user.id,
          season_id: entry.seasonDbId,
          year,
          rank_position: index + 1,
          score: entry.score,
          tier: entry.tier,
          review: entry.review,
        }));

        const { error: insertErr } = await supabase
          .from("ranking_entries")
          .insert(rows);

        if (insertErr) {
          throw new Error(`Insert failed: ${insertErr.message}`);
        }
      }

      setSaveMessage("Rankings saved!");
      setHasChanges(false);

      // Reload to get fresh DB IDs
      await loadRankings();
    } catch (err: any) {
      setSaveMessage(`Error: ${err.message}`);
    } finally {
      setSaving(false);
      setTimeout(() => setSaveMessage(null), 4000);
    }
  }

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 md:px-8 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
        <p className="text-gray-400 mb-6">You need to be signed in to manage rankings.</p>
        <Link href="/admin" className="text-amber-500 hover:text-amber-400 font-semibold">
          Go to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin"
          className="text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
          Manage <span className="text-amber-500">Rankings</span>
        </h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        {displayName ? `Editing as ${displayName}` : "Editing your rankings"} &middot; Drag to
        reorder, search to add shows
      </p>

      {/* Year Selector */}
      <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
        {availableYears.map((y) => (
          <button
            key={y}
            onClick={() => {
              if (hasChanges && !confirm("You have unsaved changes. Switch year anyway?")) return;
              setYear(y);
            }}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0 ${
              y === year
                ? "bg-amber-500 text-black"
                : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            {y}
          </button>
        ))}
        {showAddYear ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const parsed = parseInt(newYearInput, 10);
              if (parsed >= 2000 && parsed <= 2100 && !availableYears.includes(parsed)) {
                setAvailableYears((prev) => [parsed, ...prev].sort((a, b) => b - a));
                setYear(parsed);
              }
              setNewYearInput("");
              setShowAddYear(false);
            }}
            className="flex items-center gap-1 shrink-0"
          >
            <input
              type="number"
              min="2000"
              max="2100"
              value={newYearInput}
              onChange={(e) => setNewYearInput(e.target.value)}
              placeholder="Year"
              autoFocus
              className="w-20 px-3 py-2 rounded-xl text-sm bg-white/5 border border-amber-500/30 text-white text-center focus:outline-none focus:border-amber-500"
            />
            <button
              type="submit"
              className="px-3 py-2 rounded-xl text-sm font-bold bg-amber-500 text-black"
            >
              Add
            </button>
            <button
              type="button"
              onClick={() => { setShowAddYear(false); setNewYearInput(""); }}
              className="px-2 py-2 text-gray-500 hover:text-white"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </form>
        ) : (
          <button
            onClick={() => setShowAddYear(true)}
            className="px-3 py-2 rounded-xl text-sm font-bold bg-white/5 text-gray-500 hover:text-amber-500 hover:bg-white/10 transition-all shrink-0 border border-dashed border-white/10"
            title="Add a new year"
          >
            + Year
          </button>
        )}
      </div>

      {/* Search + Season Picker */}
      <div className="mb-8">
        {selectedShow ? (
          <SeasonPicker
            tmdbId={selectedShow.tmdbId}
            showName={selectedShow.name}
            year={year}
            existingSeasonIds={existingSeasonIds}
            onSelect={handleSeasonSelected}
            onCancel={() => setSelectedShow(null)}
          />
        ) : (
          <ShowSearch onSelect={handleShowSelected} />
        )}
      </div>

      {/* Rankings List */}
      {loadingEntries ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading your rankings...</p>
        </div>
      ) : (
        <RankingList
          entries={entries}
          onReorder={handleReorder}
          onRemove={handleRemove}
          onUpdateEntry={handleUpdateEntry}
        />
      )}

      {/* Save Bar */}
      {entries.length > 0 && (
        <div className="sticky bottom-4 mt-8">
          <div className="glass-strong rounded-2xl border border-white/10 p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-white">
                {entries.length} show{entries.length !== 1 ? "s" : ""} ranked
              </p>
              {saveMessage && (
                <p
                  className={`text-xs mt-0.5 ${
                    saveMessage.startsWith("Error") ? "text-red-400" : "text-emerald-400"
                  }`}
                >
                  {saveMessage}
                </p>
              )}
            </div>
            <button
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                saving || !hasChanges
                  ? "bg-white/5 text-gray-600 cursor-not-allowed"
                  : "bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/20"
              }`}
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : hasChanges ? (
                "Save Rankings"
              ) : (
                "Saved"
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
