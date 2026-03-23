"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { RecommendationsInbox } from "@/components/recommendations-inbox";
import { Sparkles } from "lucide-react";
import { useSession } from "next-auth/react";
import { getRecommendationsForUser, getWatchlist, getWatched } from "@/lib/db-client";

export default function RecommendationsPage() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [watchlistKeys, setWatchlistKeys] = useState<Set<string>>(new Set());
  const [watchedKeys, setWatchedKeys] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) { router.replace("/auth"); return; }

    Promise.all([
      getRecommendationsForUser(userId),
      getWatchlist(userId),
      getWatched(userId),
    ]).then(([recsRes, watchlistRes, watchedRes]) => {
      setRecommendations(recsRes.data || []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wlKeys = new Set(((watchlistRes.data || []) as any[]).map((i) => `${i.tmdb_id}-${i.media_type}`));
      setWatchlistKeys(wlKeys);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const wKeys = new Set(((watchedRes.data || []) as any[]).map((i) => `${i.tmdb_id}-${i.media_type}`));
      setWatchedKeys(wKeys);
    }).finally(() => setLoading(false));
  }, [userId, status, router]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="h-8 w-48 rounded animate-shimmer mb-8" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-44 rounded-xl animate-shimmer" />
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
