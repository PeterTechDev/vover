"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getSharedListById,
  getSharedListItems,
  addItemToSharedList,
  removeItemFromSharedList,
  deleteSharedList,
  getFriendsByUserId,
  addMemberToList,
} from "@/lib/db";
import { posterUrl } from "@/lib/tmdb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ListChecks,
  Trash2,
  UserPlus,
  Search,
  ArrowLeft,
  Users,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { posterUrl as getPosterUrl } from "@/lib/tmdb";

interface SharedList {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  creator: { id: string; name: string | null; avatar_url: string | null } | null;
  members: {
    id: string;
    user_id: string;
    profile: { id: string; name: string | null; avatar_url: string | null } | null;
  }[];
}

interface ListItem {
  id: string;
  list_id: string;
  added_by: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  added_at: string;
  adder: { id: string; name: string | null } | null;
}

interface Friend {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface SearchResult {
  id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  year: string | null;
}

export default function ListDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: listId } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [list, setList] = useState<SharedList | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [invitingId, setInvitingId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);

      const [listRes, itemsRes, friendsRes] = await Promise.all([
        getSharedListById(listId),
        getSharedListItems(listId),
        getFriendsByUserId(user.id),
      ]);

      if (listRes.error || !listRes.data) {
        toast.error("List not found");
        router.push("/lists");
        return;
      }

      setList(listRes.data as SharedList);
      setItems((itemsRes.data as ListItem[]) || []);

      // Extract friend profiles from friendship data
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rawFriendships = (friendsRes.data || []) as any[];
      const friendProfiles: Friend[] = rawFriendships.map((f) => {
        const isRequester = f.requester_id === user.id;
        const profile = isRequester ? f.addressee : f.requester;
        return { id: profile?.id, name: profile?.name, avatar_url: profile?.avatar_url };
      });
      setFriends(friendProfiles);

      setLoading(false);
    });
  }, [listId, router]);

  // Debounced search for adding movies
  useEffect(() => {
    if (!addOpen) {
      setSearchQuery("");
      setSearchResults([]);
      return;
    }
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery.trim())}`);
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, addOpen]);

  async function handleAddItem(result: SearchResult) {
    if (!userId) return;
    setAddingId(result.id);
    const { data, error } = await addItemToSharedList(listId, userId, {
      tmdb_id: result.id,
      media_type: result.media_type,
      title: result.title,
      poster_path: result.poster_path,
    });
    if (error) {
      if ((error as { code?: string }).code === "23505") {
        toast.error("Already in this list");
      } else {
        toast.error("Failed to add");
      }
    } else if (data) {
      const newItem: ListItem = {
        id: data.id,
        list_id: listId,
        added_by: userId,
        tmdb_id: result.id,
        media_type: result.media_type,
        title: result.title,
        poster_path: result.poster_path,
        added_at: data.added_at,
        adder: null,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success(`Added ${result.title}`);
    }
    setAddingId(null);
  }

  async function handleRemoveItem(item: ListItem) {
    setRemovingId(item.id);
    const { error } = await removeItemFromSharedList(item.id);
    if (error) {
      toast.error("Failed to remove");
    } else {
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      toast.success("Removed from list");
    }
    setRemovingId(null);
  }

  async function handleInviteFriend(friend: Friend) {
    if (!userId) return;
    setInvitingId(friend.id);
    const { error } = await addMemberToList(listId, friend.id, userId);
    if (error) {
      if ((error as { code?: string }).code === "23505") {
        toast.error("Already a member");
      } else {
        toast.error("Failed to invite");
      }
    } else {
      toast.success(`${friend.name || "Friend"} added to list`);
      // Refresh list to show new member
      const { data } = await getSharedListById(listId);
      if (data) setList(data as SharedList);
    }
    setInvitingId(null);
  }

  async function handleDelete() {
    if (!list || list.created_by !== userId) return;
    const { error } = await deleteSharedList(listId);
    if (error) {
      toast.error("Failed to delete list");
    } else {
      toast.success("List deleted");
      router.push("/lists");
    }
  }

  const isOwner = list?.created_by === userId;
  const isMember =
    isOwner ||
    (list?.members || []).some((m) => m.user_id === userId);
  const memberUserIds = new Set((list?.members || []).map((m) => m.user_id));
  const uninvitedFriends = friends.filter(
    (f) => !memberUserIds.has(f.id) && f.id !== list?.created_by
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-48 bg-secondary/50 rounded animate-pulse mb-8" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!list) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link href="/lists" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        All Lists
      </Link>

      {/* Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <ListChecks className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
            <div className="min-w-0">
              <h1 className="text-2xl font-bold leading-tight">{list.name}</h1>
              {list.description && (
                <p className="mt-1 text-sm text-muted-foreground">{list.description}</p>
              )}
            </div>
          </div>

          {isOwner && (
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 text-muted-foreground hover:text-destructive"
              onClick={handleDelete}
              title="Delete list"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Members row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Members:</span>
          </div>

          {/* Creator */}
          <div className="flex items-center gap-1.5">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="bg-primary/20 text-primary text-[10px]">
                {(list.creator?.name || "?").charAt(0)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm">
              {list.creator?.name || "Unknown"}
              {list.created_by === userId && " (you)"}
            </span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">owner</Badge>
          </div>

          {/* Other members */}
          {list.members
            .filter((m) => m.user_id !== list.created_by)
            .map((m) => (
              <div key={m.id} className="flex items-center gap-1.5">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-secondary text-muted-foreground text-[10px]">
                    {(m.profile?.name || "?").charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm">
                  {m.profile?.name || "Unknown"}
                  {m.user_id === userId && " (you)"}
                </span>
              </div>
            ))}

          {/* Invite button (owner only) */}
          {isOwner && (
            <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
                  <UserPlus className="h-3.5 w-3.5" />
                  Invite
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                  <DialogTitle>Invite friends</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 pt-2">
                  {uninvitedFriends.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      All your friends are already members, or you have no friends yet.
                    </p>
                  ) : (
                    uninvitedFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="flex items-center justify-between gap-3 rounded-lg border border-border/50 px-3 py-2"
                      >
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {(friend.name || "?").charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{friend.name || "Unknown"}</span>
                        </div>
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-7 text-xs"
                          disabled={invitingId === friend.id}
                          onClick={() => handleInviteFriend(friend)}
                        >
                          {invitingId === friend.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            "Add"
                          )}
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Actions bar */}
      {isMember && (
        <div className="mb-6">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" size="sm">
                <Plus className="h-4 w-4" />
                Add movie or TV show
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add to list</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-4 pt-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search movies or TV shows..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                  />
                  {searching && (
                    <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                </div>

                {searchResults.length > 0 && (
                  <div className="flex flex-col gap-1 max-h-72 overflow-y-auto">
                    {searchResults.map((result) => {
                      const alreadyAdded = items.some(
                        (i) => i.tmdb_id === result.id && i.media_type === result.media_type
                      );
                      return (
                        <button
                          key={`${result.media_type}-${result.id}`}
                          className="flex items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-secondary/60 disabled:opacity-50"
                          disabled={alreadyAdded || addingId === result.id}
                          onClick={() => handleAddItem(result)}
                        >
                          <div className="relative h-12 w-8 shrink-0 overflow-hidden rounded bg-secondary/50">
                            {result.poster_path && (
                              <Image
                                src={posterUrl(result.poster_path)}
                                alt={result.title}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            )}
                          </div>
                          <div className="flex flex-1 flex-col gap-0.5 min-w-0">
                            <span className="text-sm font-medium line-clamp-1">{result.title}</span>
                            <span className="text-xs text-muted-foreground">
                              {result.media_type === "movie" ? "Movie" : "TV"}{result.year ? ` · ${result.year}` : ""}
                            </span>
                          </div>
                          {alreadyAdded ? (
                            <span className="text-xs text-muted-foreground shrink-0">Added</span>
                          ) : addingId === result.id ? (
                            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-primary" />
                          ) : (
                            <Plus className="h-4 w-4 shrink-0 text-primary" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                {searchQuery.trim().length >= 2 && !searching && searchResults.length === 0 && (
                  <p className="py-4 text-center text-sm text-muted-foreground">No results found</p>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      )}

      {/* Items grid */}
      {items.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center">
          <Plus className="h-10 w-10 text-muted-foreground/30" />
          <p className="text-muted-foreground">No titles yet — add some above</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {items.map((item) => {
            const canRemove = item.added_by === userId || isOwner;
            return (
              <div key={item.id} className="group relative flex flex-col gap-1">
                <Link
                  href={`/${item.media_type}/${item.tmdb_id}`}
                  className="relative block aspect-[2/3] overflow-hidden rounded-lg border border-border/50 bg-secondary/30 transition-all duration-200 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:-translate-y-0.5"
                >
                  {item.poster_path && (
                    <Image
                      src={getPosterUrl(item.poster_path)}
                      alt={item.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 25vw"
                    />
                  )}
                  <Badge className="absolute left-2 top-2 bg-background/80 text-[10px] backdrop-blur-sm">
                    {item.media_type === "movie" ? "Movie" : "TV"}
                  </Badge>
                </Link>

                <div className="flex items-start justify-between gap-1 px-0.5">
                  <div className="flex flex-col min-w-0">
                    <p className="text-xs font-medium line-clamp-1 leading-tight">{item.title}</p>
                    {item.adder?.name && (
                      <p className="text-[10px] text-muted-foreground/70">by {item.adder.name}</p>
                    )}
                  </div>
                  {canRemove && (
                    <button
                      className="shrink-0 mt-0.5 rounded p-0.5 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 hover:text-destructive"
                      onClick={() => handleRemoveItem(item)}
                      disabled={removingId === item.id}
                      title="Remove"
                    >
                      {removingId === item.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <X className="h-3.5 w-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
