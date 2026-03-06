import { SearchBar } from "@/components/search-bar";
import { MediaCard } from "@/components/media-card";
import { getTrending, type TMDBMediaItem } from "@/lib/tmdb";
import { TrendingUp } from "lucide-react";

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

export default async function HomePage() {
  let trending: TMDBMediaItem[] = [];

  try {
    const data = await getTrending("all", "week");
    trending = data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv");
  } catch {
    // TMDB API key not set — show empty state
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="flex flex-col items-center gap-6 py-16 text-center md:py-24">
        <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
          What should we <span className="text-primary">watch</span> next?
        </h1>
        <p className="max-w-lg text-lg text-muted-foreground">
          Get recommendations from friends you trust — not algorithms.
        </p>
        <div className="w-full max-w-xl">
          <SearchBar large autoFocus />
        </div>
      </section>

      {trending.length > 0 && (
        <section>
          <div className="mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Trending This Week</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trending.slice(0, 10).map((item) => (
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
        </section>
      )}

      {trending.length === 0 && (
        <section className="flex flex-col items-center gap-6 rounded-lg border border-dashed border-border/50 p-12 text-center">
          <p className="text-muted-foreground">
            No content to show yet. Search above to find movies and TV shows.
          </p>
          <div className="w-full max-w-xl">
            <SearchBar large />
          </div>
        </section>
      )}
    </div>
  );
}
