"use client";

import { useState, useEffect } from "react";
import { FadeIn } from "@/components/motion";
import Image from "next/image";
import Link from "next/link";
import { posterUrl } from "@/lib/tmdb";
import { StarRating } from "@/components/star-rating";
import { Eye, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SearchBar } from "@/components/search-bar";
import { useSession } from "next-auth/react";
import { getWatched, removeFromWatched } from "@/lib/db-client";

interface WatchedItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  rating: number | null;
  note: string | null;
  watched_at: string;
}

export default function WatchedPage() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const [items, setItems] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) { setLoading(false); return; }
    getWatched(userId).then(({ data }) => {
      setItems((data || []) as WatchedItem[]);
    }).finally(() => setLoading(false));
  }, [userId, status]);

  async function handleRemove(id: string) {
    if (!userId) return;
    setItems((prev) => prev.filter((item) => item.id !== id));
    await removeFromWatched(userId, id);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-8 w-48 rounded animate-shimmer mb-8" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg animate-shimmer" />
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
    <FadeIn>
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
              className="group flex gap-4 rounded-lg border border-border/50 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-black/20"
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
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/8 border border-primary/15">
            <Eye className="h-8 w-8 text-primary/40" />
          </div>
          <div>
            <p className="font-semibold text-muted-foreground">Nothing watched yet</p>
            <p className="text-sm text-muted-foreground/70 mt-1">Mark movies and shows as watched to track your history</p>
          </div>
          <div className="mt-2 w-full max-w-md">
            <SearchBar />
          </div>
        </div>
      )}
    </div>
    </FadeIn>
  );
}
