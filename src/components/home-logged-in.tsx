"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MediaCard } from "@/components/media-card";
import { SearchBar } from "@/components/search-bar";
import type { TMDBMediaItem } from "@/lib/tmdb-client";
import { useSession } from "next-auth/react";
import {
  getWatchlist,
  getWatched,
  getFriendActivity,
  getRecommendationsForUser,
} from "@/lib/db-client";
import {
  TrendingUp,
  List,
  Eye,
  Sparkles,
  Users,
  ArrowRight,
  Clapperboard,
  Film,
  Tv,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import Link from "next/link";
import { useTranslations } from "next-intl";

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

function HorizontalSection({
  title,
  icon: Icon,
  href,
  children,
  loading,
  empty,
}: {
  title: string;
  icon: React.ElementType;
  href?: string;
  children: React.ReactNode;
  loading?: boolean;
  empty?: React.ReactNode;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
      e.preventDefault();
      const direction = e.key === "ArrowRight" ? 1 : -1;
      scrollRef.current?.scrollBy({ left: direction * 200, behavior: "smooth" });
    }
  }, []);

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {href && (
          <Link
            href={href}
            className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1 text-primary hover:text-primary"}
          >
            See all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        )}
      </div>
      {loading ? (
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] w-[140px] flex-shrink-0 rounded-lg animate-shimmer" />
          ))}
        </div>
      ) : empty ? (
        empty
      ) : (
        <div className="relative">
          <div
            ref={scrollRef}
            role="region"
            aria-label={title}
            tabIndex={0}
            onKeyDown={handleKeyDown}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm"
          >
            {children}
          </div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
        </div>
      )}
    </section>
  );
}


interface WatchlistItem {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  added_at: string;
}

interface WatchedItem {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  rating: number | null;
  watched_at: string;
}

interface FeedEntry {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  rating: number | null;
  user: { id: string; name: string | null } | null;
}

interface Recommendation {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  from_user?: { name: string | null } | null;
}

