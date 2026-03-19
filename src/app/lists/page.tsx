"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSharedLists, createSharedList } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ListChecks, Plus, Users, Film } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface SharedList {
  id: string;
  name: string;
  description: string | null;
  created_by: string;
  created_at: string;
  creator: { id: string; name: string | null; avatar_url: string | null } | null;
  members: { id: string; user_id: string; profile: { id: string; name: string | null; avatar_url: string | null } | null }[];
  items: { id: string }[];
}

export default function ListsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [lists, setLists] = useState<SharedList[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [newListDesc, setNewListDesc] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      const { data } = await getSharedLists(user.id);
      setLists((data as SharedList[]) || []);
      setLoading(false);
    });
  }, [router]);

  async function handleCreate() {
    if (!userId || !newListName.trim()) return;
    setCreating(true);
    const { data, error } = await createSharedList(userId, newListName.trim(), newListDesc.trim() || undefined);
    if (error || !data) {
      toast.error("Failed to create list");
    } else {
      toast.success("List created");
      setDialogOpen(false);
      setNewListName("");
      setNewListDesc("");
      router.push(`/lists/${data.id}`);
    }
    setCreating(false);
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <div className="h-8 w-40 bg-secondary/50 rounded animate-pulse mb-8" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-lg bg-secondary/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <ListChecks className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Shared Lists</h1>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              New List
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create a shared list</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4 pt-2">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted-foreground">List name</label>
                <Input
                  placeholder="Weekend watchlist, Date night picks..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  autoFocus
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted-foreground">
                  Description <span className="text-muted-foreground/60">(optional)</span>
                </label>
                <Input
                  placeholder="Add a description..."
                  value={newListDesc}
                  onChange={(e) => setNewListDesc(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setDialogOpen(false)} disabled={creating}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={creating || !newListName.trim()}>
                  {creating ? "Creating..." : "Create list"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {lists.length === 0 ? (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <ListChecks className="h-12 w-12 text-muted-foreground/40" />
          <div>
            <p className="text-lg font-medium text-muted-foreground">No shared lists yet</p>
            <p className="text-sm text-muted-foreground/60 mt-1">Create a list and invite friends to build it together</p>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="gap-2 mt-2"
          >
            <Plus className="h-4 w-4" />
            Create your first list
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lists.map((list) => {
            const isOwner = list.created_by === userId;
            const memberCount = list.members?.length || 0;
            const itemCount = list.items?.length || 0;
            const creatorName = list.creator?.name || "Unknown";

            return (
              <Link key={list.id} href={`/lists/${list.id}`}>
                <div
                  className={cn(
                    "group flex flex-col gap-3 rounded-lg border border-border/50 bg-card p-5",
                    "transition-all duration-200 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-0.5"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {list.name}
                    </h2>
                    {isOwner && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Owner
                      </span>
                    )}
                  </div>

                  {list.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">{list.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-auto pt-1 border-t border-border/30">
                    <span className="flex items-center gap-1">
                      <Film className="h-3.5 w-3.5" />
                      {itemCount} {itemCount === 1 ? "title" : "titles"}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {memberCount} {memberCount === 1 ? "member" : "members"}
                    </span>
                    {!isOwner && (
                      <span className="ml-auto truncate">by {creatorName}</span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
