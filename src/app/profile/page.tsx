"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProfile, getFriends, getWatchlist, getWatched } from "@/lib/db";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Users, List, Eye, Star, UserPlus, Mail, LogOut } from "lucide-react";
import { toast } from "sonner";

interface Friend {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [userCreatedAt, setUserCreatedAt] = useState<string>("");
  const [friends, setFriends] = useState<Friend[]>([]);
  const [watchlistCount, setWatchlistCount] = useState(0);
  const [watchedCount, setWatchedCount] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  const [friendEmail, setFriendEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      // Load profile
      const { data: profile } = await getProfile(user.id);
      setUserName(profile?.name || user.email?.split("@")[0] || "User");
      setUserCreatedAt(profile?.created_at || user.created_at || "");

      // Load stats
      const { data: watchlist } = await getWatchlist(user.id);
      setWatchlistCount(watchlist?.length || 0);

      const { data: watched } = await getWatched(user.id);
      setWatchedCount(watched?.length || 0);
      const rated = (watched || []).filter((w) => w.rating != null);
      const avg = rated.length
        ? rated.reduce((sum, w) => sum + (w.rating || 0), 0) / rated.length
        : 0;
      setAvgRating(avg);

      // Load friends
      const { data: friendships } = await getFriends(user.id);
      if (friendships) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const friendList: Friend[] = friendships.map((f: Record<string, any>) => {
          const friend = f.requester_id === user.id ? f.addressee : f.requester;
          return {
            id: friend?.id || "",
            name: friend?.name || "Unknown",
            avatar_url: friend?.avatar_url || null,
          };
        });
        setFriends(friendList);
      }

      setLoading(false);
    });
  }, [router]);

  async function handleSendInvite() {
    if (!friendEmail.trim() || !userId) return;
    setSendingInvite(true);

    // Look up user by name (search profiles)
    const { data: profiles, error: searchError } = await supabase
      .from("profiles")
      .select("id, name")
      .ilike("name", `%${friendEmail.trim()}%`)
      .limit(1);

    if (searchError || !profiles?.length) {
      toast.error("User not found. Try searching by their display name.");
      setSendingInvite(false);
      return;
    }

    const targetId = profiles[0].id;
    if (targetId === userId) {
      toast.error("You can't add yourself as a friend.");
      setSendingInvite(false);
      return;
    }

    // Check for existing friendship
    const { data: existing } = await supabase
      .from("friendships")
      .select("id")
      .or(
        `and(requester_id.eq.${userId},addressee_id.eq.${targetId}),and(requester_id.eq.${targetId},addressee_id.eq.${userId})`
      )
      .maybeSingle();

    if (existing) {
      toast.info("Friend request already exists.");
      setSendingInvite(false);
      return;
    }

    const { error } = await supabase
      .from("friendships")
      .insert({ requester_id: userId, addressee_id: targetId });

    if (error) {
      toast.error("Failed to send friend request.");
    } else {
      toast.success("Friend request sent!");
      setFriendEmail("");
    }
    setSendingInvite(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/auth");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 pb-8">
          <div className="h-20 w-20 rounded-full bg-secondary/50 animate-pulse" />
          <div className="h-8 w-32 bg-secondary/50 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <section className="flex flex-col items-center gap-4 pb-8 text-center">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="bg-primary/10 text-primary text-2xl">
            {userName?.charAt(0) || "?"}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{userName}</h1>
          {userCreatedAt && (
            <p className="text-sm text-muted-foreground">
              Member since {new Date(userCreatedAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={handleSignOut} className="gap-2 text-muted-foreground">
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </section>

      <div className="grid grid-cols-3 gap-4 pb-8">
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-card p-4">
          <List className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{watchlistCount}</span>
          <span className="text-xs text-muted-foreground">Watchlist</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-card p-4">
          <Eye className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{watchedCount}</span>
          <span className="text-xs text-muted-foreground">Watched</span>
        </div>
        <div className="flex flex-col items-center gap-2 rounded-lg border border-border/50 bg-card p-4">
          <Star className="h-5 w-5 text-primary" />
          <span className="text-2xl font-bold">{avgRating.toFixed(1)}</span>
          <span className="text-xs text-muted-foreground">Avg Rating</span>
        </div>
      </div>

      <Separator className="mb-8" />

      <section>
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Friends</h2>
            <span className="text-sm text-muted-foreground">({friends.length})</span>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Friend
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add a Friend</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  Search by display name
                </div>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Friend's name"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSendInvite()}
                  />
                  <Button onClick={handleSendInvite} disabled={sendingInvite}>
                    {sendingInvite ? "..." : "Send"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {friends.length > 0 ? (
          <div className="flex flex-col gap-3">
            {friends.map((friend) => (
              <div
                key={friend.id}
                className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {friend.name?.charAt(0) || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium">{friend.name}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Users className="h-8 w-8 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No friends yet. Add someone!</p>
          </div>
        )}
      </section>
    </div>
  );
}
