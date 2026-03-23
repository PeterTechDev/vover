"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { posterUrl } from "@/lib/tmdb";
import { useSession } from "next-auth/react";
import { getEnhancedFriendActivity } from "@/lib/db-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Rss, Eye, Send, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityItem {
  id: string;
  type: "watched" | "recommended";
  timestamp: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  rating?: number | null;
  note?: string | null;
  actor: { id: string; name: string | null; avatar_url: string | null } | null;
  recipient?: { id: string; name: string | null; avatar_url: string | null } | null;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function StarDisplay({ rating }: { rating: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={
            i < rating
              ? "h-3 w-3 fill-yellow-400 text-yellow-400"
              : "h-3 w-3 text-muted-foreground/30"
          }
        />
      ))}
    </span>
  );
}

function ActivityCard({ item }: { item: ActivityItem }) {
  const actorName = item.actor?.name || "Someone";
  const recipientName = item.recipient?.name || "a friend";

  return (
    <div className="flex gap-4 rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-black/20 hover:-translate-y-px">
      {/* Avatar */}
      <Avatar className="h-9 w-9 shrink-0 mt-0.5">
        <AvatarFallback
          className={
            item.type === "recommended"
              ? "bg-blue-500/10 text-blue-400 text-sm"
              : "bg-primary/10 text-primary text-sm"
          }
        >
          {actorName.charAt(0)}
        </AvatarFallback>
      </Avatar>

      <div className="flex flex-1 flex-col gap-2 min-w-0">
        {/* Activity headline */}
        <div className="flex flex-wrap items-baseline gap-1 text-sm leading-snug">
          <span className="font-semibold">{actorName}</span>

          {item.type === "watched" ? (
            <>
              <span className="text-muted-foreground">watched</span>
              <Link
                href={`/${item.media_type}/${item.tmdb_id}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
              {item.rating != null && item.rating > 0 && (
                <span className="inline-flex items-center gap-1">
                  <span className="text-muted-foreground">and rated it</span>
                  <StarDisplay rating={item.rating} />
                </span>
              )}
            </>
          ) : (
            <>
              <span className="text-muted-foreground">recommended</span>
              <Link
                href={`/${item.media_type}/${item.tmdb_id}`}
                className="font-medium hover:text-primary transition-colors"
              >
                {item.title}
              </Link>
              <span className="text-muted-foreground">to</span>
              <span className="font-semibold">{recipientName}</span>
            </>
          )}
        </div>

        {/* Note */}
        {item.note && (
          <p className="text-sm text-muted-foreground italic leading-relaxed border-l-2 border-border pl-3">
            &ldquo;{item.note}&rdquo;
          </p>
        )}

        {/* Footer row */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/60">
            {item.type === "watched" ? (
              <Eye className="h-3 w-3" />
            ) : (
              <Send className="h-3 w-3" />
            )}
            <span>{timeAgo(item.timestamp)}</span>
          </div>
          <Badge variant="outline" className="h-5 px-1.5 text-[10px]">
            {item.media_type === "movie" ? "Movie" : "TV"}
          </Badge>
        </div>
      </div>

      {/* Poster thumbnail */}
      <Link
        href={`/${item.media_type}/${item.tmdb_id}`}
        className="shrink-0 hidden sm:block"
      >
        <div className="relative h-16 w-11 overflow-hidden rounded-md border border-border/50 bg-secondary/30 transition-opacity hover:opacity-80">
          {item.poster_path && (
            <Image
              src={posterUrl(item.poster_path)}
              alt={item.title}
              fill
              className="object-cover"
              sizes="44px"
            />
          )}
        </div>
      </Link>
    </div>
  );
}

export default function FeedPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const [feed, setFeed] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) { router.push("/auth"); return; }
    getEnhancedFriendActivity(userId).then(({ data }) => {
      setFeed((data as ActivityItem[]) || []);
    }).finally(() => setLoading(false));
  }, [userId, status, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-8 w-40 rounded animate-shimmer mb-8" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 rounded-xl animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Header */}
      <div className="animate-slide-up mb-8 flex items-center gap-2">
        <Rss className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Friend Activity</h1>
      </div>

      {feed.length === 0 ? (
        <div className="animate-fade-in flex flex-col items-center gap-5 py-20 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/8 border border-primary/15">
            <Users className="h-9 w-9 text-primary/40" />
          </div>
          <div>
            <p className="text-lg font-semibold">No activity yet</p>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-xs">
              Add friends to see what they&apos;re watching and get personalized picks
            </p>
          </div>
          <Button size="sm" asChild>
            <Link href="/profile">Find friends</Link>
          </Button>
        </div>
      ) : (
        <div className="animate-stagger flex flex-col gap-3">
          {feed.map((item) => (
            <ActivityCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
