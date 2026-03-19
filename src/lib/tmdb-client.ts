/**
 * Client-side TMDB helpers — uses NEXT_PUBLIC_TMDB_API_KEY
 * Use in client components / useEffect hooks
 */

export type { TMDBMediaItem, TMDBSearchResult } from "./tmdb";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetchClient<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY || "");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

import type { TMDBSearchResult } from "./tmdb";

export async function getTrendingClient(
  mediaType: "all" | "movie" | "tv" = "all",
  timeWindow: "day" | "week" = "week"
): Promise<TMDBSearchResult> {
  return tmdbFetchClient<TMDBSearchResult>(`/trending/${mediaType}/${timeWindow}`);
}
