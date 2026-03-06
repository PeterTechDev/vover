"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecommendationsInbox } from "@/components/recommendations-inbox";
import { Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { getRecommendationsForUser, getWatchlist, getWatched } from "@/lib/db";

export default function RecommendationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [watchlistKeys, setWatchlistKeys] = useState<Set<string>>(new Set());
  const [watchedKeys, setWatchedKeys] = useState<Set<string>>(new Set());
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace("/auth");
        return;
      }

      setUserId(user.id);

      const [recsRes, watchlistRes, watchedRes] = await Promise.all([
        getRecommendationsForUser(user.id),
        getWatchlist(user.id),
        getWatched(user.id),
      ]);

      setRecommendations(recsRes.data || []);

      const wlKeys = new Set(
        (watchlistRes.data || []).map((i) => `${i.tmdb_id}-${i.media_type}`)
      );
      setWatchlistKeys(wlKeys);

      const wKeys = new Set(
        (watchedRes.data || []).map((i) => `${i.tmdb_id}-${i.media_type}`)
      );
      setWatchedKeys(wKeys);

      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!userId) return null;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-6 flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Recommendations</h1>
      </div>
      <RecommendationsInbox
        recommendations={recommendations}
        userId={userId}
        watchlistTmdbIds={watchlistKeys}
        watchedTmdbIds={watchedKeys}
        showAll
      />
    </div>
  );
}
