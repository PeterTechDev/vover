"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { RecommendModal } from "@/components/recommend-modal";
import { Plus, Eye, Send, Check, LogIn } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { addToWatchlist, markWatched, isInWatchlist, getFriends } from "@/lib/db";
import { toast } from "sonner";

interface Friend {
  id: string;
  name: string | null;
}

interface DetailActionsProps {
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

export function DetailActions({ tmdbId, mediaType, title, posterPath }: DetailActionsProps) {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [addedToWatchlist, setAddedToWatchlist] = useState(false);
  const [markedWatched, setMarkedWatched] = useState(false);
  const [watchedRating, setWatchedRating] = useState(0);
  const [watchedNote, setWatchedNote] = useState("");
  const [watchedDialogOpen, setWatchedDialogOpen] = useState(false);
  const [recommendOpen, setRecommendOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        isInWatchlist(user.id, tmdbId, mediaType).then(setAddedToWatchlist);
        const { data: friendships } = await getFriends(user.id);
        if (friendships) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const friendList: Friend[] = friendships.map((f: Record<string, any>) => {
            const friend = f.requester_id === user.id ? f.addressee : f.requester;
            return { id: friend?.id || "", name: friend?.name || "Unknown" };
          });
          setFriends(friendList);
        }
      }
    });
  }, [tmdbId, mediaType]);

  function requireAuth() {
    router.push("/auth");
  }

  async function handleAddToWatchlist() {
    if (!userId) return requireAuth();
    setLoading(true);
    const { error } = await addToWatchlist(userId, { tmdb_id: tmdbId, media_type: mediaType, title, poster_path: posterPath });
    if (!error) {
      setAddedToWatchlist(true);
      toast.success(`${title} added to watchlist`);
    } else {
      toast.error("Failed to add to watchlist");
    }
    setLoading(false);
  }

  async function handleMarkWatched() {
    if (!userId) return requireAuth();
    setLoading(true);
    const { error } = await markWatched(userId, {
      tmdb_id: tmdbId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
      rating: watchedRating || null,
      note: watchedNote || null,
    });
    if (!error) {
      setMarkedWatched(true);
      setWatchedDialogOpen(false);
      toast.success(`${title} marked as watched`);
    } else {
      toast.error("Failed to mark as watched");
    }
    setLoading(false);
  }

  if (!userId) {
    return (
      <div className="flex items-center gap-3 pt-2">
        <Button variant="default" onClick={requireAuth} className="gap-2">
          <LogIn className="h-4 w-4" />
          Sign in to track this
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {/* Add to Watchlist */}
      <Button
        variant={addedToWatchlist ? "secondary" : "default"}
        onClick={handleAddToWatchlist}
        disabled={addedToWatchlist || loading}
        className="gap-2"
      >
        {addedToWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {addedToWatchlist ? "In Watchlist" : "Add to Watchlist"}
      </Button>

      {/* Mark as Watched */}
      <Dialog open={watchedDialogOpen} onOpenChange={setWatchedDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="gap-2" disabled={markedWatched}>
            {markedWatched ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {markedWatched ? "Watched" : "Mark as Watched"}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rate &amp; Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">How would you rate {title}?</p>
              <StarRating value={watchedRating} onChange={setWatchedRating} size="lg" />
            </div>
            <div>
              <p className="mb-2 text-sm text-muted-foreground">Add a note (optional)</p>
              <Textarea
                placeholder="What did you think?"
                value={watchedNote}
                onChange={(e) => setWatchedNote(e.target.value)}
                rows={3}
              />
            </div>
            <Button onClick={handleMarkWatched} className="w-full" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Recommend — one-tap modal */}
      <Button
        variant="outline"
        className="gap-2"
        onClick={() => {
          if (!userId) return requireAuth();
          setRecommendOpen(true);
        }}
      >
        <Send className="h-4 w-4" />
        Recommend
      </Button>

      <RecommendModal
        open={recommendOpen}
        onOpenChange={setRecommendOpen}
        tmdbId={tmdbId}
        mediaType={mediaType}
        title={title}
        posterPath={posterPath}
        friends={friends}
        userId={userId}
      />
    </div>
  );
}
