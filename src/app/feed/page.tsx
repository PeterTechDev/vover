"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { posterUrl } from "@/lib/tmdb";
import { StarRating } from "@/components/star-rating";
import { supabase } from "@/lib/supabase";
import { getFriendActivity } from "@/lib/db";
import { Rss, Eye, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface FeedEntry {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  rating: number | null;
  note: string | null;
  watched_at: string;
  user: { id: string; name: string | null; avatar_url: string | null } | null;
}

function timeAgo(date: string) {
  const diff = Date.now() - new Date(date).getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function FeedPage() {
  const router = useRouter();
  const [feed, setFeed] = useState<FeedEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [signedIn, setSignedIn] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setSignedIn(false);
        setLoading(false);
        return;
      }
      const { data } = await getFriendActivity(user.id);
      setFeed((data as FeedEntry[]) || []);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!signedIn) {
      router.push("/auth");
    }
  }, [signedIn, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse mb-8" />
        <div className="flex flex-col gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Rss className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Friend Activity</h1>
      </div>

      {feed.length > 0 ? (
        <div className="flex flex-col gap-4">
          {feed.map((item) => {
            const userName = item.user?.name || "Unknown";
            return (
              <div
                key={item.id}
                className="flex gap-4 rounded-lg border border-border/50 bg-card p-4"
              >
                <Avatar className="h-10 w-10 flex-shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {userName.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">{userName}</span>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      <span>watched</span>
                    </div>
                  </div>

                  <Link
                    href={`/${item.media_type}/${item.tmdb_id}`}
                    className="flex gap-3 rounded-md border border-border/30 bg-secondary/30 p-3 transition-colors hover:border-primary/30"
                  >
                    <Image
                      src={posterUrl(item.poster_path, "w200")}
                      alt={item.title}
                      width={48}
                      height={72}
                      className="rounded-sm"
                    />
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-sm">{item.title}</span>
                      {item.rating != null && (
                        <StarRating value={item.rating} readonly size="sm" />
                      )}
                      {item.note && (
                        <p className="text-xs text-muted-foreground line-clamp-2">{item.note}</p>
                      )}
                    </div>
                  </Link>

                  <span className="text-xs text-muted-foreground">{timeAgo(item.watched_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Rss className="h-12 w-12 text-muted-foreground/50" />
          <p className="text-muted-foreground">No activity yet.</p>
          <p className="text-sm text-muted-foreground">Add friends to see what they&apos;re watching.</p>
          <Link href="/profile">
            <Button variant="default" className="mt-2 gap-2">
              <Users className="h-4 w-4" />
              Add Friends
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
