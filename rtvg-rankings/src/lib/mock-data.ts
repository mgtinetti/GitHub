import type {
  User,
  Show,
  Season,
  RankingEntry,
  ActivityEvent,
  AwardCategory,
  AwardPick,
  EpisodeRankingEntry,
  PerformanceRankingEntry,
  AllTimeEntry,
  BlogPost,
} from "@/types";

// ─── Users ──────────────────────────────────────────────────
export const USERS: User[] = [
  {
    id: "user-tinetti",
    email: "tinetti@rtvgrankings.com",
    display_name: "Tinetti",
    avatar_url: "https://picsum.photos/seed/tinetti/200",
    role: "admin",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-chubbs",
    email: "chubbs@rtvgrankings.com",
    display_name: "Chubbs",
    avatar_url: "https://picsum.photos/seed/chubbs/200",
    role: "contributor",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: "user-poteete",
    email: "poteete@rtvgrankings.com",
    display_name: "Poteete",
    avatar_url: "https://picsum.photos/seed/poteete/200",
    role: "contributor",
    created_at: "2024-01-01T00:00:00Z",
  },
];

// ─── Shows ──────────────────────────────────────────────────
export const SHOWS: Show[] = [
  { id: "show-severance", tmdb_id: 95396, title: "Severance", poster_url: "https://picsum.photos/seed/severance/342/500", genres: ["Drama", "Sci-Fi", "Thriller"], network: "Apple TV+", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-bear", tmdb_id: 136315, title: "The Bear", poster_url: "https://picsum.photos/seed/thebear/342/500", genres: ["Drama", "Comedy"], network: "Hulu", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-andor", tmdb_id: 83867, title: "Andor", poster_url: "https://picsum.photos/seed/andor/342/500", genres: ["Sci-Fi", "Drama", "Thriller"], network: "Disney+", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-whitelotus", tmdb_id: 111803, title: "The White Lotus", poster_url: "https://picsum.photos/seed/whitelotus/342/500", genres: ["Drama", "Comedy"], network: "HBO", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-succession", tmdb_id: 76331, title: "Succession", poster_url: "https://picsum.photos/seed/succession/342/500", genres: ["Drama"], network: "HBO", status: "Ended", last_synced_at: "2025-01-01" },
  { id: "show-barry", tmdb_id: 71632, title: "Barry", poster_url: "https://picsum.photos/seed/barry/342/500", genres: ["Comedy", "Crime", "Drama"], network: "HBO", status: "Ended", last_synced_at: "2025-01-01" },
  { id: "show-shrinking", tmdb_id: 136311, title: "Shrinking", poster_url: "https://picsum.photos/seed/shrinking/342/500", genres: ["Comedy", "Drama"], network: "Apple TV+", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-shogun", tmdb_id: 126308, title: "Shogun", poster_url: "https://picsum.photos/seed/shogun/342/500", genres: ["Drama", "War"], network: "FX", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-fallout", tmdb_id: 106379, title: "Fallout", poster_url: "https://picsum.photos/seed/fallout/342/500", genres: ["Sci-Fi", "Drama", "Action"], network: "Prime Video", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-hacks", tmdb_id: 105971, title: "Hacks", poster_url: "https://picsum.photos/seed/hacks/342/500", genres: ["Comedy", "Drama"], network: "Max", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-slow-horses", tmdb_id: 137530, title: "Slow Horses", poster_url: "https://picsum.photos/seed/slowhorses/342/500", genres: ["Thriller", "Drama"], network: "Apple TV+", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-the-studio", tmdb_id: 246480, title: "The Studio", poster_url: "https://picsum.photos/seed/thestudio/342/500", genres: ["Comedy"], network: "Apple TV+", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-adolescence", tmdb_id: 258210, title: "Adolescence", poster_url: "https://picsum.photos/seed/adolescence/342/500", genres: ["Drama", "Thriller"], network: "Netflix", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-daredevil", tmdb_id: 202555, title: "Daredevil: Born Again", poster_url: "https://picsum.photos/seed/daredevil/342/500", genres: ["Action", "Crime", "Drama"], network: "Disney+", status: "Returning", last_synced_at: "2025-01-01" },
  { id: "show-reacher", tmdb_id: 108978, title: "Reacher", poster_url: "https://picsum.photos/seed/reacher/342/500", genres: ["Action", "Crime"], network: "Prime Video", status: "Returning", last_synced_at: "2025-01-01" },
];

// ─── Seasons ────────────────────────────────────────────────
export const SEASONS: Season[] = [
  { id: "season-severance-2", show_id: "show-severance", tmdb_season_id: 1, season_number: 2, air_date_start: "2025-01-17", air_date_end: "2025-03-21", episode_count: 10, poster_url: null },
  { id: "season-bear-4", show_id: "show-bear", tmdb_season_id: 2, season_number: 4, air_date_start: "2025-06-20", air_date_end: "2025-08-22", episode_count: 10, poster_url: null },
  { id: "season-andor-2", show_id: "show-andor", tmdb_season_id: 3, season_number: 2, air_date_start: "2025-04-22", air_date_end: "2025-06-24", episode_count: 12, poster_url: null },
  { id: "season-whitelotus-3", show_id: "show-whitelotus", tmdb_season_id: 4, season_number: 3, air_date_start: "2025-02-16", air_date_end: "2025-04-06", episode_count: 8, poster_url: null },
  { id: "season-succession-4", show_id: "show-succession", tmdb_season_id: 5, season_number: 4, air_date_start: "2025-03-26", air_date_end: "2025-05-28", episode_count: 10, poster_url: null },
  { id: "season-barry-4", show_id: "show-barry", tmdb_season_id: 6, season_number: 4, air_date_start: "2025-04-16", air_date_end: "2025-06-04", episode_count: 8, poster_url: null },
  { id: "season-shrinking-2", show_id: "show-shrinking", tmdb_season_id: 7, season_number: 2, air_date_start: "2025-10-16", air_date_end: "2025-12-18", episode_count: 12, poster_url: null },
  { id: "season-shogun-1", show_id: "show-shogun", tmdb_season_id: 8, season_number: 1, air_date_start: "2025-02-27", air_date_end: "2025-04-23", episode_count: 10, poster_url: null },
  { id: "season-fallout-1", show_id: "show-fallout", tmdb_season_id: 9, season_number: 1, air_date_start: "2025-04-10", air_date_end: "2025-04-10", episode_count: 8, poster_url: null },
  { id: "season-hacks-3", show_id: "show-hacks", tmdb_season_id: 10, season_number: 3, air_date_start: "2025-05-01", air_date_end: "2025-06-19", episode_count: 10, poster_url: null },
  { id: "season-slowhorses-4", show_id: "show-slow-horses", tmdb_season_id: 11, season_number: 4, air_date_start: "2025-09-04", air_date_end: "2025-10-09", episode_count: 6, poster_url: null },
  { id: "season-thestudio-1", show_id: "show-the-studio", tmdb_season_id: 12, season_number: 1, air_date_start: "2025-03-26", air_date_end: "2025-05-14", episode_count: 10, poster_url: null },
  { id: "season-adolescence-1", show_id: "show-adolescence", tmdb_season_id: 13, season_number: 1, air_date_start: "2025-03-13", air_date_end: "2025-03-13", episode_count: 4, poster_url: null },
  { id: "season-daredevil-1", show_id: "show-daredevil", tmdb_season_id: 14, season_number: 1, air_date_start: "2025-03-04", air_date_end: "2025-05-06", episode_count: 9, poster_url: null },
  { id: "season-reacher-3", show_id: "show-reacher", tmdb_season_id: 15, season_number: 3, air_date_start: "2025-02-20", air_date_end: "2025-04-10", episode_count: 8, poster_url: null },
];

function findShow(seasonId: string): Show | undefined {
  const season = SEASONS.find((s) => s.id === seasonId);
  if (!season) return undefined;
  return SHOWS.find((s) => s.id === season.show_id);
}

function findSeason(seasonId: string): Season | undefined {
  return SEASONS.find((s) => s.id === seasonId);
}

function makeRanking(
  userId: string,
  year: number,
  seasonId: string,
  rank: number,
  score: number | null,
  tier: RankingEntry["tier"]
): RankingEntry {
  return {
    id: `${userId}-${seasonId}-${year}`,
    user_id: userId,
    season_id: seasonId,
    year,
    rank_position: rank,
    tier,
    score,
    review: null,
    created_at: `${year}-12-01T00:00:00Z`,
    updated_at: "2025-12-15T00:00:00Z",
    show: findShow(seasonId),
    season: findSeason(seasonId),
  };
}

// ─── 2025 Rankings ──────────────────────────────────────────
export const RANKINGS_2025: Record<string, RankingEntry[]> = {
  "user-tinetti": [
    makeRanking("user-tinetti", 2025, "season-severance-2", 1, 9.5, "Instant Classic"),
    makeRanking("user-tinetti", 2025, "season-bear-4", 2, 9.2, "Great"),
    makeRanking("user-tinetti", 2025, "season-andor-2", 3, 9.0, "Great"),
    makeRanking("user-tinetti", 2025, "season-whitelotus-3", 4, 8.8, "Good"),
    makeRanking("user-tinetti", 2025, "season-succession-4", 5, 9.8, "Instant Classic"),
    makeRanking("user-tinetti", 2025, "season-shogun-1", 6, 9.0, "Great"),
    makeRanking("user-tinetti", 2025, "season-fallout-1", 7, 8.5, "Good"),
    makeRanking("user-tinetti", 2025, "season-hacks-3", 8, 8.3, "Good"),
    makeRanking("user-tinetti", 2025, "season-adolescence-1", 9, 8.7, "Great"),
    makeRanking("user-tinetti", 2025, "season-slowhorses-4", 10, 8.2, "Good"),
    makeRanking("user-tinetti", 2025, "season-thestudio-1", 11, 8.0, "Average"),
    makeRanking("user-tinetti", 2025, "season-daredevil-1", 12, 7.8, "Average"),
    makeRanking("user-tinetti", 2025, "season-reacher-3", 13, 7.5, "Average"),
    makeRanking("user-tinetti", 2025, "season-barry-4", 14, 8.9, "Good"),
    makeRanking("user-tinetti", 2025, "season-shrinking-2", 15, 8.0, "Good"),
  ],
  "user-chubbs": [
    makeRanking("user-chubbs", 2025, "season-succession-4", 1, 9.9, "Instant Classic"),
    makeRanking("user-chubbs", 2025, "season-severance-2", 2, 9.3, "Great"),
    makeRanking("user-chubbs", 2025, "season-bear-4", 3, 9.0, "Great"),
    makeRanking("user-chubbs", 2025, "season-barry-4", 4, 8.9, "Good"),
    makeRanking("user-chubbs", 2025, "season-whitelotus-3", 5, 8.5, "Average"),
    makeRanking("user-chubbs", 2025, "season-shogun-1", 6, 8.8, "Great"),
    makeRanking("user-chubbs", 2025, "season-andor-2", 7, 8.4, "Good"),
    makeRanking("user-chubbs", 2025, "season-hacks-3", 8, 8.6, "Great"),
    makeRanking("user-chubbs", 2025, "season-fallout-1", 9, 8.2, "Good"),
    makeRanking("user-chubbs", 2025, "season-slowhorses-4", 10, 8.0, "Good"),
    makeRanking("user-chubbs", 2025, "season-daredevil-1", 11, 7.9, "Average"),
    makeRanking("user-chubbs", 2025, "season-shrinking-2", 12, 7.8, "Good"),
    makeRanking("user-chubbs", 2025, "season-adolescence-1", 13, 8.0, "Good"),
    makeRanking("user-chubbs", 2025, "season-reacher-3", 14, 7.5, "Average"),
    makeRanking("user-chubbs", 2025, "season-thestudio-1", 15, 7.3, "Average"),
  ],
  "user-poteete": [
    makeRanking("user-poteete", 2025, "season-severance-2", 1, 9.4, "Great"),
    makeRanking("user-poteete", 2025, "season-andor-2", 2, 9.3, "Great"),
    makeRanking("user-poteete", 2025, "season-bear-4", 3, 9.1, "Good"),
    makeRanking("user-poteete", 2025, "season-succession-4", 4, 8.9, "Great"),
    makeRanking("user-poteete", 2025, "season-shrinking-2", 5, 8.7, "Good"),
    makeRanking("user-poteete", 2025, "season-shogun-1", 6, 8.9, "Great"),
    makeRanking("user-poteete", 2025, "season-adolescence-1", 7, 8.8, "Great"),
    makeRanking("user-poteete", 2025, "season-whitelotus-3", 8, 8.3, "Average"),
    makeRanking("user-poteete", 2025, "season-fallout-1", 9, 8.5, "Great"),
    makeRanking("user-poteete", 2025, "season-hacks-3", 10, 8.1, "Good"),
    makeRanking("user-poteete", 2025, "season-thestudio-1", 11, 8.4, "Good"),
    makeRanking("user-poteete", 2025, "season-barry-4", 12, 8.0, "Average"),
    makeRanking("user-poteete", 2025, "season-daredevil-1", 13, 7.9, "Average"),
    makeRanking("user-poteete", 2025, "season-reacher-3", 14, 7.6, "Average"),
    makeRanking("user-poteete", 2025, "season-slowhorses-4", 15, 7.8, "Good"),
  ],
};

// ─── Activity Feed ──────────────────────────────────────────
export const ACTIVITY_FEED: ActivityEvent[] = [
  { id: "a1", user_id: "user-tinetti", event_type: "add", metadata: { show_name: "Severance", season_number: 2, new_rank: 1 }, year: 2025, created_at: "2025-12-15T14:30:00Z", user: USERS[0] },
  { id: "a2", user_id: "user-poteete", event_type: "move", metadata: { show_name: "White Lotus", season_number: 3, old_rank: 5, new_rank: 8 }, year: 2025, created_at: "2025-12-15T12:00:00Z", user: USERS[2] },
  { id: "a3", user_id: "user-chubbs", event_type: "finalize", metadata: { year: 2025 }, year: 2025, created_at: "2025-12-14T18:00:00Z", user: USERS[1] },
  { id: "a4", user_id: "user-tinetti", event_type: "blog_post", metadata: { post_title: "Why 2025 is the Year of Sci-Fi", post_slug: "2025-year-of-scifi" }, year: 2025, created_at: "2025-12-13T10:00:00Z", user: USERS[0] },
  { id: "a5", user_id: "user-poteete", event_type: "add", metadata: { show_name: "Adolescence", season_number: 1, new_rank: 7 }, year: 2025, created_at: "2025-12-12T09:15:00Z", user: USERS[2] },
  { id: "a6", user_id: "user-chubbs", event_type: "move", metadata: { show_name: "Succession", season_number: 4, old_rank: 3, new_rank: 1 }, year: 2025, created_at: "2025-12-11T22:00:00Z", user: USERS[1] },
  { id: "a7", user_id: "user-tinetti", event_type: "award_pick", metadata: { award_name: "Show of the Year", show_name: "Severance" }, year: 2025, created_at: "2025-12-10T16:00:00Z", user: USERS[0] },
  { id: "a8", user_id: "user-poteete", event_type: "add", metadata: { show_name: "The Studio", season_number: 1, new_rank: 11 }, year: 2025, created_at: "2025-12-09T11:30:00Z", user: USERS[2] },
];

// ─── Award Categories ───────────────────────────────────────
export const AWARD_CATEGORIES: AwardCategory[] = [
  { id: "award-soty", year: 2025, name: "Show of the Year", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-bestnew", year: 2025, name: "Best New Show", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-bestreturn", year: 2025, name: "Best Returning Show", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-disappointing", year: 2025, name: "Most Disappointing", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-surprise", year: 2025, name: "Biggest Surprise", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-bestfinale", year: 2025, name: "Best Finale", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-overrated", year: 2025, name: "Most Overrated", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-underrated", year: 2025, name: "Most Underrated", is_preset: true, created_by: "user-tinetti", approved: true },
  { id: "award-coldopen", year: 2025, name: "Best Cold Open", is_preset: false, created_by: "user-poteete", approved: true },
];

export const AWARD_PICKS: AwardPick[] = [
  // Show of the Year - unanimous
  { id: "ap1", category_id: "award-soty", user_id: "user-tinetti", season_id: "season-severance-2", blurb: "Nothing even came close.", created_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0], user: USERS[0] },
  { id: "ap2", category_id: "award-soty", user_id: "user-chubbs", season_id: "season-severance-2", blurb: "Masterful television.", created_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0], user: USERS[1] },
  { id: "ap3", category_id: "award-soty", user_id: "user-poteete", season_id: "season-severance-2", blurb: "The best show on TV right now.", created_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0], user: USERS[2] },
  // Best New Show
  { id: "ap4", category_id: "award-bestnew", user_id: "user-tinetti", season_id: "season-shogun-1", blurb: null, created_at: "2025-12-15", show: SHOWS[7], season: SEASONS[7], user: USERS[0] },
  { id: "ap5", category_id: "award-bestnew", user_id: "user-chubbs", season_id: "season-fallout-1", blurb: "Way better than expected.", created_at: "2025-12-15", show: SHOWS[8], season: SEASONS[8], user: USERS[1] },
  { id: "ap6", category_id: "award-bestnew", user_id: "user-poteete", season_id: "season-shogun-1", blurb: null, created_at: "2025-12-15", show: SHOWS[7], season: SEASONS[7], user: USERS[2] },
  // Best Returning
  { id: "ap7", category_id: "award-bestreturn", user_id: "user-tinetti", season_id: "season-severance-2", blurb: null, created_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0], user: USERS[0] },
  { id: "ap8", category_id: "award-bestreturn", user_id: "user-chubbs", season_id: "season-succession-4", blurb: null, created_at: "2025-12-15", show: SHOWS[4], season: SEASONS[4], user: USERS[1] },
  { id: "ap9", category_id: "award-bestreturn", user_id: "user-poteete", season_id: "season-andor-2", blurb: null, created_at: "2025-12-15", show: SHOWS[2], season: SEASONS[2], user: USERS[2] },
  // Most Disappointing
  { id: "ap10", category_id: "award-disappointing", user_id: "user-tinetti", season_id: "season-daredevil-1", blurb: null, created_at: "2025-12-15", show: SHOWS[13], season: SEASONS[13], user: USERS[0] },
  { id: "ap11", category_id: "award-disappointing", user_id: "user-chubbs", season_id: "season-daredevil-1", blurb: "Had such high hopes.", created_at: "2025-12-15", show: SHOWS[13], season: SEASONS[13], user: USERS[1] },
  { id: "ap12", category_id: "award-disappointing", user_id: "user-poteete", season_id: "season-reacher-3", blurb: null, created_at: "2025-12-15", show: SHOWS[14], season: SEASONS[14], user: USERS[2] },
  // Biggest Surprise
  { id: "ap13", category_id: "award-surprise", user_id: "user-tinetti", season_id: "season-adolescence-1", blurb: "Came out of nowhere.", created_at: "2025-12-15", show: SHOWS[12], season: SEASONS[12], user: USERS[0] },
  { id: "ap14", category_id: "award-surprise", user_id: "user-chubbs", season_id: "season-shogun-1", blurb: null, created_at: "2025-12-15", show: SHOWS[7], season: SEASONS[7], user: USERS[1] },
  { id: "ap15", category_id: "award-surprise", user_id: "user-poteete", season_id: "season-adolescence-1", blurb: null, created_at: "2025-12-15", show: SHOWS[12], season: SEASONS[12], user: USERS[2] },
  // Best Finale
  { id: "ap16", category_id: "award-bestfinale", user_id: "user-tinetti", season_id: "season-severance-2", blurb: null, created_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0], user: USERS[0] },
  { id: "ap17", category_id: "award-bestfinale", user_id: "user-chubbs", season_id: "season-succession-4", blurb: "The perfect ending.", created_at: "2025-12-15", show: SHOWS[4], season: SEASONS[4], user: USERS[1] },
  { id: "ap18", category_id: "award-bestfinale", user_id: "user-poteete", season_id: "season-severance-2", blurb: null, created_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0], user: USERS[2] },
];

