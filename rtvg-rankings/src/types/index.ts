export type Rewatchability = "Low" | "Medium" | "High" | "Instant Classic";

export type UserRole = "admin" | "contributor";

export interface User {
  id: string;
  email: string;
  display_name: string;
  avatar_url: string;
  role: UserRole;
  created_at: string;
}

export interface Show {
  id: string;
  tmdb_id: number;
  title: string;
  poster_url: string;
  genres: string[];
  network: string;
  status: string;
  last_synced_at: string;
}

export interface Season {
  id: string;
  show_id: string;
  tmdb_season_id: number;
  season_number: number;
  air_date_start: string;
  air_date_end: string | null;
  episode_count: number;
  poster_url: string | null;
}

export interface RankingEntry {
  id: string;
  user_id: string;
  season_id: string;
  year: number;
  rank_position: number;
  rewatchability: Rewatchability | null;
  score: number | null;
  review: string | null;
  created_at: string;
  updated_at: string;
  // Joined data
  show?: Show;
  season?: Season;
}

export interface EpisodeRankingEntry {
  id: string;
  user_id: string;
  year: number;
  rank_position: number;
  show_id: string;
  season_number: number;
  episode_number: number;
  episode_title: string;
  created_at: string;
  updated_at: string;
  show?: Show;
}

export interface PerformanceRankingEntry {
  id: string;
  user_id: string;
  year: number;
  rank_position: number;
  actor_name: string;
  character_name: string | null;
  season_id: string;
  created_at: string;
  updated_at: string;
  show?: Show;
  season?: Season;
}

export interface AllTimeEntry {
  id: string;
  user_id: string;
  season_id: string;
  rank_position: number;
  updated_at: string;
  show?: Show;
  season?: Season;
}

export interface AwardCategory {
  id: string;
  year: number;
  name: string;
  is_preset: boolean;
  created_by: string;
  approved: boolean;
}

export interface AwardPick {
  id: string;
  category_id: string;
  user_id: string;
  season_id: string | null;
  blurb: string | null;
  created_at: string;
  show?: Show;
  season?: Season;
  user?: User;
}

export interface BlogPost {
  id: string;
  author_id: string;
  title: string;
  slug: string;
  body: string;
  tags: string[];
  is_pinned: boolean;
  published_at: string;
  updated_at: string;
  author?: User;
}

export interface BlogComment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  author?: User;
}

export type ActivityEventType =
  | "add"
  | "move"
  | "remove"
  | "finalize"
  | "award_pick"
  | "blog_post";

export interface ActivityEvent {
  id: string;
  user_id: string;
  event_type: ActivityEventType;
  metadata: {
    show_name?: string;
    season_number?: number;
    old_rank?: number;
    new_rank?: number;
    year?: number;
    award_name?: string;
    post_title?: string;
    post_slug?: string;
  };
  year: number | null;
  created_at: string;
  user?: User;
}

export interface ConsensusEntry {
  show: Show;
  season: Season;
  average_rank: number;
  consensus_position: number;
  user_ranks: Record<string, number>;
  ranked_by_count: number;
}

export interface DisagreementEntry {
  show: Show;
  season: Season;
  user_ranks: Record<string, number>;
  spread: number;
}

// TMDB API types
export interface TMDBSearchResult {
  id: number;
  name: string;
  poster_path: string | null;
  first_air_date: string;
  overview: string;
  genre_ids: number[];
}

export interface TMDBSeasonDetail {
  id: number;
  season_number: number;
  name: string;
  air_date: string;
  episodes: TMDBEpisode[];
  poster_path: string | null;
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  air_date: string;
  overview: string;
  still_path: string | null;
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}
