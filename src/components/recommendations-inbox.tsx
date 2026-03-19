"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/star-rating";
import { Plus, Eye, Check, Inbox, Users, Loader2, X, Sparkles } from "lucide-react";
import { addToWatchlist, markWatched } from "@/lib/db";
import { toast } from "sonner";

interface RecommendationFromUser {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface Recommendation {
  id: string;
  from_user_id: string;
  to_user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  note: string | null;
  created_at: string;
  from_user: RecommendationFromUser | null;
}

interface RecommendationsInboxProps {
  recommendations: Recommendation[];
  userId: string;
  watchlistTmdbIds: Set<string>;
  watchedTmdbIds: Set<string>;
  maxItems?: number;
  showAll?: boolean;
}

export function RecommendationsInbox({
  recommendations,
  userId,
  watchlistTmdbIds: initialWatchlistIds,
  watchedTmdbIds: initialWatchedIds,
  maxItems,
  showAll,
}: RecommendationsInboxProps) {
  const [watchlistIds, setWatchlistIds] = useState(initialWatchlistIds);
  const [watchedIds, setWatchedIds] = useState(initialWatchedIds);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [ratingFor, setRatingFor] = useState<string | null>(null);
  const [ratingValue, setRatingValue] = useState(0);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const visibleRecs = recommendations.filter((r) => !dismissedIds.has(r.id));
  const displayRecs = maxItems && !showAll ? visibleRecs.slice(0, maxItems) : visibleRecs;
  const hasMore = maxItems && !showAll && visibleRecs.length > maxItems;

  if (recommendations.length === 0) {
    if (showAll) {
      return (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border/60 py-12 text-center">
          <Users className="h-10 w-10 text-muted-foreground/40" />
          <p className="text-muted-foreground">No recommendations yet</p>
          <p className="text-sm text-muted-foreground/70">Share the app with friends to get personalized picks</p>
        </div>
      );
    }
    return null;
  }

  if (visibleRecs.length === 0) {
    return null;
  }

  const key = (tmdbId: number, mediaType: string) => `${tmdbId}-${mediaType}`;

  function handleDismiss(rec: Recommendation) {
    setDismissedIds((prev) => new Set(prev).add(rec.id));
    toast.success("Recommendation dismissed");
  }

  async function handleAddToWatchlist(rec: Recommendation) {
    const k = key(rec.tmdb_id, rec.media_type);
    setLoadingAction(`add-${rec.id}`);
    const { error } = await addToWatchlist(userId, {
      tmdb_id: rec.tmdb_id,
      media_type: rec.media_type,
      title: rec.title,
      poster_path: rec.poster_path,
      recommended_by: rec.from_user_id,
    });
    if (!error) {
      setWatchlistIds((prev) => new Set(prev).add(k));
      const name = rec.from_user?.name || "a friend";
      toast.success(`Added to watchlist · Recommended by ${name}`);
    } else {
      toast.error("Failed to add to watchlist");
    }
    setLoadingAction(null);
  }

  async function handleMarkWatched(rec: Recommendation, rating: number | null) {
    const k = key(rec.tmdb_id, rec.media_type);
    setLoadingAction(`watched-${rec.id}`);
    const { error } = await markWatched(userId, {
      tmdb_id: rec.tmdb_id,
      media_type: rec.media_type,
      title: rec.title,
      poster_path: rec.poster_path,
      rating: rating || null,
    });
    if (!error) {
      setWatchedIds((prev) => new Set(prev).add(k));
      setRatingFor(null);
      setRatingValue(0);
      toast.success("Marked as watched");
    } else {
      toast.error("Failed to mark as watched");
    }
    setLoadingAction(null);
  }

  return (
    <div className={showAll ? "" : "mb-10"}>
      {!showAll && (
        <div className="mb-6 flex items-center gap-2">
          <Inbox className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold">Recommended for You</h2>
          <span className="text-sm text-muted-foreground">({visibleRecs.length})</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {displayRecs.map((rec) => {
          const k = key(rec.tmdb_id, rec.media_type);
          const inWatchlist = watchlistIds.has(k);
          const isWatched = watchedIds.has(k);
          const isRating = ratingFor === rec.id;

          return (
            <div
              key={rec.id}
              className="group relative flex gap-3 rounded-xl border border-border/50 bg-card p-3 transition-all hover:border-primary/30"
            >
              {/* Dismiss button */}
              <button
                onClick={() => handleDismiss(rec)}
                className="absolute right-2 top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label={`Dismiss recommendation for ${rec.title}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>

              {/* Poster */}
              <Link
                href={`/${rec.media_type}/${rec.tmdb_id}`}
                className="relative h-36 w-24 flex-shrink-0 overflow-hidden rounded-lg"
              >
                <Image
                  src={posterUrl(rec.poster_path)}
                  alt={rec.title}
                  fill
                  className="object-cover"
                  sizes="96px"
                />
                <Badge className="absolute left-1 top-1 bg-background/80 text-[10px] backdrop-blur-sm px-1 py-0">
                  {rec.media_type === "movie" ? "Movie" : "TV"}
                </Badge>
              </Link>

              {/* Info */}
              <div className="flex min-w-0 flex-1 flex-col justify-between pr-5">
                <div>
                  <Link href={`/${rec.media_type}/${rec.tmdb_id}`}>
                    <h3 className="line-clamp-2 text-sm font-semibold leading-tight hover:text-primary transition-colors">
                      {rec.title}
                    </h3>
                  </Link>

                  <p className="mt-1 text-xs font-medium text-primary/80">
                    {rec.from_user?.name || "A friend"} recommended this
                  </p>

                  {rec.note && (
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground italic">
                      &ldquo;{rec.note}&rdquo;
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-2 flex flex-col gap-1.5">
                  {isRating ? (
                    <div className="flex flex-wrap items-center gap-2">
                      <StarRating value={ratingValue} onChange={setRatingValue} size="sm" />
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs"
                        onClick={() => handleMarkWatched(rec, ratingValue)}
                        disabled={loadingAction === `watched-${rec.id}`}
                      >
                        {loadingAction === `watched-${rec.id}` && (
                          <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                        )}
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-2 text-xs text-muted-foreground"
                        onClick={() => handleMarkWatched(rec, null)}
                        disabled={loadingAction === `watched-${rec.id}`}
                      >
                        Rate later
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      {inWatchlist ? (
                        <Button size="sm" variant="secondary" className="h-7 gap-1 text-xs" disabled>
                          <Check className="h-3 w-3" /> In your watchlist
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="default"
                          className="h-7 gap-1 text-xs"
                          onClick={() => handleAddToWatchlist(rec)}
                          disabled={loadingAction === `add-${rec.id}` || isWatched}
                        >
                          {loadingAction === `add-${rec.id}` ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <Plus className="h-3 w-3" />
                          )}
                          Watchlist
                        </Button>
                      )}

                      {isWatched ? (
                        <Button size="sm" variant="secondary" className="h-7 gap-1 text-xs" disabled>
                          <Check className="h-3 w-3" /> Watched
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={() => {
                            setRatingFor(rec.id);
                            setRatingValue(0);
                          }}
                          disabled={!!loadingAction}
                        >
                          <Eye className="h-3 w-3" /> Watched
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hasMore && (
        <div className="mt-4 text-center">
          <Link href="/recommendations">
            <Button variant="outline" size="sm" className="gap-2">
              <Sparkles className="h-4 w-4" />
              See all recommendations →
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
