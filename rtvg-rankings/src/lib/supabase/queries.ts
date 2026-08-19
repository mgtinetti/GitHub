import { supabase } from "@/lib/supabase/client";
import type { RankingEntry, User, Show, Season } from "@/types";

export async function fetchUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Failed to fetch users:", error.message);
    return [];
  }
  return data || [];
}

export async function fetchActiveYears(): Promise<number[]> {
  const { data, error } = await supabase
    .from("ranking_entries")
    .select("year")
    .order("year", { ascending: false });

  if (error) {
    console.error("Failed to fetch years:", error.message);
    return [];
  }

  // Deduplicate
  const years = [...new Set((data || []).map((r: { year: number }) => r.year))];
  return years.sort((a, b) => b - a);
}

export async function fetchRankingsForYear(
  year: number
): Promise<{ rankings: Record<string, RankingEntry[]>; users: User[] }> {
  // Fetch users and rankings in parallel
  const [usersResult, rankingsResult] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: true }),
    supabase
      .from("ranking_entries")
      .select(
        `
        id,
        user_id,
        season_id,
        year,
        rank_position,
        tier,
        score,
        review,
        created_at,
        updated_at,
        seasons!inner (
          id,
          show_id,
          tmdb_season_id,
          season_number,
          air_date_start,
          air_date_end,
          episode_count,
          poster_url,
          shows!inner (
            id,
            tmdb_id,
            title,
            poster_url,
            genres,
            network,
            status,
            last_synced_at
          )
        )
      `
      )
      .eq("year", year)
      .order("rank_position", { ascending: true }),
  ]);

  const users: User[] = usersResult.data || [];
  const rawRankings = rankingsResult.data || [];

  if (rankingsResult.error) {
    console.error("Failed to fetch rankings:", rankingsResult.error.message);
  }

  // Group by user and transform into RankingEntry format
  const rankings: Record<string, RankingEntry[]> = {};

  // Initialize empty arrays for all users
  for (const user of users) {
    rankings[user.id] = [];
  }

  for (const row of rawRankings as any[]) {
    const season = row.seasons;
    const show = season?.shows;

    const entry: RankingEntry = {
      id: row.id,
      user_id: row.user_id,
      season_id: row.season_id,
      year: row.year,
      rank_position: row.rank_position,
      tier: row.tier,
      score: row.score ? parseFloat(row.score) : null,
      review: row.review,
      created_at: row.created_at,
      updated_at: row.updated_at,
      show: show
        ? {
            id: show.id,
            tmdb_id: show.tmdb_id,
            title: show.title,
            poster_url: show.poster_url || "/placeholder-poster.svg",
            genres: show.genres || [],
            network: show.network || "Unknown",
            status: show.status || "Unknown",
            last_synced_at: show.last_synced_at,
          }
        : undefined,
      season: season
        ? {
            id: season.id,
            show_id: season.show_id,
            tmdb_season_id: season.tmdb_season_id,
            season_number: season.season_number,
            air_date_start: season.air_date_start,
            air_date_end: season.air_date_end,
            episode_count: season.episode_count,
            poster_url: season.poster_url,
          }
        : undefined,
    };

    if (!rankings[row.user_id]) {
      rankings[row.user_id] = [];
    }
    rankings[row.user_id].push(entry);
  }

  return { rankings, users };
}

export interface CurrentlyWatchingItem {
  id: string;
  user_id: string;
  show_id: string;
  season_number: number;
  added_at: string;
  show: {
    id: string;
    tmdb_id: number;
    title: string;
    poster_url: string | null;
    network: string;
  };
}

