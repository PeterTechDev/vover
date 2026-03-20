"use client";

import { useState, useEffect } from "react";
import { MediaCard } from "@/components/media-card";
import { RecommendationsInbox } from "@/components/recommendations-inbox";
import { List, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { supabase } from "@/lib/supabase";
import { getWatchlistWithRecommender, removeFromWatchlist, getRecommendationsForUser, getWatched } from "@/lib/db";
import Link from "next/link";

interface WatchlistItemWithRecommender {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  added_at: string;
  recommended_by: string | null;
  recommender: { id: string; name: string | null } | null;
}

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItemWithRecommender[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [watchlistKeys, setWatchlistKeys] = useState<Set<string>>(new Set());
  const [watchedKeys, setWatchedKeys] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);

        const [watchlistRes, recsRes, watchedRes] = await Promise.all([
          getWatchlistWithRecommender(user.id),
          getRecommendationsForUser(user.id),
          getWatched(user.id),
        ]);

        const watchlistData = (watchlistRes.data || []) as WatchlistItemWithRecommender[];
        setItems(watchlistData);
        setRecommendations(recsRes.data || []);

        // Build sets of tmdbId-mediaType keys for quick lookup
        const wlKeys = new Set(watchlistData.map((i) => `${i.tmdb_id}-${i.media_type}`));
        setWatchlistKeys(wlKeys);

        const wKeys = new Set((watchedRes.data || []).map((i) => `${i.tmdb_id}-${i.media_type}`));
        setWatchedKeys(wKeys);
      }
      setLoading(false);
    });
  }, []);

  async function handleRemove(id: string) {
    if (!userId) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    await removeFromWatchlist(userId, id);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-8 w-48 rounded animate-shimmer mb-8" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <List className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Sign in to see your watchlist.</p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Recommendations preview — max 3, link to full page */}
      <RecommendationsInbox
        recommendations={recommendations}
        userId={userId}
        watchlistTmdbIds={watchlistKeys}
        watchedTmdbIds={watchedKeys}
        maxItems={3}
      />

      {/* User's Watchlist */}
      <div className="mb-8 flex items-center gap-2">
        <List className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Watchlist</h1>
        <span className="text-sm text-muted-foreground">({items.length})</span>
      </div>

      {items.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.id} className="group relative" onTouchStart={() => {}}>
              <MediaCard
                tmdbId={item.tmdb_id}
                mediaType={item.media_type}
                title={item.title}
                posterPath={item.poster_path}
                recommendedBy={item.recommender?.name}
              />
              <Button
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 z-10 h-8 w-8 opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100 focus:opacity-100"
                aria-label={`Remove ${item.title} from watchlist`}
                onClick={(e) => {
                  e.preventDefault();
                  handleRemove(item.id);
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/8 border border-primary/15">
            <List className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-semibold text-muted-foreground">Your watchlist is empty</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Search for movies and shows to add them</p>
          </div>
          <div className="mt-2 w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      )}
    </div>
  );
}