// ─── Episode Rankings ───────────────────────────────────────
export const EPISODE_RANKINGS_2025: Record<string, EpisodeRankingEntry[]> = {
  "user-tinetti": [
    { id: "ep-m1", user_id: "user-tinetti", year: 2025, rank_position: 1, show_id: "show-severance", season_number: 2, episode_number: 10, episode_title: "The Severed Floor", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[0] },
    { id: "ep-m2", user_id: "user-tinetti", year: 2025, rank_position: 2, show_id: "show-succession", season_number: 4, episode_number: 10, episode_title: "With Open Eyes", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[4] },
    { id: "ep-m3", user_id: "user-tinetti", year: 2025, rank_position: 3, show_id: "show-bear", season_number: 4, episode_number: 7, episode_title: "Napkins", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[1] },
    { id: "ep-m4", user_id: "user-tinetti", year: 2025, rank_position: 4, show_id: "show-andor", season_number: 2, episode_number: 12, episode_title: "Rix Road", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[2] },
    { id: "ep-m5", user_id: "user-tinetti", year: 2025, rank_position: 5, show_id: "show-adolescence", season_number: 1, episode_number: 3, episode_title: "Interrogation", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[12] },
  ],
  "user-chubbs": [
    { id: "ep-k1", user_id: "user-chubbs", year: 2025, rank_position: 1, show_id: "show-succession", season_number: 4, episode_number: 10, episode_title: "With Open Eyes", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[4] },
    { id: "ep-k2", user_id: "user-chubbs", year: 2025, rank_position: 2, show_id: "show-severance", season_number: 2, episode_number: 10, episode_title: "The Severed Floor", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[0] },
    { id: "ep-k3", user_id: "user-chubbs", year: 2025, rank_position: 3, show_id: "show-barry", season_number: 4, episode_number: 8, episode_title: "wow", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[5] },
    { id: "ep-k4", user_id: "user-chubbs", year: 2025, rank_position: 4, show_id: "show-bear", season_number: 4, episode_number: 7, episode_title: "Napkins", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[1] },
    { id: "ep-k5", user_id: "user-chubbs", year: 2025, rank_position: 5, show_id: "show-shogun", season_number: 1, episode_number: 10, episode_title: "A Dream of a Dream", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[7] },
  ],
  "user-poteete": [
    { id: "ep-j1", user_id: "user-poteete", year: 2025, rank_position: 1, show_id: "show-severance", season_number: 2, episode_number: 10, episode_title: "The Severed Floor", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[0] },
    { id: "ep-j2", user_id: "user-poteete", year: 2025, rank_position: 2, show_id: "show-andor", season_number: 2, episode_number: 12, episode_title: "Rix Road", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[2] },
    { id: "ep-j3", user_id: "user-poteete", year: 2025, rank_position: 3, show_id: "show-adolescence", season_number: 1, episode_number: 3, episode_title: "Interrogation", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[12] },
    { id: "ep-j4", user_id: "user-poteete", year: 2025, rank_position: 4, show_id: "show-bear", season_number: 4, episode_number: 10, episode_title: "Doors", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[1] },
    { id: "ep-j5", user_id: "user-poteete", year: 2025, rank_position: 5, show_id: "show-shogun", season_number: 1, episode_number: 10, episode_title: "A Dream of a Dream", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[7] },
  ],
};

