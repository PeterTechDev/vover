import { Metadata } from "next";
import { SearchBar } from "@/components/search-bar";
import { MediaCard } from "@/components/media-card";
import { cookies } from "next/headers";
import { searchMulti, type TMDBMediaItem } from "@/lib/tmdb";
import { SearchX, Search } from "lucide-react";

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

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = searchParams.q || "";
  return {
    title: query ? `Search: ${query}` : "Search",
    description: query
      ? `Search results for "${query}" on Vover`
      : "Search movies and TV shows on Vover",
  };
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
      const cookieStore = await cookies();
      const locale = cookieStore.get("NEXT_LOCALE")?.value ?? "pt-BR";
      const data = await searchMulti(query, page, locale);
      results = data.results.filter(
        (r) => r.media_type === "movie" || r.media_type === "tv"
      );
      totalResults = data.total_results;
    } catch {
      // API key missing or error — results stay empty
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Search input */}
      <div className="mb-6 max-w-xl">
        <SearchBar defaultValue={query} autoFocus={!query} />
      </div>

      {/* Results header */}
      {query && (
        <p className="mb-6 text-sm text-muted-foreground">
          {totalResults > 0 ? (
            <>
              <span className="font-medium text-foreground">{totalResults.toLocaleString()}</span>{" "}
              results for &ldquo;{query}&rdquo;
            </>
          ) : (
            <>No results for &ldquo;{query}&rdquo;</>
          )}
        </p>
      )}

      {/* Results grid */}
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
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
            <SearchX className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold">No results found</h3>
            <p className="text-sm text-muted-foreground">
              Try a different title, or check your spelling.
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-24 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-secondary/50">
            <Search className="h-8 w-8 text-muted-foreground/50" />
          </div>
          <div>
            <h3 className="mb-1 font-semibold">Search for movies &amp; TV</h3>
            <p className="text-sm text-muted-foreground">
              Type something above to find titles to add to your watchlist.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
