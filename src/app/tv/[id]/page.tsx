import { Metadata } from "next";
import Image from "next/image";
import {
  getTVShow,
  getTVCredits,
  getTVVideos,
  getTVWatchProviders,
  getSimilarTV,
  posterUrl,
  backdropUrl,
  profileUrl,
} from "@/lib/tmdb";
import { Badge } from "@/components/ui/badge";
import { Calendar, Star, Tv, Users, Play, TrendingUp } from "lucide-react";
import { DetailActions } from "@/components/detail-actions";
import { MediaCard } from "@/components/media-card";
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

  const [creditsResult, videosResult, providersResult, similarResult] = await Promise.allSettled([
    getTVCredits(id),
    getTVVideos(id),
    getTVWatchProviders(id),
    getSimilarTV(id),
  ]);

  const credits = creditsResult.status === "fulfilled" ? creditsResult.value : null;
  const videos = videosResult.status === "fulfilled" ? videosResult.value : null;
  const providers = providersResult.status === "fulfilled" ? providersResult.value : null;
  const similar = similarResult.status === "fulfilled" ? similarResult.value : null;

  const backdrop = backdropUrl(show.backdrop_path);
  const topCast = credits?.cast?.slice(0, 12) ?? [];

  const trailer = videos?.results?.find(
    v => v.site === "YouTube" && v.type === "Trailer" && v.official
  ) ?? videos?.results?.find(
    v => v.site === "YouTube" && v.type === "Trailer"
  ) ?? videos?.results?.find(
    v => v.site === "YouTube"
  );

  const providerData = providers?.results?.["US"] ??
    Object.values(providers?.results ?? {})[0];
  const flatrate = providerData?.flatrate ?? [];
  const rent = providerData?.rent ?? [];

  const similarShows = similar?.results?.filter(s => s.poster_path).slice(0, 8) ?? [];

  return (
    <div className="animate-fade-in min-h-screen">
      {/* ── Backdrop Hero ──────────────────────────────────────────── */}
      <div className="relative h-[55vh] w-full md:h-[65vh] overflow-hidden">
        {backdrop ? (
          <Image
            src={backdrop}
            alt={show.name}
            fill
            className="object-cover object-center"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-secondary to-background" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent" />

        {trailer && (
          <div className="absolute inset-0 flex items-center justify-center">
            <a
              href={`https://www.youtube.com/watch?v=${trailer.key}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 rounded-full bg-black/40 px-6 py-3 text-white backdrop-blur-sm border border-white/20 hover:bg-primary/80 hover:border-primary transition-all duration-300 hover:scale-105"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 group-hover:bg-white/30 transition-colors">
                <Play className="h-5 w-5 fill-white ml-0.5" />
              </div>
              <span className="font-semibold text-sm">Watch Trailer</span>
            </a>
          </div>
        )}
      </div>

      {/* ── Main Content ───────────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative z-10 -mt-48 flex flex-col gap-8 md:flex-row md:-mt-56">
          {/* Poster */}
          <div className="flex justify-center md:justify-start flex-shrink-0">
            <div className="relative w-[160px] md:w-[240px] lg:w-[280px]">
              <Image
                src={posterUrl(show.poster_path)}
                alt={show.name}
                width={280}
                height={420}
                className="rounded-2xl shadow-2xl shadow-black/70 w-full h-auto ring-1 ring-white/10"
                priority
              />
            </div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-5 pb-8 pt-0 md:pt-32">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight md:text-5xl leading-none">
                {show.name}
              </h1>
              {show.tagline && (
                <p className="mt-2 text-base italic text-muted-foreground/80">
                  &ldquo;{show.tagline}&rdquo;
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {show.first_air_date && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" />
                  {show.first_air_date.slice(0, 4)}
                </div>
              )}
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Tv className="h-3.5 w-3.5" />
                {show.number_of_seasons} season{show.number_of_seasons !== 1 ? "s" : ""}
                <span className="opacity-50">·</span>
                {show.number_of_episodes} ep{show.number_of_episodes !== 1 ? "s" : ""}
              </div>
              {show.vote_average > 0 && (
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                  <span>{show.vote_average.toFixed(1)}</span>
                  <span className="text-muted-foreground font-normal">
                    ({show.vote_count.toLocaleString()})
                  </span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {show.genres.map((genre) => (
                <Badge
                  key={genre.id}
                  variant="secondary"
                  className="rounded-full px-3 py-0.5 text-xs font-medium border border-border/50"
                >
                  {genre.name}
                </Badge>
              ))}
            </div>

            <p className="max-w-2xl text-[15px] leading-relaxed text-foreground/75">
              {show.overview || "No overview available."}
            </p>

            <DetailActions
              tmdbId={show.id}
              mediaType="tv"
              title={show.name}
              posterPath={show.poster_path}
            />

            {/* Streaming Providers */}
            {(flatrate.length > 0 || rent.length > 0) && (
              <div className="mt-2 space-y-3">
                {flatrate.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20 shrink-0">
                      Stream
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {flatrate.slice(0, 6).map((p) => (
                        <div
                          key={p.provider_id}
                          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-secondary/50"
                          title={p.provider_name}
                        >
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                            alt={p.provider_name}
                            width={36}
                            height={36}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {rent.length > 0 && (
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground w-20 shrink-0">
                      Rent/Buy
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {rent.slice(0, 6).map((p) => (
                        <div
                          key={p.provider_id}
                          className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-secondary/50"
                          title={p.provider_name}
                        >
                          <Image
                            src={`https://image.tmdb.org/t/p/w92${p.logo_path}`}
                            alt={p.provider_name}
                            width={36}
                            height={36}
                            className="rounded-lg object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── Cast Carousel ─────────────────────────────────────────── */}
        {topCast.length > 0 && (
          <section className="mt-12 mb-10">
            <div className="mb-5 flex items-center gap-2">
              <Users className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">Cast</h2>
            </div>
            <div className="flex gap-4 overflow-x-auto pb-3 scrollbar-hide">
              {topCast.map((member) => {
                const photo = profileUrl(member.profile_path);
                return (
                  <div
                    key={member.id}
                    className="flex w-[90px] flex-shrink-0 flex-col items-center gap-2 text-center"
                  >
                    <div className="relative h-20 w-20 overflow-hidden rounded-full bg-secondary ring-2 ring-border/50">
                      {photo ? (
                        <Image
                          src={photo}
                          alt={member.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl font-bold text-muted-foreground">
                          {member.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold leading-tight line-clamp-2">
                        {member.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground line-clamp-1">
                        {member.character}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Similar Shows ─────────────────────────────────────────── */}
        {similarShows.length > 0 && (
          <section className="mb-16">
            <div className="mb-5 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <h2 className="text-lg font-bold tracking-tight">More Like This</h2>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {similarShows.map((item) => (
                <MediaCard
                  key={item.id}
                  tmdbId={item.id}
                  mediaType="tv"
                  title={item.name || item.title || "Untitled"}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  year={item.first_air_date?.slice(0, 4) ?? item.release_date?.slice(0, 4)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
