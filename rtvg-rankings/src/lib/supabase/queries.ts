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
        rewatchability,
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
      rewatchability: row.rewatchability,
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