// ─── Performance Rankings ───────────────────────────────────
export const PERFORMANCE_RANKINGS_2025: Record<string, PerformanceRankingEntry[]> = {
  "user-tinetti": [
    { id: "perf-m1", user_id: "user-tinetti", year: 2025, rank_position: 1, actor_name: "Adam Scott", character_name: "Mark Scout", season_id: "season-severance-2", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0] },
    { id: "perf-m2", user_id: "user-tinetti", year: 2025, rank_position: 2, actor_name: "Jeremy Allen White", character_name: "Carmen Berzatto", season_id: "season-bear-4", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[1], season: SEASONS[1] },
    { id: "perf-m3", user_id: "user-tinetti", year: 2025, rank_position: 3, actor_name: "Diego Luna", character_name: "Cassian Andor", season_id: "season-andor-2", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[2], season: SEASONS[2] },
  ],
  "user-chubbs": [
    { id: "perf-k1", user_id: "user-chubbs", year: 2025, rank_position: 1, actor_name: "Jeremy Strong", character_name: "Kendall Roy", season_id: "season-succession-4", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[4], season: SEASONS[4] },
    { id: "perf-k2", user_id: "user-chubbs", year: 2025, rank_position: 2, actor_name: "Adam Scott", character_name: "Mark Scout", season_id: "season-severance-2", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0] },
    { id: "perf-k3", user_id: "user-chubbs", year: 2025, rank_position: 3, actor_name: "Bill Hader", character_name: "Barry Berkman", season_id: "season-barry-4", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[5], season: SEASONS[5] },
  ],
  "user-poteete": [
    { id: "perf-j1", user_id: "user-poteete", year: 2025, rank_position: 1, actor_name: "Adam Scott", character_name: "Mark Scout", season_id: "season-severance-2", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[0], season: SEASONS[0] },
    { id: "perf-j2", user_id: "user-poteete", year: 2025, rank_position: 2, actor_name: "Diego Luna", character_name: "Cassian Andor", season_id: "season-andor-2", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[2], season: SEASONS[2] },
    { id: "perf-j3", user_id: "user-poteete", year: 2025, rank_position: 3, actor_name: "Hiroyuki Sanada", character_name: "Yoshii Toranaga", season_id: "season-shogun-1", created_at: "2025-12-15", updated_at: "2025-12-15", show: SHOWS[7], season: SEASONS[7] },
  ],
};

