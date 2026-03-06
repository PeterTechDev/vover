"use client";

import { useState, useEffect } from "react";
import { MediaCard } from "@/components/media-card";
import { List, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { supabase } from "@/lib/supabase";
import { getWatchlist, removeFromWatchlist } from "@/lib/db";
import type { Database } from "@/types/database";
import Link from "next/link";

type WatchlistItem = Database["public"]["Tables"]["watchlist"]["Row"];

export default function WatchlistPage() {
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        const { data } = await getWatchlist(user.id);
        setItems(data || []);
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
        <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary/50 animate-pulse" />
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
          <List className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Your watchlist is empty.</p>
          <p className="text-sm text-muted-foreground">Search for movies and shows to add them.</p>
          <div className="mt-4 w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      )}
    </div>
  );
}
