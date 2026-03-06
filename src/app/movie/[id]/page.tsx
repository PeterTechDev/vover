import Image from "next/image";
import { getMovie, posterUrl, backdropUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Clock, Calendar, Star } from "lucide-react";
import { DetailActions } from "@/components/detail-actions";
import { notFound } from "next/navigation";

export default async function MovieDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  let movie;
  try {
    movie = await getMovie(id);
  } catch {
    notFound();
  }

  const backdrop = backdropUrl(movie.backdrop_path);

  return (
    <div>
      {backdrop && (
        <div className="relative h-[40vh] w-full md:h-[50vh]">
          <Image
            src={backdrop}
            alt={movie.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4">
        <div className={`flex flex-col gap-8 md:flex-row ${backdrop ? "-mt-32 relative z-10" : "pt-8"}`}>
          <div className="flex-shrink-0">
            <Image
              src={posterUrl(movie.poster_path)}
              alt={movie.title}
              width={300}
              height={450}
              className="rounded-lg shadow-2xl"
              priority
            />
          </div>

          <div className="flex flex-1 flex-col gap-4">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{movie.title}</h1>
              {movie.tagline && (
                <p className="mt-1 text-lg italic text-muted-foreground">{movie.tagline}</p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {movie.release_date && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {movie.release_date.slice(0, 4)}
                </div>
              )}
              {movie.runtime > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
                </div>
              )}
              {movie.vote_average > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  {movie.vote_average.toFixed(1)} ({movie.vote_count.toLocaleString()} votes)
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {movie.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>

            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              {movie.overview || "No overview available."}
            </p>

            <DetailActions
              tmdbId={movie.id}
              mediaType="movie"
              title={movie.title}
              posterPath={movie.poster_path}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
