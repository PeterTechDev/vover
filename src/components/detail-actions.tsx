"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
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
  const [recommendNote, setRecommendNote] = useState("");
  const [recommendSent, setRecommendSent] = useState(false);
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        // Check if already in watchlist
        isInWatchlist(user.id, tmdbId, mediaType).then(setAddedToWatchlist);
        // Load real friends
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

  async function handleRecommend() {
    if (!userId || !selectedFriendId) return;
    setLoading(true);

    const { error } = await supabase
      .from("recommendations")
      .insert({
        from_user_id: userId,
        to_user_id: selectedFriendId,
        tmdb_id: tmdbId,
        media_type: mediaType,
        title,
        poster_path: posterPath,
        note: recommendNote || null,
      });

    if (!error) {
      setRecommendSent(true);
      setRecommendNote("");
      const friendName = friends.find((f) => f.id === selectedFriendId)?.name || "friend";
      toast.success(`Recommendation sent to ${friendName}!`);
    } else {
      toast.error("Failed to send recommendation");
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
      <Button
        variant={addedToWatchlist ? "secondary" : "default"}
        onClick={handleAddToWatchlist}
        disabled={addedToWatchlist || loading}
        className="gap-2"
      >
        {addedToWatchlist ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {addedToWatchlist ? "Added to Watchlist" : "Add to Watchlist"}
      </Button>

      <Dialog open={watchedDialogOpen} onOpenChange={setWatchedDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="secondary" className="gap-2" disabled={markedWatched} onClick={() => setWatchedDialogOpen(true)}>
            {markedWatched ? <Check className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {markedWatched ? "Marked Watched" : "Mark as Watched"}
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

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Send className="h-4 w-4" />
            Recommend to Friend
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Recommend {title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            {recommendSent ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <Check className="h-8 w-8 text-primary" />
                <p className="text-sm text-muted-foreground">Recommendation sent!</p>
              </div>
            ) : friends.length > 0 ? (
              <>
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Pick a friend:</p>
                  <div className="flex flex-col gap-2">
                    {friends.map((friend) => (
                      <Button
                        key={friend.id}
                        variant={selectedFriendId === friend.id ? "default" : "outline"}
                        size="sm"
                        className="justify-start"
                        onClick={() => setSelectedFriendId(friend.id)}
                      >
                        {selectedFriendId === friend.id && <Check className="mr-2 h-3.5 w-3.5" />}
                        {friend.name}
                      </Button>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-sm text-muted-foreground">Why should they watch it?</p>
                  <Textarea
                    placeholder="You'll love this because..."
                    value={recommendNote}
                    onChange={(e) => setRecommendNote(e.target.value)}
                    rows={3}
                  />
                </div>
                <Button onClick={handleRecommend} className="w-full gap-2" disabled={!selectedFriendId || loading}>
                  <Send className="h-4 w-4" />
                  {loading ? "Sending..." : "Send Recommendation"}
                </Button>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4 text-center">
                <p className="text-sm text-muted-foreground">No friends yet. Add friends from your profile to recommend titles.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
