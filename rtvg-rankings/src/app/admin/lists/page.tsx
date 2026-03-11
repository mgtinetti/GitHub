"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/lib/supabase/client";
import { fetchActiveYears, fetchUsers } from "@/lib/supabase/queries";
import ShowSearch from "@/components/manage/ShowSearch";
import type { User } from "@/types";

type ListTab = "episodes" | "performances" | "all-time" | "non-rankable";

const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

const NON_RANKABLE_CATEGORIES = [
  "Documentary",
  "Reality TV",
  "Previous Year",
  "Limited/Special",
  "Sports",
  "Other",
];

interface EpisodeItem {
  id: string;
  rank_position: number;
  show_title: string;
  poster_url: string;
  season_number: number;
  episode_number: number;
  episode_title: string;
}

interface PerformanceItem {
  id: string;
  rank_position: number;
  actor_name: string;
  character_name: string | null;
  show_title: string;
  season_number: number;
}

interface AllTimeItem {
  id: string;
  rank_position: number;
  show_title: string;
  poster_url: string;
  network: string;
}

interface NonRankableItem {
  id: string;
  show_title: string;
  poster_url: string;
  network: string;
  season_number: number;
  category: string;
  note: string | null;
  sort_order: number;
}

async function ensureShowInDb(tmdbId: number, showName: string, posterPath: string | null) {
  const { data: existing } = await supabase
    .from("shows")
    .select("id")
    .eq("tmdb_id", tmdbId)
    .single();

  if (existing) return existing.id;

  let details: any = null;
  try {
    const res = await fetch(`/api/tmdb/show/${tmdbId}`);
    details = await res.json();
  } catch { /* use fallback */ }

  const posterUrl = posterPath ? `${TMDB_IMAGE_BASE}/w342${posterPath}` : null;
  const { data: newShow, error } = await supabase
    .from("shows")
    .insert({
      tmdb_id: tmdbId,
      title: details?.name || showName,
      poster_url: posterUrl,
      genres: (details?.genres || []).map((g: any) => g.name),
      network: details?.networks?.[0]?.name || "Unknown",
      status: details?.status || "Unknown",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Failed to insert show:", error);
    // If insert failed due to race condition (duplicate), try fetching again
    const { data: retry } = await supabase
      .from("shows")
      .select("id")
      .eq("tmdb_id", tmdbId)
      .single();
    return retry?.id || null;
  }

  return newShow?.id || null;
}

async function ensureSeasonInDb(showDbId: string, tmdbId: number, seasonNumber: number) {
  const { data: existing } = await supabase
    .from("seasons")
    .select("id")
    .eq("show_id", showDbId)
    .eq("season_number", seasonNumber)
    .single();

  if (existing) return existing.id;

  let details: any = null;
  try {
    const res = await fetch(`/api/tmdb/show/${tmdbId}`);
    details = await res.json();
  } catch { /* use fallback */ }

  const tmdbSeason = (details?.seasons || []).find(
    (s: any) => s.season_number === seasonNumber
  );

  const { data: newSeason } = await supabase
    .from("seasons")
    .insert({
      show_id: showDbId,
      tmdb_season_id: tmdbSeason?.id || 0,
      season_number: seasonNumber,
      air_date_start: tmdbSeason?.air_date || null,
      episode_count: tmdbSeason?.episode_count || 0,
      poster_url: tmdbSeason?.poster_path
        ? `${TMDB_IMAGE_BASE}/w342${tmdbSeason.poster_path}`
        : null,
    })
    .select("id")
    .single();

  return newSeason?.id || null;
}

export default function ManageListsPage() {
  const { user, loading: authLoading } = useAuth();
  const [tab, setTab] = useState<ListTab>("episodes");
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [saving, setSaving] = useState(false);

  // User picker — manage lists for any user
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [managingUserId, setManagingUserId] = useState<string | null>(null);

  // Shared show selection state
  const [selectedShow, setSelectedShow] = useState<{
    id: number; name: string; poster_path: string | null;
  } | null>(null);
  const [showSeasons, setShowSeasons] = useState<
    { season_number: number; name: string; air_date: string | null; episode_count: number }[]
  >([]);
  const [loadingSeasons, setLoadingSeasons] = useState(false);

  // Episode form
  const [epSeasonNum, setEpSeasonNum] = useState<number | null>(null);
  const [seasonEpisodes, setSeasonEpisodes] = useState<
    { episode_number: number; name: string; air_date: string; still_path: string | null }[]
  >([]);
  const [loadingSeasonEps, setLoadingSeasonEps] = useState(false);
  const [epFilter, setEpFilter] = useState("");
  // Manual fallback fields
  const [epEpisodeNum, setEpEpisodeNum] = useState("");
  const [epTitle, setEpTitle] = useState("");
  const [episodes, setEpisodes] = useState<EpisodeItem[]>([]);
  const [loadingEpisodes, setLoadingEpisodes] = useState(false);

  // Performance form
  const [perfSeasonNum, setPerfSeasonNum] = useState<number | null>(null);
  const [showCast, setShowCast] = useState<
    { id: number; name: string; character: string; profile_path: string | null }[]
  >([]);
  const [loadingCast, setLoadingCast] = useState(false);
  const [castFilter, setCastFilter] = useState("");
  // Manual fallback fields
  const [actorName, setActorName] = useState("");
  const [charName, setCharName] = useState("");
  const [performances, setPerformances] = useState<PerformanceItem[]>([]);
  const [loadingPerfs, setLoadingPerfs] = useState(false);

  // All-time
  const [allTime, setAllTime] = useState<AllTimeItem[]>([]);
  const [loadingAllTime, setLoadingAllTime] = useState(false);

  // Non-rankable
  const [nonRankable, setNonRankable] = useState<NonRankableItem[]>([]);
  const [loadingNonRankable, setLoadingNonRankable] = useState(false);
  const [nrCategory, setNrCategory] = useState("Other");
  const [nrNote, setNrNote] = useState("");

  useEffect(() => {
    fetchActiveYears().then((y) => {
      const currentYear = new Date().getFullYear();
      const merged = [...new Set([currentYear, ...y])].sort((a, b) => b - a);
      setYears(merged);
      setSelectedYear(merged[0]);
    });
    fetchUsers().then((users) => {
      setAllUsers(users);
    });
  }, []);

  // Default managingUserId to the logged-in user
  useEffect(() => {
    if (user && !managingUserId) {
      setManagingUserId(user.id);
    }
  }, [user]);

  useEffect(() => {
    if (!managingUserId) return;
    if (tab === "episodes") loadEpisodes();
    if (tab === "performances") loadPerformances();
    if (tab === "all-time") loadAllTime();
    if (tab === "non-rankable") loadNonRankable();
  }, [managingUserId, tab, selectedYear]);

  function resetShowSelection() {
    setSelectedShow(null);
    setShowSeasons([]);
    setEpSeasonNum(null);
    setSeasonEpisodes([]);
    setEpFilter("");
    setEpEpisodeNum("");
    setEpTitle("");
    setPerfSeasonNum(null);
    setShowCast([]);
    setCastFilter("");
    setActorName("");
    setCharName("");
    setNrCategory("Other");
    setNrNote("");
  }

  async function onShowSelected(show: { id: number; name: string; poster_path: string | null }) {
    setSelectedShow(show);

    // All-time tab doesn't need seasons — show is added directly
    if (tab === "all-time") return;

    setLoadingSeasons(true);
    try {
      const res = await fetch(`/api/tmdb/show/${show.id}`);
      const data = await res.json();
      setShowSeasons(
        (data.seasons || [])
          .filter((s: any) => s.season_number > 0)
          .map((s: any) => ({
            season_number: s.season_number,
            name: s.name,
            air_date: s.air_date,
            episode_count: s.episode_count,
          }))
      );
    } catch { setShowSeasons([]); }
    setLoadingSeasons(false);

    // Pre-fetch cast for performances tab
    if (tab === "performances") {
      setLoadingCast(true);
      try {
        const res = await fetch(`/api/tmdb/show/${show.id}/credits`);
        const data = await res.json();
        setShowCast(data.cast || []);
      } catch { setShowCast([]); }
      setLoadingCast(false);
    }
  }

  async function onEpSeasonSelected(seasonNum: number) {
    setEpSeasonNum(seasonNum);
    setLoadingSeasonEps(true);
    try {
      const res = await fetch(`/api/tmdb/show/${selectedShow!.id}/season/${seasonNum}`);
      const data = await res.json();
      setSeasonEpisodes(
        (data.episodes || []).map((ep: any) => ({
          episode_number: ep.episode_number,
          name: ep.name,
          air_date: ep.air_date || "",
          still_path: ep.still_path,
        }))
      );
    } catch { setSeasonEpisodes([]); }
    setLoadingSeasonEps(false);
  }

  async function addEpisodeFromPicker(episodeNumber: number, episodeTitle: string) {
    if (!managingUserId || !selectedShow || epSeasonNum === null) return;
    setSaving(true);
    const showDbId = await ensureShowInDb(selectedShow.id, selectedShow.name, selectedShow.poster_path);
    if (!showDbId) { setSaving(false); return; }

    await supabase.from("episode_ranking_entries").insert({
      user_id: managingUserId,
      year: selectedYear,
      rank_position: episodes.length + 1,
      show_id: showDbId,
      season_number: epSeasonNum,
      episode_number: episodeNumber,
      episode_title: episodeTitle,
    });

    resetShowSelection();
    await loadEpisodes();
    setSaving(false);
  }

  async function addPerformanceFromPicker(actName: string, charNameVal: string) {
    if (!managingUserId || !selectedShow || perfSeasonNum === null) return;
    setSaving(true);
    const showDbId = await ensureShowInDb(selectedShow.id, selectedShow.name, selectedShow.poster_path);
    if (!showDbId) { setSaving(false); return; }
    const seasonDbId = await ensureSeasonInDb(showDbId, selectedShow.id, perfSeasonNum);
    if (!seasonDbId) { setSaving(false); return; }

    await supabase.from("performance_ranking_entries").insert({
      user_id: managingUserId,
      year: selectedYear,
      rank_position: performances.length + 1,
      actor_name: actName,
      character_name: charNameVal || null,
      season_id: seasonDbId,
    });

    resetShowSelection();
    await loadPerformances();
    setSaving(false);
  }

  // ── Episodes ──────────────────────────────────────────

  async function loadEpisodes() {
    if (!managingUserId) return;
    setLoadingEpisodes(true);
    const { data } = await supabase
      .from("episode_ranking_entries")
      .select("id, rank_position, season_number, episode_number, episode_title, shows!inner(title, poster_url)")
      .eq("user_id", managingUserId)
      .eq("year", selectedYear)
      .order("rank_position", { ascending: true });

    setEpisodes(
      ((data || []) as any[]).map((r) => ({
        id: r.id,
        rank_position: r.rank_position,
        show_title: r.shows?.title || "Unknown",
        poster_url: r.shows?.poster_url || "/placeholder-poster.svg",
        season_number: r.season_number,
        episode_number: r.episode_number,
        episode_title: r.episode_title,
      }))
    );
    setLoadingEpisodes(false);
  }

  async function addEpisodeManual() {
    if (!managingUserId || !selectedShow || epSeasonNum === null || !epEpisodeNum || !epTitle) return;
    setSaving(true);
    const showDbId = await ensureShowInDb(selectedShow.id, selectedShow.name, selectedShow.poster_path);
    if (!showDbId) { setSaving(false); return; }

    await supabase.from("episode_ranking_entries").insert({
      user_id: managingUserId,
      year: selectedYear,
      rank_position: episodes.length + 1,
      show_id: showDbId,
      season_number: epSeasonNum,
      episode_number: parseInt(epEpisodeNum),
      episode_title: epTitle,
    });

    resetShowSelection();
    await loadEpisodes();
    setSaving(false);
  }

  async function removeEpisode(id: string) {
    await supabase.from("episode_ranking_entries").delete().eq("id", id);
    const remaining = episodes.filter((e) => e.id !== id);
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("episode_ranking_entries")
        .update({ rank_position: i + 1 })
        .eq("id", remaining[i].id);
    }
    await loadEpisodes();
  }

  async function handleEpisodeDragEnd(result: DropResult) {
    if (!result.destination) return;
    const items = Array.from(episodes);
    const [reordered] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reordered);
    // Optimistic update
    setEpisodes(items.map((ep, i) => ({ ...ep, rank_position: i + 1 })));
    // Persist new positions
    await Promise.all(
      items.map((ep, i) =>
        supabase.from("episode_ranking_entries").update({ rank_position: i + 1 }).eq("id", ep.id)
      )
    );
  }

  // ── Performances ──────────────────────────────────────

  async function loadPerformances() {
    if (!managingUserId) return;
    setLoadingPerfs(true);
    const { data } = await supabase
      .from("performance_ranking_entries")
      .select("id, rank_position, actor_name, character_name, seasons!inner(season_number, shows!inner(title))")
      .eq("user_id", managingUserId)
      .eq("year", selectedYear)
      .order("rank_position", { ascending: true });

    setPerformances(
      ((data || []) as any[]).map((r) => ({
        id: r.id,
        rank_position: r.rank_position,
        actor_name: r.actor_name,
        character_name: r.character_name,
        show_title: r.seasons?.shows?.title || "Unknown",
        season_number: r.seasons?.season_number || 0,
      }))
    );
    setLoadingPerfs(false);
  }

  async function addPerformance() {
    if (!managingUserId || !selectedShow || perfSeasonNum === null || !actorName) return;
    setSaving(true);
    const showDbId = await ensureShowInDb(selectedShow.id, selectedShow.name, selectedShow.poster_path);
    if (!showDbId) { setSaving(false); return; }
    const seasonDbId = await ensureSeasonInDb(showDbId, selectedShow.id, perfSeasonNum);
    if (!seasonDbId) { setSaving(false); return; }

    await supabase.from("performance_ranking_entries").insert({
      user_id: managingUserId,
      year: selectedYear,
      rank_position: performances.length + 1,
      actor_name: actorName,
      character_name: charName || null,
      season_id: seasonDbId,
    });

    resetShowSelection();
    await loadPerformances();
    setSaving(false);
  }

  async function removePerformance(id: string) {
    await supabase.from("performance_ranking_entries").delete().eq("id", id);
    const remaining = performances.filter((e) => e.id !== id);
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("performance_ranking_entries")
        .update({ rank_position: i + 1 })
        .eq("id", remaining[i].id);
    }
    await loadPerformances();
  }

  async function movePerformance(index: number, direction: "up" | "down") {
    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= performances.length) return;
    const a = performances[index];
    const b = performances[swapIndex];
    await Promise.all([
      supabase.from("performance_ranking_entries").update({ rank_position: b.rank_position }).eq("id", a.id),
      supabase.from("performance_ranking_entries").update({ rank_position: a.rank_position }).eq("id", b.id),
    ]);
    await loadPerformances();
  }

  // ── All-Time ──────────────────────────────────────────

  async function loadAllTime() {
    if (!managingUserId) return;
    setLoadingAllTime(true);
    const { data } = await supabase
      .from("all_time_entries")
      .select("id, rank_position, shows!inner(title, poster_url, network)")
      .eq("user_id", managingUserId)
      .order("rank_position", { ascending: true });

    setAllTime(
      ((data || []) as any[]).map((r) => ({
        id: r.id,
        rank_position: r.rank_position,
        show_title: r.shows?.title || "Unknown",
        poster_url: r.shows?.poster_url || "/placeholder-poster.svg",
        network: r.shows?.network || "Unknown",
      }))
    );
    setLoadingAllTime(false);
  }

  async function addAllTime() {
    if (!managingUserId || !selectedShow) return;
    setSaving(true);
    const showDbId = await ensureShowInDb(selectedShow.id, selectedShow.name, selectedShow.poster_path);
    if (!showDbId) { setSaving(false); return; }

    const { error } = await supabase.from("all_time_entries").insert({
      user_id: managingUserId,
      show_id: showDbId,
      rank_position: allTime.length + 1,
    });

    if (error) {
      console.error("Failed to add all-time entry:", error);
      alert(`Failed to add: ${error.message}`);
    }

    resetShowSelection();
    await loadAllTime();
    setSaving(false);
  }

  async function removeAllTime(id: string) {
    await supabase.from("all_time_entries").delete().eq("id", id);
    const remaining = allTime.filter((e) => e.id !== id);
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("all_time_entries")
        .update({ rank_position: i + 1 })
        .eq("id", remaining[i].id);
    }
    await loadAllTime();
  }

  // ── Non-Rankable ────────────────────────────────────────

  async function loadNonRankable() {
    if (!managingUserId) return;
    setLoadingNonRankable(true);
    const { data } = await supabase
      .from("non_rankable_entries")
      .select("id, season_number, category, note, sort_order, shows!inner(title, poster_url, network)")
      .eq("user_id", managingUserId)
      .eq("year", selectedYear)
      .order("sort_order", { ascending: true });

    setNonRankable(
      ((data || []) as any[]).map((r) => ({
        id: r.id,
        show_title: r.shows?.title || "Unknown",
        poster_url: r.shows?.poster_url || "/placeholder-poster.svg",
        network: r.shows?.network || "Unknown",
        season_number: r.season_number,
        category: r.category,
        note: r.note,
        sort_order: r.sort_order,
      }))
    );
    setLoadingNonRankable(false);
  }

  async function addNonRankable(seasonNumber: number) {
    if (!managingUserId || !selectedShow) return;
    setSaving(true);
    const showDbId = await ensureShowInDb(selectedShow.id, selectedShow.name, selectedShow.poster_path);
    if (!showDbId) { setSaving(false); return; }

    const { error } = await supabase.from("non_rankable_entries").insert({
      user_id: managingUserId,
      show_id: showDbId,
      year: selectedYear,
      season_number: seasonNumber,
      category: nrCategory,
      note: nrNote || null,
      sort_order: nonRankable.length + 1,
    });

    if (error) {
      console.error("Failed to add non-rankable entry:", error);
      alert(`Failed to add: ${error.message}`);
    }

    resetShowSelection();
    await loadNonRankable();
    setSaving(false);
  }

  async function removeNonRankable(id: string) {
    await supabase.from("non_rankable_entries").delete().eq("id", id);
    const remaining = nonRankable.filter((e) => e.id !== id);
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("non_rankable_entries")
        .update({ sort_order: i + 1 })
        .eq("id", remaining[i].id);
    }
    await loadNonRankable();
  }

  // ── Render ────────────────────────────────────────────

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
        <Link href="/admin" className="text-amber-500">Go to Admin</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 md:px-8 py-8 md:py-12 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <Link href="/admin" className="text-gray-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
          Manage <span className="text-amber-500">Lists</span>
        </h1>
      </div>
      <p className="text-gray-400 text-sm mb-6">
        Episodes, performances, all-time, and non-rankable shows.
      </p>

      {/* User picker */}
      {allUsers.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {allUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => { setManagingUserId(u.id); resetShowSelection(); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                managingUserId === u.id
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              {u.display_name}
            </button>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl glass w-fit mb-6 overflow-x-auto">
        {(["episodes", "performances", "all-time", "non-rankable"] as ListTab[]).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); resetShowSelection(); }}
            className={`px-3 md:px-4 py-2 rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-wider transition-all shrink-0 ${
              tab === t ? "bg-amber-500 text-black" : "text-gray-400 hover:text-white"
            }`}
          >
            {t === "all-time" ? "All-Time" : t === "non-rankable" ? "Non-Rankable" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {/* Year selector (not for all-time) */}
      {tab !== "all-time" && years.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {years.map((y) => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedYear === y
                  ? "bg-amber-500 text-black"
                  : "bg-white/5 text-gray-400 hover:text-white border border-white/10"
              }`}
            >
              {y}
            </button>
          ))}
        </div>
      )}

      {/* Add Section */}
      <div className="glass rounded-xl border border-white/5 p-6 mb-8">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          Add {tab === "episodes" ? "Episode" : tab === "performances" ? "Performance" : tab === "non-rankable" ? "Non-Rankable Show" : "All-Time Entry"}
        </h2>

        {!selectedShow ? (
          <ShowSearch onSelect={onShowSelected} />
        ) : (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <p className="text-sm text-gray-300">
                Show: <span className="font-bold text-white">{selectedShow.name}</span>
              </p>
              <button onClick={resetShowSelection} className="text-xs text-gray-500 hover:text-white">
                Change
              </button>
            </div>

            {/* Episode form */}
            {tab === "episodes" && (
              <div className="space-y-3">
                {loadingSeasons ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    Loading seasons...
                  </div>
                ) : epSeasonNum === null ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Select a season:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {showSeasons.map((s) => (
                        <button
                          key={s.season_number}
                          onClick={() => onEpSeasonSelected(s.season_number)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 text-sm text-gray-300 text-left"
                        >
                          <p className="font-bold">S{s.season_number}</p>
                          <p className="text-[10px] text-gray-500">{s.episode_count} eps</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : loadingSeasonEps ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    Loading episodes...
                  </div>
                ) : seasonEpisodes.length > 0 ? (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Season {epSeasonNum} — pick an episode:</p>
                      <button onClick={() => { setEpSeasonNum(null); setSeasonEpisodes([]); setEpFilter(""); }} className="text-xs text-gray-500 hover:text-white">
                        Change season
                      </button>
                    </div>
                    <input
                      type="text"
                      value={epFilter}
                      onChange={(e) => setEpFilter(e.target.value)}
                      placeholder="Filter episodes..."
                      className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                    />
                    <div className="max-h-64 overflow-y-auto space-y-1 rounded-lg">
                      {seasonEpisodes
                        .filter((ep) => !epFilter || ep.name.toLowerCase().includes(epFilter.toLowerCase()) || String(ep.episode_number).includes(epFilter))
                        .map((ep) => (
                        <button
                          key={ep.episode_number}
                          onClick={() => addEpisodeFromPicker(ep.episode_number, ep.name)}
                          disabled={saving}
                          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/5 text-left transition-colors disabled:opacity-30"
                        >
                          <span className="text-xs font-bold text-gray-500 w-6 text-center shrink-0">E{ep.episode_number}</span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white truncate">{ep.name}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Manual fallback when TMDB has no episode data */
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Season {epSeasonNum} — enter episode details manually:</p>
                      <button onClick={() => { setEpSeasonNum(null); setSeasonEpisodes([]); }} className="text-xs text-gray-500 hover:text-white">
                        Change season
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input
                        type="number"
                        placeholder="Episode #"
                        value={epEpisodeNum}
                        onChange={(e) => setEpEpisodeNum(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Episode title"
                        value={epTitle}
                        onChange={(e) => setEpTitle(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <button
                      onClick={addEpisodeManual}
                      disabled={saving || !epEpisodeNum || !epTitle}
                      className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-bold disabled:opacity-30 hover:bg-amber-400 transition-colors"
                    >
                      {saving ? "Adding..." : "Add Episode"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Performance form */}
            {tab === "performances" && (
              <div className="space-y-3">
                {loadingSeasons ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    Loading seasons...
                  </div>
                ) : perfSeasonNum === null ? (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Select a season:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {showSeasons.map((s) => (
                        <button
                          key={s.season_number}
                          onClick={() => setPerfSeasonNum(s.season_number)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 text-sm text-gray-300 text-left"
                        >
                          <p className="font-bold">S{s.season_number}</p>
                          <p className="text-[10px] text-gray-500">{s.episode_count} eps</p>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-gray-500">Season {perfSeasonNum} — pick a cast member or enter manually:</p>
                      <button onClick={() => { setPerfSeasonNum(null); setCastFilter(""); }} className="text-xs text-gray-500 hover:text-white">
                        Change season
                      </button>
                    </div>

                    {/* Cast picker from TMDB */}
                    {loadingCast ? (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                        Loading cast...
                      </div>
                    ) : showCast.length > 0 && (
                      <div className="mb-4">
                        <input
                          type="text"
                          value={castFilter}
                          onChange={(e) => setCastFilter(e.target.value)}
                          placeholder="Search cast..."
                          className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                        />
                        <div className="max-h-48 overflow-y-auto space-y-1 rounded-lg">
                          {showCast
                            .filter((c) => !castFilter || c.name.toLowerCase().includes(castFilter.toLowerCase()) || c.character.toLowerCase().includes(castFilter.toLowerCase()))
                            .slice(0, 20)
                            .map((c) => (
                            <button
                              key={`${c.id}-${c.character}`}
                              onClick={() => addPerformanceFromPicker(c.name, c.character)}
                              disabled={saving}
                              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/5 text-left transition-colors disabled:opacity-30"
                            >
                              {c.profile_path ? (
                                <img
                                  src={`${TMDB_IMAGE_BASE}/w92${c.profile_path}`}
                                  alt={c.name}
                                  className="w-8 h-8 rounded-full object-cover shrink-0"
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-gray-500 text-xs shrink-0">
                                  {c.name[0]}
                                </div>
                              )}
                              <div className="min-w-0">
                                <p className="text-sm font-medium text-white truncate">{c.name}</p>
                                <p className="text-[11px] text-gray-500 truncate">as {c.character}</p>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manual entry fallback */}
                    <div className="border-t border-white/5 pt-3">
                      <p className="text-[10px] text-gray-600 uppercase tracking-wider font-bold mb-2">Or enter manually</p>
                      <input
                        type="text"
                        placeholder="Actor name"
                        value={actorName}
                        onChange={(e) => setActorName(e.target.value)}
                        className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Character name (optional)"
                        value={charName}
                        onChange={(e) => setCharName(e.target.value)}
                        className="w-full mb-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                      />
                      <button
                        onClick={addPerformance}
                        disabled={saving || !actorName}
                        className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-bold disabled:opacity-30 hover:bg-amber-400 transition-colors"
                      >
                        {saving ? "Adding..." : "Add Performance"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* All-Time: add show directly (no season selection) */}
            {tab === "all-time" && (
              <button
                onClick={addAllTime}
                disabled={saving}
                className="px-4 py-2 rounded-lg bg-amber-500 text-black text-sm font-bold disabled:opacity-30 hover:bg-amber-400 transition-colors"
              >
                {saving ? "Adding..." : "Add to All-Time"}
              </button>
            )}
            {/* Non-Rankable: pick season + category */}
            {tab === "non-rankable" && (
              <div className="space-y-3">
                {loadingSeasons ? (
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <div className="w-4 h-4 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    Loading seasons...
                  </div>
                ) : (
                  <div>
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 block mb-1">Category</label>
                      <select
                        value={nrCategory}
                        onChange={(e) => setNrCategory(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-amber-500 outline-none appearance-none cursor-pointer"
                      >
                        {NON_RANKABLE_CATEGORIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="text-xs text-gray-500 block mb-1">Note (optional)</label>
                      <input
                        type="text"
                        value={nrNote}
                        onChange={(e) => setNrNote(e.target.value)}
                        placeholder="e.g. Finished S2, great doc..."
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-amber-500 outline-none"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mb-2">Select a season:</p>
                    <div className="grid grid-cols-3 gap-2">
                      {showSeasons.map((s) => (
                        <button
                          key={s.season_number}
                          onClick={() => addNonRankable(s.season_number)}
                          disabled={saving}
                          className="p-2 rounded-lg bg-white/5 hover:bg-amber-500/20 border border-white/10 text-sm text-gray-300 text-left disabled:opacity-30"
                        >
                          <p className="font-bold">Season {s.season_number}</p>
                          <p className="text-[10px] text-gray-500">
                            {s.episode_count} eps
                            {s.air_date ? ` · ${new Date(s.air_date).getFullYear()}` : ""}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Current List */}
      <div className="glass rounded-xl border border-white/5 p-6">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
          {tab === "episodes" ? `Episodes (${selectedYear})` : tab === "performances" ? `Performances (${selectedYear})` : tab === "non-rankable" ? `Non-Rankable (${selectedYear})` : "All-Time"}
          {" — "}
          {tab === "episodes" ? episodes.length : tab === "performances" ? performances.length : tab === "non-rankable" ? nonRankable.length : allTime.length} entries
        </h2>

        {/* Episodes list */}
        {tab === "episodes" && (
          loadingEpisodes ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : episodes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No episodes yet.</p>
          ) : (
            <DragDropContext onDragEnd={handleEpisodeDragEnd}>
              <Droppable droppableId="episodes">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {episodes.map((ep, i) => (
                      <Draggable key={ep.id} draggableId={ep.id} index={i}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center gap-2 p-3 rounded-lg group transition-all ${
                              snapshot.isDragging
                                ? "bg-amber-500/10 border border-amber-500/50 shadow-2xl shadow-amber-500/10 scale-[1.02]"
                                : "bg-white/5 border border-transparent"
                            }`}
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="flex flex-col items-center gap-1 shrink-0 cursor-grab active:cursor-grabbing"
                            >
                              <svg className="w-4 h-4 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm8-16a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm0 8a2 2 0 1 1 0-4 2 2 0 0 1 0 4z" />
                              </svg>
                              <span className={`text-sm font-black ${i < 3 ? "text-amber-500" : "text-gray-500"}`}>
                                {i + 1}
                              </span>
                            </div>
                            <div className="relative w-8 h-12 rounded overflow-hidden shrink-0">
                              <Image src={ep.poster_url} alt={ep.show_title} fill className="object-cover" sizes="32px" />
                            </div>
                            <div className="min-w-0 flex-grow">
                              <p className="font-bold text-sm truncate">{ep.episode_title}</p>
                              <p className="text-[11px] text-gray-400">{ep.show_title} S{ep.season_number}E{ep.episode_number}</p>
                            </div>
                            <button
                              onClick={() => removeEpisode(ep.id)}
                              className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0 p-1"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )
        )}

        {/* Performances list */}
        {tab === "performances" && (
          loadingPerfs ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : performances.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No performances yet.</p>
          ) : (
            <div className="space-y-2">
              {performances.map((perf, i) => (
                <div key={perf.id} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 group">
                  <div className="flex flex-col shrink-0">
                    <button onClick={() => movePerformance(i, "up")} disabled={i === 0} className="text-gray-600 hover:text-white disabled:opacity-20 p-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" /></svg>
                    </button>
                    <button onClick={() => movePerformance(i, "down")} disabled={i === performances.length - 1} className="text-gray-600 hover:text-white disabled:opacity-20 p-0.5">
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                  </div>
                  <span className="w-6 text-center font-bold text-sm text-gray-500">{perf.rank_position}</span>
                  <div className="min-w-0 flex-grow">
                    <p className="font-bold text-sm">{perf.actor_name}</p>
                    <p className="text-[11px] text-gray-400">
                      {perf.character_name ? `as ${perf.character_name} · ` : ""}
                      {perf.show_title} S{perf.season_number}
                    </p>
                  </div>
                  <button
                    onClick={() => removePerformance(perf.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* All-Time list */}
        {tab === "all-time" && (
          loadingAllTime ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : allTime.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No all-time entries yet.</p>
          ) : (
            <div className="space-y-2">
              {allTime.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 group">
                  <span className="w-6 text-center font-bold text-sm text-gray-500">{entry.rank_position}</span>
                  <div className="relative w-8 h-12 rounded overflow-hidden shrink-0">
                    <Image src={entry.poster_url} alt={entry.show_title} fill className="object-cover" sizes="32px" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="font-bold text-sm truncate">{entry.show_title}</p>
                    <p className="text-[11px] text-gray-400">{entry.network}</p>
                  </div>
                  <button
                    onClick={() => removeAllTime(entry.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )
        )}

        {/* Non-Rankable list */}
        {tab === "non-rankable" && (
          loadingNonRankable ? (
            <div className="text-center py-6">
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : nonRankable.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">No non-rankable shows yet.</p>
          ) : (
            <div className="space-y-2">
              {nonRankable.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 group">
                  <div className="relative w-8 h-12 rounded overflow-hidden shrink-0">
                    <Image src={entry.poster_url} alt={entry.show_title} fill className="object-cover" sizes="32px" />
                  </div>
                  <div className="min-w-0 flex-grow">
                    <p className="font-bold text-sm truncate">{entry.show_title}</p>
                    <p className="text-[11px] text-gray-400">
                      S{entry.season_number} · {entry.network}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-500 border border-white/5 font-medium">
                        {entry.category}
                      </span>
                      {entry.note && (
                        <span className="text-[10px] text-gray-600 italic truncate">
                          {entry.note}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => removeNonRankable(entry.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}