export function HomeLoggedIn({ userName }: { userName: string | null }) {
  const t = useTranslations("Home");
  const { data: session, status } = useSession();
  const [trending, setTrending] = useState<TMDBMediaItem[]>([]);
  const [popularMovies, setPopularMovies] = useState<TMDBMediaItem[]>([]);
  const [popularTV, setPopularTV] = useState<TMDBMediaItem[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [recentlyWatched, setRecentlyWatched] = useState<WatchedItem[]>([]);
  const [friendsWatching, setFriendsWatching] = useState<FeedEntry[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingPopular, setLoadingPopular] = useState(true);
  const [loadingPersonal, setLoadingPersonal] = useState(true);

  const greeting = userName
    ? t("welcomeBack", { name: userName.split(" ")[0] })
    : t("welcomeBackGeneric");

  useEffect(() => {
    fetch("/api/trending")
      .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
      .then((data) => {
        setTrending(
          (data.results as TMDBMediaItem[])
            .filter((r) => r.media_type === "movie" || r.media_type === "tv")
            .slice(0, 14)
        );
      })
      .catch(() => {/* leave trending empty on error */})
      .finally(() => setLoadingTrending(false));
  }, []);

  useEffect(() => {
    Promise.all([
      fetch("/api/popular?type=movie").then((r) => (r.ok ? r.json() : { results: [] })),
      fetch("/api/popular?type=tv").then((r) => (r.ok ? r.json() : { results: [] })),
    ]).then(([moviesData, tvData]) => {
      setPopularMovies((moviesData.results as TMDBMediaItem[]).slice(0, 14));
      setPopularTV((tvData.results as TMDBMediaItem[]).slice(0, 14));
    }).catch(() => {}).finally(() => setLoadingPopular(false));
  }, []);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.id) {
      setLoadingPersonal(false);
      return;
    }
    const userId = session.user.id;
    Promise.all([
      getWatchlist(userId),
      getWatched(userId),
      getFriendActivity(userId),
      getRecommendationsForUser(userId),
    ]).then(([wlRes, watchedRes, feedRes, recsRes]) => {
      setWatchlist((wlRes.data || []) as WatchlistItem[]);
      setRecentlyWatched(((watchedRes.data || []) as WatchedItem[]).slice(0, 8));
      setFriendsWatching(((feedRes.data || []) as FeedEntry[]).slice(0, 8));
      setRecommendations(((recsRes.data || []) as Recommendation[]).slice(0, 8));
      setLoadingPersonal(false);
    }).catch(() => setLoadingPersonal(false));
  }, [session, status]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <section className="animate-slide-up mb-10">
        <div className="mb-6">
          <h1 className="mb-1 text-2xl font-bold md:text-3xl">{greeting}</h1>
          <p className="text-muted-foreground">{t("mood")}</p>
        </div>
        <div className="max-w-xl">
          <SearchBar large />
        </div>
      </section>

      <HorizontalSection
        title={t("upNext")}
        icon={List}
        href="/watchlist"
        loading={loadingPersonal}
        empty={
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border/50 bg-card/30 p-6 transition-colors hover:border-primary/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary/50">
              <List className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-sm">{t("watchlistEmpty")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{t("watchlistEmptyHint")}</p>
            </div>
          </div>
        }
      >
        {watchlist.slice(0, 8).map((item) => (
          <div key={item.id} className="w-[140px] flex-shrink-0">
            <MediaCard tmdbId={item.tmdb_id} mediaType={item.media_type} title={item.title} posterPath={item.poster_path} />
          </div>
        ))}
      </HorizontalSection>

      {(loadingPersonal || recommendations.length > 0) && (
        <HorizontalSection title={t("recommendedForYou")} icon={Sparkles} href="/recommendations" loading={loadingPersonal}>
          {recommendations.map((item) => (
            <div key={item.id} className="w-[140px] flex-shrink-0">
              <MediaCard
                tmdbId={item.tmdb_id}
                mediaType={item.media_type}
                title={item.title}
                posterPath={item.poster_path}
                recommendedBy={item.from_user?.name ?? null}
              />
            </div>
          ))}
        </HorizontalSection>
      )}

      <HorizontalSection
        title={t("friendsAreWatching")}
        icon={Users}
        href="/feed"
        loading={loadingPersonal}
        empty={
          <div className="flex items-center gap-4 rounded-xl border border-dashed border-border/50 bg-card/30 p-6 transition-colors hover:border-primary/30">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary/50">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="font-medium text-sm">{t("noFriendActivity")}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                <Link href="/profile" className="text-primary hover:underline underline-offset-2">{t("addFriends")}</Link>{" "}
                {t("addFriendsHint")}
              </p>
            </div>
          </div>
        }
      >
        {friendsWatching.map((item) => (
          <div key={item.id} className="w-[140px] flex-shrink-0">
            <MediaCard tmdbId={item.tmdb_id} mediaType={item.media_type} title={item.title} posterPath={item.poster_path} rating={item.rating} />
          </div>
        ))}
      </HorizontalSection>

      {(loadingPersonal || recentlyWatched.length > 0) && (
        <HorizontalSection title={t("recentlyWatched")} icon={Eye} href="/watched" loading={loadingPersonal}>
          {recentlyWatched.map((item) => (
            <div key={item.id} className="w-[140px] flex-shrink-0">
              <MediaCard tmdbId={item.tmdb_id} mediaType={item.media_type} title={item.title} posterPath={item.poster_path} rating={item.rating} />
            </div>
          ))}
        </HorizontalSection>
      )}

      <HorizontalSection title={t("trendingThisWeek")} icon={TrendingUp} loading={loadingTrending}>
        {trending.map((item) => (
          <div key={`${item.media_type}-${item.id}`} className="w-[140px] flex-shrink-0">
            <MediaCard
              tmdbId={item.id}
              mediaType={getMediaType(item)}
              title={getTitle(item)}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              year={getYear(item)}
            />
          </div>
        ))}
      </HorizontalSection>

      <HorizontalSection title={t("popularMovies")} icon={Film} loading={loadingPopular}>
        {popularMovies.map((item) => (
          <div key={item.id} className="w-[140px] flex-shrink-0">
            <MediaCard
              tmdbId={item.id}
              mediaType="movie"
              title={getTitle(item)}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              year={getYear(item)}
            />
          </div>
        ))}
      </HorizontalSection>

      <HorizontalSection title={t("popularTVShows")} icon={Tv} loading={loadingPopular}>
        {popularTV.map((item) => (
          <div key={item.id} className="w-[140px] flex-shrink-0">
            <MediaCard
              tmdbId={item.id}
              mediaType="tv"
              title={getTitle(item)}
              posterPath={item.poster_path}
              voteAverage={item.vote_average}
              year={getYear(item)}
            />
          </div>
        ))}
      </HorizontalSection>

      {!loadingPersonal && watchlist.length === 0 && recentlyWatched.length === 0 && (
        <section className="mt-4 rounded-xl border border-primary/20 bg-primary/5 p-8 text-center">
          <Clapperboard className="mx-auto mb-3 h-10 w-10 text-primary" />
          <h3 className="mb-2 font-semibold">{t("allSetUp")}</h3>
          <p className="mb-4 text-sm text-muted-foreground">
            {t("allSetUpHint")}
          </p>
          <Link href="/profile">
            <Button variant="outline" className="gap-2">
              <Users className="h-4 w-4" />
              {t("addFriendsBtn")}
            </Button>
          </Link>
        </section>
      )}
    </div>
  );
}
