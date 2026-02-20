import type {
  TMDBSearchResult,
  TMDBSeasonDetail,
  TMDBCastMember,
} from "@/types";

const TMDB_BASE = "https://api.themoviedb.org/3";
const API_KEY = process.env.TMDB_API_KEY;

async function tmdbFetch<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set("api_key", API_KEY || "");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`TMDB API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

export async function searchShows(query: string): Promise<TMDBSearchResult[]> {
  const data = await tmdbFetch<{ results: TMDBSearchResult[] }>("/search/tv", {
    query,
    include_adult: "false",
    language: "en-US",
    page: "1",
  });
  return data.results;
}

export async function getShowDetails(tmdbId: number) {
  return tmdbFetch<{
    id: number;
    name: string;
    poster_path: string | null;
    overview?: string;
    first_air_date?: string;
    vote_average?: number;
    homepage?: string;
    episode_run_time?: number[];
    genres: { id: number; name: string }[];
    networks: { id: number; name: string }[];
    status: string;
    number_of_seasons: number;
    seasons: {
      id: number;
      season_number: number;
      name: string;
      air_date: string | null;
      episode_count: number;
      poster_path: string | null;
    }[];
    last_episode_to_air?: { runtime?: number } | null;
  }>(`/tv/${tmdbId}`);
}

export async function getSeasonDetails(
  tmdbId: number,
  seasonNumber: number
): Promise<TMDBSeasonDetail> {
  return tmdbFetch<TMDBSeasonDetail>(`/tv/${tmdbId}/season/${seasonNumber}`);
}

export async function getShowCredits(
  tmdbId: number
): Promise<TMDBCastMember[]> {
  const data = await tmdbFetch<{ cast: TMDBCastMember[] }>(
    `/tv/${tmdbId}/credits`
  );
  return data.cast;
}

export function getPosterUrl(
  path: string | null,
  size: string = "w342"
): string {
  if (!path) return "/placeholder-poster.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
