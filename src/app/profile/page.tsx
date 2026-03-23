"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { getProfile, getFriends, getWatchlist, getWatched, sendFriendRequest } from "@/lib/db-client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { Users, List, Eye, Star, UserPlus, Mail, LogOut, BarChart2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { InviteFriends } from "@/components/invite-friends";

interface Friend {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

export default function ProfilePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
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
    if (status === "loading") return;
    if (!userId) { router.push("/auth"); return; }

    Promise.all([
      getProfile(userId),
      getWatchlist(userId),
      getWatched(userId),
      getFriends(userId),
    ]).then(([profileRes, watchlistRes, watchedRes, friendsRes]) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const profile = profileRes.data as any;
      setUserName(profile?.name || session?.user?.email?.split("@")[0] || "User");
      setUserCreatedAt(profile?.created_at || "");

      setWatchlistCount((watchlistRes.data || []).length);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const watchedData = (watchedRes.data || []) as any[];
      setWatchedCount(watchedData.length);
      const rated = watchedData.filter((w) => w.rating != null);
      const avg = rated.length
        ? rated.reduce((sum: number, w: { rating: number }) => sum + (w.rating || 0), 0) / rated.length
        : 0;
      setAvgRating(avg);

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const friendships = (friendsRes.data || []) as any[];
      const friendList: Friend[] = friendships.map((f) => {
        const friend = f.requester_id === userId ? f.addressee : f.requester;
        return { id: friend?.id || "", name: friend?.name || "Unknown", avatar_url: friend?.avatar_url || null };
      });
      setFriends(friendList);
    }).finally(() => setLoading(false));
  }, [userId, status, router, session]);

  async function handleSendInvite() {
    if (!friendEmail.trim() || !userId) return;
    setSendingInvite(true);
    try {
      const { error } = await sendFriendRequest(userId, friendEmail.trim());
      if (error) {
        toast.error("User not found or request already exists.");
      } else {
        toast.success("Friend request sent!");
        setFriendEmail("");
      }
    } catch {
      toast.error("Failed to send friend request.");
    }
    setSendingInvite(false);
  }

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/");
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-col items-center gap-4 pb-8">
          <div className="h-20 w-20 rounded-full animate-shimmer" />
          <div className="h-8 w-32 rounded animate-shimmer" />
          <div className="h-4 w-24 rounded animate-shimmer" />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pb-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-24 rounded-lg animate-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in mx-auto max-w-3xl px-4 py-8">
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
        {userId && (
          <div className="w-full max-w-xs">
            <InviteFriends />
          </div>
        )}
      </section>

      <div className="animate-stagger grid grid-cols-3 gap-2 sm:gap-4 pb-8">
        <div className="flex flex-col items-center gap-1 sm:gap-2 rounded-lg border border-border/50 bg-card p-3 sm:p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-black/20">
          <List className="h-5 w-5 text-primary" />
          <span className="text-xl sm:text-2xl font-bold tabular-nums">{watchlistCount}</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground">Watchlist</span>
        </div>
        <div className="flex flex-col items-center gap-1 sm:gap-2 rounded-lg border border-border/50 bg-card p-3 sm:p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-black/20">
          <Eye className="h-5 w-5 text-primary" />
          <span className="text-xl sm:text-2xl font-bold tabular-nums">{watchedCount}</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground">Watched</span>
        </div>
        <div className="flex flex-col items-center gap-1 sm:gap-2 rounded-lg border border-border/50 bg-card p-3 sm:p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-black/20">
          <Star className="h-5 w-5 text-primary" />
          <span className="text-xl sm:text-2xl font-bold tabular-nums">{avgRating.toFixed(1)}</span>
          <span className="text-[11px] sm:text-xs text-muted-foreground">Avg Rating</span>
        </div>
      </div>

      <div className="mb-6 -mt-2">
        <Link href="/stats">
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground hover:text-primary hover:border-primary/50">
            <BarChart2 className="h-4 w-4" />
            View Full Stats
          </Button>
        </Link>
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
                  Enter their email address
                </div>
                <div className="flex gap-2">
                  <Input type="email" placeholder="friend@email.com" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSendInvite()} />
                  <Button onClick={handleSendInvite} disabled={sendingInvite}>{sendingInvite ? "..." : "Send"}</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {friends.length > 0 ? (
          <div className="flex flex-col gap-3">
            {friends.map((friend) => (
              <div key={friend.id} className="flex items-center justify-between rounded-lg border border-border/50 bg-card p-4">
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
          <div className="flex flex-col items-center gap-4 py-10 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/8 border border-primary/15">
              <Users className="h-7 w-7 text-primary/40" />
            </div>
            <div>
              <p className="font-semibold text-sm">No friends yet</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">Share your invite link or add friends by email.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
