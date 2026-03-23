import { NextRequest, NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY || "");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

// GET /api/onboarding/recommendations?movie_ids=1,2,3
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const movieIdsParam = searchParams.get("movie_ids") || "";
  const movieIds = movieIdsParam
    .split(",")
    .map((id) => parseInt(id.trim(), 10))
    .filter((id) => !isNaN(id))
    .slice(0, 5); // Use top 5 rated movies for recommendations

  if (movieIds.length === 0) {
    return NextResponse.json({ recommendations: [] });
  }

  try {
    // Fetch recommendations for each top-rated movie
    const recFetches = movieIds.map((id) =>
      tmdbFetch<{ results: TMDBMovie[] }>(`/movie/${id}/recommendations`).catch(() => ({ results: [] }))
    );
    const results = await Promise.all(recFetches);

    // Merge + deduplicate + exclude source movies
    const sourceSet = new Set(movieIds);
    const seen = new Set<number>();
    const recommendations: TMDBMovie[] = [];

    for (const result of results) {
      for (const movie of result.results) {
        if (!seen.has(movie.id) && !sourceSet.has(movie.id) && movie.poster_path) {
          seen.add(movie.id);
          recommendations.push(movie);
        }
        if (recommendations.length >= 12) break;
      }
      if (recommendations.length >= 12) break;
    }

    return NextResponse.json({ recommendations: recommendations.slice(0, 12) });
  } catch (error) {
    console.error("Onboarding recommendations error:", error);
    return NextResponse.json({ error: "Failed to fetch recommendations" }, { status: 500 });
  }
}

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
}
