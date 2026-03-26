const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

export const TMDB_IMAGE_BASE = "https://image.tmdb.org/t/p";

export function posterUrl(path: string | null, size = "w500") {
  if (!path) return "/no-poster.svg";
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function backdropUrl(path: string | null, size = "w1280") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

export function profileUrl(path: string | null, size = "w185") {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE}/${size}${path}`;
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY || "");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status} ${res.statusText}`);
  return res.json();
}

export interface TMDBSearchResult {
  page: number;
  total_pages: number;
  total_results: number;
  results: TMDBMediaItem[];
}

export interface TMDBMediaItem {
  id: number;
  media_type?: "movie" | "tv";
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  genre_ids?: number[];
}

export interface TMDBMovieDetail {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  budget?: number;
  revenue?: number;
  production_companies?: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBTVDetail {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  number_of_seasons: number;
  number_of_episodes: number;
  episode_run_time?: number[];
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  tagline: string;
  status: string;
  networks?: { id: number; name: string; logo_path: string | null }[];
}

export interface TMDBCastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
  order: number;
}

export interface TMDBCrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
  profile_path: string | null;
}

export interface TMDBCredits {
  cast: TMDBCastMember[];
  crew: TMDBCrewMember[];
}

export interface TMDBVideo {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
  published_at: string;
}

export interface TMDBVideosResult {
  results: TMDBVideo[];
}

export interface TMDBWatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface TMDBWatchProvidersResult {
  results: Record<string, {
    link?: string;
    flatrate?: TMDBWatchProvider[];
    rent?: TMDBWatchProvider[];
    buy?: TMDBWatchProvider[];
  }>;
}

export async function searchMulti(query: string, page = 1): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>("/search/multi", { query, page: String(page) });
}

export async function getMovie(id: number): Promise<TMDBMovieDetail> {
  return tmdbFetch<TMDBMovieDetail>(`/movie/${id}`);
}

export async function getTVShow(id: number): Promise<TMDBTVDetail> {
  return tmdbFetch<TMDBTVDetail>(`/tv/${id}`);
}

export async function getTrending(mediaType: "movie" | "tv" | "all" = "all", timeWindow: "day" | "week" = "week"): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/trending/${mediaType}/${timeWindow}`);
}

export async function getMovieCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/movie/${id}/credits`);
}

export async function getTVCredits(id: number): Promise<TMDBCredits> {
  return tmdbFetch<TMDBCredits>(`/tv/${id}/credits`);
}

export async function getMovieVideos(id: number): Promise<TMDBVideosResult> {
  return tmdbFetch<TMDBVideosResult>(`/movie/${id}/videos`);
}

export async function getTVVideos(id: number): Promise<TMDBVideosResult> {
  return tmdbFetch<TMDBVideosResult>(`/tv/${id}/videos`);
}

export async function getMovieWatchProviders(id: number): Promise<TMDBWatchProvidersResult> {
  return tmdbFetch<TMDBWatchProvidersResult>(`/movie/${id}/watch/providers`);
}

export async function getTVWatchProviders(id: number): Promise<TMDBWatchProvidersResult> {
  return tmdbFetch<TMDBWatchProvidersResult>(`/tv/${id}/watch/providers`);
}

export async function getSimilarMovies(id: number): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/movie/${id}/similar`);
}

export async function getSimilarTV(id: number): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/tv/${id}/similar`);
}

export async function getMovieRecommendations(id: number): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/movie/${id}/recommendations`);
}

export async function getTVRecommendations(id: number): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/tv/${id}/recommendations`);
}

export async function getPopular(mediaType: "movie" | "tv", page = 1): Promise<TMDBSearchResult> {
  return tmdbFetch<TMDBSearchResult>(`/${mediaType}/popular`, { page: String(page) });
}