// ─── All-Time Rankings ──────────────────────────────────────
export const ALL_TIME_RANKINGS: Record<string, AllTimeEntry[]> = {
  "user-tinetti": [
    { id: "at-m1", user_id: "user-tinetti", show_id: "show-severance", rank_position: 1, updated_at: "2025-12-15", show: SHOWS[0] },
    { id: "at-m2", user_id: "user-tinetti", show_id: "show-succession", rank_position: 2, updated_at: "2025-12-15", show: SHOWS[4] },
    { id: "at-m3", user_id: "user-tinetti", show_id: "show-bear", rank_position: 3, updated_at: "2025-12-15", show: SHOWS[1] },
    { id: "at-m4", user_id: "user-tinetti", show_id: "show-andor", rank_position: 4, updated_at: "2025-12-15", show: SHOWS[2] },
    { id: "at-m5", user_id: "user-tinetti", show_id: "show-shogun", rank_position: 5, updated_at: "2025-12-15", show: SHOWS[7] },
  ],
  "user-chubbs": [
    { id: "at-k1", user_id: "user-chubbs", show_id: "show-succession", rank_position: 1, updated_at: "2025-12-15", show: SHOWS[4] },
    { id: "at-k2", user_id: "user-chubbs", show_id: "show-severance", rank_position: 2, updated_at: "2025-12-15", show: SHOWS[0] },
    { id: "at-k3", user_id: "user-chubbs", show_id: "show-bear", rank_position: 3, updated_at: "2025-12-15", show: SHOWS[1] },
    { id: "at-k4", user_id: "user-chubbs", show_id: "show-barry", rank_position: 4, updated_at: "2025-12-15", show: SHOWS[5] },
    { id: "at-k5", user_id: "user-chubbs", show_id: "show-shogun", rank_position: 5, updated_at: "2025-12-15", show: SHOWS[7] },
  ],
  "user-poteete": [
    { id: "at-j1", user_id: "user-poteete", show_id: "show-severance", rank_position: 1, updated_at: "2025-12-15", show: SHOWS[0] },
    { id: "at-j2", user_id: "user-poteete", show_id: "show-andor", rank_position: 2, updated_at: "2025-12-15", show: SHOWS[2] },
    { id: "at-j3", user_id: "user-poteete", show_id: "show-bear", rank_position: 3, updated_at: "2025-12-15", show: SHOWS[1] },
    { id: "at-j4", user_id: "user-poteete", show_id: "show-shogun", rank_position: 4, updated_at: "2025-12-15", show: SHOWS[7] },
    { id: "at-j5", user_id: "user-poteete", show_id: "show-succession", rank_position: 5, updated_at: "2025-12-15", show: SHOWS[4] },
  ],
};

