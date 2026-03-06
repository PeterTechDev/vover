import { searchMulti } from "@/lib/tmdb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const data = await searchMulti(q);

    // Filter to movie/tv only, take max 6
    const results = data.results
      .filter((item) => item.media_type === "movie" || item.media_type === "tv")
      .slice(0, 6)
      .map((item) => ({
        id: item.id,
        media_type: item.media_type,
        title: item.media_type === "movie" ? item.title : item.name,
        poster_path: item.poster_path,
        year: (item.release_date || item.first_air_date || "").slice(0, 4) || null,
      }));

    return NextResponse.json({ results });
  } catch {
    return NextResponse.json({ results: [] }, { status: 500 });
  }
}
