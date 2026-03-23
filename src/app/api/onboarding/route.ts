import { NextResponse } from "next/server";

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = "https://api.themoviedb.org/3";

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", TMDB_API_KEY || "");
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString(), { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

// Curated iconic movies across genres for onboarding taste profile
const CURATED_MOVIE_IDS = [
  // Action/Adventure
  278, // Shawshank Redemption (Drama)
  238, // The Godfather
  424, // Schindler's List
  13,  // Forrest Gump
  769, // Goodfellas
  // Sci-Fi
  157336, // Interstellar
  603,    // The Matrix
  27205,  // Inception
  73,     // American Beauty  
  11,     // Star Wars
  // Animation/Family
  8587,   // The Lion King
  585,    // Monsters, Inc.
  862,    // Toy Story
  // Thriller/Horror
  539,    // Psycho
  694,    // The Shining
  // Comedy/Romance
  13,     // Forrest Gump (already listed, add more)
  218,    // The Terminator
  76341,  // Mad Max: Fury Road
  // Popular modern
  299536, // Avengers: Infinity War
  284054, // Black Panther
  1726,   // Iron Man
  24428,  // The Avengers
];

// Get unique IDs
const UNIQUE_IDS = Array.from(new Set(CURATED_MOVIE_IDS)).slice(0, 20);

export async function GET() {
  try {
    // Fetch trending + top rated to get diverse popular movies
    const [trendingRes, topRatedRes] = await Promise.all([
      tmdbFetch<{ results: TMDBMovie[] }>("/trending/movie/week"),
      tmdbFetch<{ results: TMDBMovie[] }>("/movie/top_rated"),
    ]);

    // Mix trending + top rated, deduplicate
    const combined = [
      ...trendingRes.results.slice(0, 10),
      ...topRatedRes.results.slice(0, 10),
    ];

    const seen = new Set<number>();
    const movies: TMDBMovie[] = [];
    for (const m of combined) {
      if (!seen.has(m.id) && m.poster_path) {
        seen.add(m.id);
        movies.push(m);
      }
      if (movies.length >= 20) break;
    }

    // If we need more, fill from curated list
    if (movies.length < 20) {
      const extraFetches = UNIQUE_IDS
        .filter((id) => !Array.from(seen).includes(id))
        .slice(0, 20 - movies.length)
        .map((id) => tmdbFetch<TMDBMovie>(`/movie/${id}`).catch(() => null));
      
      const extras = await Promise.all(extraFetches);
      for (const m of extras) {
        if (m && m.poster_path && !seen.has(m.id)) {
          seen.add(m.id);
          movies.push(m);
        }
      }
    }

    return NextResponse.json({ movies: movies.slice(0, 20) });
  } catch (error) {
    console.error("Onboarding movies error:", error);
    return NextResponse.json({ error: "Failed to fetch movies" }, { status: 500 });
  }
}

interface TMDBMovie {
  id: number;
  title: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  genre_ids?: number[];
}