// ─── Blog Posts ─────────────────────────────────────────────
export const BLOG_POSTS: BlogPost[] = [
  {
    id: "post-1",
    author_id: "user-tinetti",
    title: "Why 2025 is the Year of Sci-Fi",
    slug: "2025-year-of-scifi",
    body: `## The Sci-Fi Renaissance\n\nLooking at our 2025 rankings, one trend is impossible to ignore: science fiction dominated this year like never before. Between **Severance Season 2**, **Andor Season 2**, and **Fallout Season 1**, the genre didn't just show up — it took over.\n\n### Severance: The Standard Bearer\n\nWhat makes Severance special isn't the sci-fi premise — it's how the show uses that premise to explore deeply human themes. Season 2 expanded the world in ways that felt both surprising and inevitable.\n\n### What This Means for TV\n\nNetworks and streamers are clearly investing in ambitious genre storytelling, and audiences are rewarding them for it. The days of sci-fi being a niche interest on television are long gone.\n\nLooking ahead to 2026, I expect this trend to continue. The bar has been set incredibly high.`,
    tags: ["2025", "sci-fi", "year-in-review"],
    is_pinned: true,
    published_at: "2025-12-13T10:00:00Z",
    updated_at: "2025-12-13T10:00:00Z",
    author: USERS[0],
  },
  {
    id: "post-2",
    author_id: "user-poteete",
    title: "Mid-Year Check-In: What's Surprised Us So Far",
    slug: "2025-midyear-checkin",
    body: `## Halfway Through 2025\n\nWe're six months in and already there's been some major movement in our rankings. Here are the biggest surprises so far.\n\n### Adolescence Came Out of Nowhere\n\nNone of us had this on our radar, and suddenly it's a consensus top 10 show. Netflix really snuck this one in.\n\n### The White Lotus Divided Us\n\nTinetti has it at #4, I have it at #8, and Chubbs has it at #5. This one's going to be a debate at year-end for sure.\n\n### Shogun Delivered\n\nAll three of us have it in the top 6. When a show lives up to the hype this consistently across our group, you know it's special.`,
    tags: ["2025", "mid-year", "discussion"],
    is_pinned: false,
    published_at: "2025-07-01T12:00:00Z",
    updated_at: "2025-07-01T12:00:00Z",
    author: USERS[2],
  },
];

// ─── Helper to get rankings by year ─────────────────────────
export function getRankingsByYear(year: number): Record<string, RankingEntry[]> {
  if (year === 2025) return RANKINGS_2025;
  // For other years, return empty — to be backfilled
  return {
    "user-tinetti": [],
    "user-chubbs": [],
    "user-poteete": [],
  };
}

export function getUserById(id: string): User | undefined {
  return USERS.find((u) => u.id === id);
}

export function getUserByUsername(name: string): User | undefined {
  return USERS.find((u) => u.display_name.toLowerCase() === name.toLowerCase());
}
