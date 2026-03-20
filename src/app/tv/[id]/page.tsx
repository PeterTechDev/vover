import { Metadata } from "next";
import Image from "next/image";
import { getTVShow, posterUrl, backdropUrl } from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Tv } from "lucide-react";
import { DetailActions } from "@/components/detail-actions";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const id = Number(params.id);
  if (isNaN(id)) return { title: "TV Show" };
  try {
    const show = await getTVShow(id);
    return {
      title: show.name,
      description: show.overview?.slice(0, 160) || `Watch ${show.name} on Vover.`,
      openGraph: {
        title: show.name,
        description: show.overview?.slice(0, 160) || undefined,
        images: show.poster_path
          ? [`https://image.tmdb.org/t/p/w500${show.poster_path}`]
          : undefined,
      },
    };
  } catch {
    return { title: "TV Show" };
  }
}

export default async function TVDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  if (isNaN(id)) notFound();

  let show;
  try {
    show = await getTVShow(id);
  } catch {
    notFound();
  }

  const backdrop = backdropUrl(show.backdrop_path);

  return (
    <div className="animate-fade-in">
      {backdrop && (
        <div className="relative h-[40vh] w-full md:h-[50vh]">
          <Image
            src={backdrop}
            alt={show.name}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/20" />
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4">
        <div
          className={`flex flex-col gap-8 md:flex-row ${
            backdrop ? "-mt-32 relative z-10" : "pt-8"
          }`}
        >
          <div className="flex-shrink-0 flex justify-center md:justify-start">
            <div className="relative w-[160px] md:w-[300px]">
              <Image
                src={posterUrl(show.poster_path)}
                alt={show.name}
                width={300}
                height={450}
                className="rounded-xl shadow-2xl shadow-black/50 w-full h-auto"
                priority
              />
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-4 pb-12">
            <div>
              <h1 className="text-3xl font-bold md:text-4xl">{show.name}</h1>
              {show.tagline && (
                <p className="mt-1 text-base italic text-muted-foreground">
                  {show.tagline}
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {show.first_air_date && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {show.first_air_date.slice(0, 4)}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Tv className="h-4 w-4" />
                {show.number_of_seasons} season
                {show.number_of_seasons !== 1 ? "s" : ""} (
                {show.number_of_episodes} episodes)
              </div>
              {show.vote_average > 0 && (
                <div className="flex items-center gap-1.5 text-sm">
                  <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  {show.vote_average.toFixed(1)}{" "}
                  <span className="text-muted-foreground">
                    ({show.vote_count.toLocaleString()} votes)
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {show.genres.map((genre) => (
                <Badge key={genre.id} variant="secondary">
                  {genre.name}
                </Badge>
              ))}
            </div>

            <p className="max-w-2xl leading-relaxed text-muted-foreground">
              {show.overview || "No overview available."}
            </p>

            <DetailActions
              tmdbId={show.id}
              mediaType="tv"
              title={show.name}
              posterPath={show.poster_path}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
