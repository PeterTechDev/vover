import { SearchBar } from "@/components/search-bar";
import { MediaCard } from "@/components/media-card";
import { searchMulti, type TMDBMediaItem } from "@/lib/tmdb";
import { SearchX } from "lucide-react";

function getTitle(item: TMDBMediaItem) {
  return item.title || item.name || "Untitled";
}

function getYear(item: TMDBMediaItem) {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : null;
}

function getMediaType(item: TMDBMediaItem): "movie" | "tv" {
  return item.media_type === "tv" ? "tv" : "movie";
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string; page?: string };
}) {
  const query = searchParams.q || "";
  const page = Number(searchParams.page) || 1;

  let results: TMDBMediaItem[] = [];
  let totalResults = 0;

  if (query) {
    try {
      const data = await searchMulti(query, page);
      results = data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv");
      totalResults = data.total_results;
    } catch {
      // API key missing or error — results stay empty
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 max-w-xl">
        <SearchBar defaultValue={query} autoFocus />
      </div>

      {query && (
        <p className="mb-6 text-sm text-muted-foreground">
          {totalResults > 0
            ? `Found ${totalResults} results for "${query}"`
            : `No results for "${query}"`}
        </p>
      )}

      {results.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {results.map((item) => (
            <MediaCard
              key={`${item.media_type}-${item.id}`}
              tmdbId={item.id}
              mediaType={getMediaType(item)}
              title={getTitle(item)}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              year={getYear(item)}
            />
          ))}
        </div>
      ) : query ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <SearchX className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No movies or TV shows found. Try a different search.</p>
        </div>
      ) : null}
    </div>
  );
}
