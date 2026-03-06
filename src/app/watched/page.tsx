"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { StarRating } from "@/components/star-rating";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { supabase } from "@/lib/supabase";
import { getWatched, removeFromWatched } from "@/lib/db";
import type { Database } from "@/types/database";

type WatchedItem = Database["public"]["Tables"]["watched"]["Row"];

export default function WatchedPage() {
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        const { data } = await getWatched(user.id);
        setItems(data || []);
      }
      setLoading(false);
    });
  }, []);

  async function handleRemove(id: string) {
    if (!userId) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    await removeFromWatched(userId, id);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse mb-8" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Eye className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">Sign in to see your watch history.</p>
          <Link href="/auth"><Button>Sign In</Button></Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Eye className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Watched</h1>
        <span className="text-sm text-muted-foreground">({items.length})</span>
      </div>

      {items.length > 0 ? (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="group flex gap-4 rounded-lg border border-border/50 bg-card p-4 transition-colors hover:border-primary/30"
            >
              <Link href={`/${item.media_type}/${item.tmdb_id}`} className="flex-shrink-0">
                <Image
                  src={posterUrl(item.poster_path, "w200")}
                  alt={item.title}
                  width={80}
                  height={120}
                  className="rounded-md"
                />
              </Link>
              <div className="flex flex-1 flex-col gap-2">
                <div className="flex items-start justify-between">
                  <Link href={`/${item.media_type}/${item.tmdb_id}`}>
                    <h3 className="font-semibold hover:text-primary">{item.title}</h3>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground opacity-100 md:opacity-0 transition-opacity hover:text-destructive md:group-hover:opacity-100"
                    onClick={() => handleRemove(item.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {item.rating && <StarRating value={item.rating} readonly size="sm" />}
                {item.note && <p className="text-sm text-muted-foreground">{item.note}</p>}
                <p className="text-xs text-muted-foreground">
                  Watched {new Date(item.watched_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Eye className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">You haven&apos;t watched anything yet.</p>
          <div className="mt-4 w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      )}
    </div>
  );
}