export async function fetchCurrentlyWatching(): Promise<{
  items: Record<string, CurrentlyWatchingItem[]>;
  users: User[];
}> {
  const [usersResult, watchingResult] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: true }),
    supabase
      .from("currently_watching")
      .select(
        `
        id,
        user_id,
        show_id,
        season_number,
        added_at,
        shows!inner (
          id,
          tmdb_id,
          title,
          poster_url,
          network
        )
      `
      )
      .order("added_at", { ascending: false }),
  ]);

  const users: User[] = usersResult.data || [];
  const rawItems = watchingResult.data || [];

  if (watchingResult.error) {
    console.error("Failed to fetch currently watching:", watchingResult.error.message);
  }

  const items: Record<string, CurrentlyWatchingItem[]> = {};
  for (const user of users) {
    items[user.id] = [];
  }

  for (const row of rawItems as any[]) {
    const show = row.shows;
    const item: CurrentlyWatchingItem = {
      id: row.id,
      user_id: row.user_id,
      show_id: row.show_id,
      season_number: row.season_number,
      added_at: row.added_at,
      show: {
        id: show.id,
        tmdb_id: show.tmdb_id,
        title: show.title,
        poster_url: show.poster_url,
        network: show.network || "Unknown",
      },
    };
    if (!items[row.user_id]) {
      items[row.user_id] = [];
    }
    items[row.user_id].push(item);
  }

  return { items, users };
}

export interface NonRankableItem {
  id: string;
  user_id: string;
  show_id: string;
  season_number: number;
  category: string;
  note: string | null;
  show: {
    id: string;
    title: string;
    poster_url: string | null;
    network: string;
  };
}

export async function fetchNonRankable(year: number): Promise<{
  items: Record<string, NonRankableItem[]>;
  users: User[];
}> {
  const [usersResult, nrResult] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: true }),
    supabase
      .from("non_rankable_entries")
      .select(
        `
        id,
        user_id,
        show_id,
        season_number,
        category,
        note,
        shows!inner (
          id,
          title,
          poster_url,
          network
        )
      `
      )
      .eq("year", year)
      .order("sort_order", { ascending: true }),
  ]);

  const users: User[] = usersResult.data || [];
  const rawItems = nrResult.data || [];

  const items: Record<string, NonRankableItem[]> = {};
  for (const user of users) {
    items[user.id] = [];
  }

  for (const row of rawItems as any[]) {
    const show = row.shows;
    const item: NonRankableItem = {
      id: row.id,
      user_id: row.user_id,
      show_id: row.show_id,
      season_number: row.season_number,
      category: row.category,
      note: row.note,
      show: {
        id: show.id,
        title: show.title,
        poster_url: show.poster_url,
        network: show.network || "Unknown",
      },
    };
    if (!items[row.user_id]) {
      items[row.user_id] = [];
    }
    items[row.user_id].push(item);
  }

  return { items, users };
}

export interface PipelineItem {
  id: string;
  user_id: string;
  show_id: string;
  season_number: number;
  sort_order: number;
  added_at: string;
  show: {
    id: string;
    tmdb_id: number;
    title: string;
    poster_url: string | null;
    network: string;
  };
}

export async function fetchPipeline(): Promise<{
  items: Record<string, PipelineItem[]>;
  users: User[];
}> {
  const [usersResult, pipelineResult] = await Promise.all([
    supabase.from("users").select("*").order("created_at", { ascending: true }),
    supabase
      .from("pipeline")
      .select(
        `
        id,
        user_id,
        show_id,
        season_number,
        sort_order,
        added_at,
        shows!inner (
          id,
          tmdb_id,
          title,
          poster_url,
          network
        )
      `
      )
      .order("sort_order", { ascending: true }),
  ]);

  const users: User[] = usersResult.data || [];
  const rawItems = pipelineResult.data || [];

  if (pipelineResult.error) {
    console.error("Failed to fetch pipeline:", pipelineResult.error.message);
  }

  const items: Record<string, PipelineItem[]> = {};
  for (const user of users) {
    items[user.id] = [];
  }

  for (const row of rawItems as any[]) {
    const show = row.shows;
    const item: PipelineItem = {
      id: row.id,
      user_id: row.user_id,
      show_id: row.show_id,
      season_number: row.season_number,
      sort_order: row.sort_order,
      added_at: row.added_at,
      show: {
        id: show.id,
        tmdb_id: show.tmdb_id,
        title: show.title,
        poster_url: show.poster_url,
        network: show.network || "Unknown",
      },
    };
    if (!items[row.user_id]) {
      items[row.user_id] = [];
    }
    items[row.user_id].push(item);
  }

  return { items, users };
}
