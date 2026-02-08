"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import ShowSearch from "@/components/manage/ShowSearch";

interface WatchingEntry {
  id: string;
  show_id: string;
  show_title: string;
  poster_url: string | null;
  network: string;
  season_number: number;
}

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export default function ManageWatchingPage() {
  const { user, loading: authLoading } = useAuth();
  const [entries, setEntries] = useState<WatchingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Show search / season picker state
  const [selectedShow, setSelectedShow] = useState<{
    id: number;
    name: string;
    poster_path: string | null;
  } | null>(null);
  const [showSeasons, setShowSeasons] = useState<
    { season_number: number; name: string; air_date: string | null; episode_count: number }[]
  >([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  useEffect(() => {
    if (!user) return;
    loadEntries();
  }, [user]);

  async function loadEntries() {
    if (!user) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("currently_watching")
      .select(
        `
        id,
        show_id,
        season_number,
        shows!inner (
          title,
          poster_url,
          network
        )
      `
      )
      .eq("user_id", user.id)
      .order("added_at", { ascending: false });

    if (!error && data) {
      setEntries(
        (data as any[]).map((row) => ({
          id: row.id,
          show_id: row.show_id,
          show_title: row.shows.title,
          poster_url: row.shows.poster_url,
          network: row.shows.network || "Unknown",
          season_number: row.season_number,
        }))
      );
    }
    setLoading(false);
  }

  async function onShowSelected(show: { id: number; name: string; poster_path: string | null }) {
    setSelectedShow(show);
    setLoadingSeasons(true);
    try {
      const res = await fetch(`/api/tmdb/show/${show.id}`);
      const data = await res.json();
      const seasons = (data.seasons || [])
        .filter((s: any) => s.season_number > 0)
        .map((s: any) => ({
          season_number: s.season_number,
          name: s.name,
          air_date: s.air_date,
          episode_count: s.episode_count,
        }));
      setShowSeasons(seasons);
    } catch {
      setShowSeasons([]);
    }
    setLoadingSeasons(false);
  }

  async function handleSeasonSelected(seasonNumber: number) {
    if (!user || !selectedShow) return;
    setSaving(true);

    // Fetch full show details for DB record
    let showDetails: any = null;
    try {
      const res = await fetch(`/api/tmdb/show/${selectedShow.id}`);
      showDetails = await res.json();
    } catch {
      setSaving(false);
      return;
    }

    // Ensure show exists in DB
    const { data: existingShow } = await supabase
      .from("shows")
      .select("id")
      .eq("tmdb_id", selectedShow.id)
      .single();

    let showDbId: string;

    if (existingShow) {
      showDbId = existingShow.id;
    } else {
      const posterUrl = selectedShow.poster_path
        ? `${TMDB_IMAGE_BASE}/w342${selectedShow.poster_path}`
        : null;
      const { data: newShow, error } = await supabase
        .from("shows")
        .insert({
          tmdb_id: selectedShow.id,
          title: showDetails?.name || selectedShow.name,
          poster_url: posterUrl,
          genres: (showDetails?.genres || []).map((g: any) => g.name),
          network: showDetails?.networks?.[0]?.name || "Unknown",
          status: showDetails?.status || "Unknown",
        })
        .select("id")
        .single();

      if (error || !newShow) {
        setSaving(false);
        return;
      }
      showDbId = newShow.id;
    }

    // Insert currently watching entry
    const { error } = await supabase.from("currently_watching").insert({
      user_id: user.id,
      show_id: showDbId,
      season_number: seasonNumber,
    });

    if (!error) {
      setSelectedShow(null);
      setShowSeasons([]);
      await loadEntries();
    }
    setSaving(false);
  }

  async function removeEntry(id: string) {
    await supabase.from("currently_watching").delete().eq("id", id);
    setEntries((prev) => prev.filter((e) => e.id !== id));
  }

  if (authLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Sign in required</h1>
        <Link href="/admin" className="text-amber-500">
          Go to Admin
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/admin"
          className="text-gray-500 hover:text-white transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
          Currently <span className="text-amber-500">Watching</span>
        </h1>
      </div>
      <p className="text-gray-400 text-sm mb-8">
        Manage what you&apos;re currently watching. This appears on the homepage.
      </p>

      {/* Add Show */}
      <div className="glass rounded-xl border border-white/5 p-6 mb-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Add a Show
        </h2>

        {!selectedShow ? (
          <ShowSearch onSelect={onShowSelected} />
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-gray-300">
                Selected: <span className="font-bold text-white">{selectedShow.name}</span>
              </p>
              <button
                onClick={() => { setSelectedShow(null); setShowSeasons([]); }}
                className="text-xs text-gray-500 hover:text-white"
              >
                Change
              </button>
            </div>
            {loadingSeasons ? (
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                Loading seasons...
              </div>
            ) : showSeasons.length === 0 ? (
              <p className="text-sm text-gray-500">No seasons found.</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {showSeasons.map((s) => {
                  const alreadyAdded = entries.some(
                    (e) => e.show_title === selectedShow.name && e.season_number === s.season_number
                  );
                  return (
                    <button
                      key={s.season_number}
                      onClick={() => !alreadyAdded && handleSeasonSelected(s.season_number)}
                      disabled={alreadyAdded || saving}
                      className={`p-3 rounded-lg text-left text-sm transition-all ${
                        alreadyAdded
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-white/5 hover:bg-amber-500/20 hover:border-amber-500/30 border border-white/10 text-gray-300"
                      }`}
                    >
                      <p className="font-bold">Season {s.season_number}</p>
                      <p className="text-xs text-gray-500">
                        {s.episode_count} eps
                        {s.air_date ? ` · ${new Date(s.air_date).getFullYear()}` : ""}
                      </p>
                      {alreadyAdded && (
                        <span className="text-[10px] text-amber-500 uppercase tracking-wider">Added</span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
            {saving && (
              <p className="text-xs text-gray-400 mt-2">Adding...</p>
            )}
          </div>
        )}
      </div>

      {/* Current List */}
      <div className="glass rounded-xl border border-white/5 p-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Your List ({entries.length})
        </h2>

        {loading ? (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-8">
            No shows yet. Search above to add what you&apos;re watching.
          </p>
        ) : (
          <div className="space-y-2">
            {entries.map((entry) => (
              <div
                key={entry.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-white/5 group"
              >
                <div className="relative w-10 h-14 rounded-lg overflow-hidden shrink-0">
                  <Image
                    src={entry.poster_url || "/placeholder-poster.svg"}
                    alt={entry.show_title}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
                <div className="flex-grow min-w-0">
                  <p className="font-bold text-sm truncate">{entry.show_title}</p>
                  <p className="text-xs text-gray-400">
                    Season {entry.season_number} &middot; {entry.network}
                  </p>
                </div>
                <button
                  onClick={() => removeEntry(entry.id)}
                  className="text-gray-600 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover:opacity-100"
                  title="Remove"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
