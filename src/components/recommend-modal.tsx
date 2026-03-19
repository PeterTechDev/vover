"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Check, ChevronDown, ChevronUp, Loader2, Users } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Friend {
  id: string;
  name: string | null;
}

interface RecommendModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
  friends: Friend[];
  userId: string;
}

export function RecommendModal({
  open,
  onOpenChange,
  tmdbId,
  mediaType,
  title,
  posterPath,
  friends,
  userId,
}: RecommendModalProps) {
  const [sentToIds, setSentToIds] = useState<string[]>([]);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [expandNoteFor, setExpandNoteFor] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  async function handleSend(friendId: string) {
    setSendingId(friendId);
    const note = notes[friendId]?.trim() || null;

    const { error } = await supabase.from("recommendations").insert({
      from_user_id: userId,
      to_user_id: friendId,
      tmdb_id: tmdbId,
      media_type: mediaType,
      title,
      poster_path: posterPath,
      note,
    });

    if (error) {
      if ((error as { code?: string }).code === "23505") {
        toast.error("Already recommended to this friend");
        setSentToIds((prev) => [...prev, friendId]);
      } else {
        toast.error("Failed to send recommendation");
      }
    } else {
      const friendName = friends.find((f) => f.id === friendId)?.name || "your friend";
      toast.success(`Sent to ${friendName}`);
      setSentToIds((prev) => [...prev, friendId]);
      setExpandNoteFor(null);
    }
    setSendingId(null);
  }

  function toggleNote(friendId: string) {
    setExpandNoteFor((prev) => (prev === friendId ? null : friendId));
  }

  // Reset state when dialog closes
  function handleOpenChange(val: boolean) {
    if (!val) {
      setSentToIds([]);
      setExpandNoteFor(null);
      setNotes({});
    }
    onOpenChange(val);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" />
            Recommend
            <span className="text-muted-foreground font-normal text-sm truncate max-w-[160px]">
              {title}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-2 pt-1">
          {friends.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <Users className="h-10 w-10 text-muted-foreground/30" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">No friends yet</p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  Add friends from your profile to recommend titles
                </p>
              </div>
            </div>
          ) : (
            friends.map((friend) => {
              const sent = sentToIds.includes(friend.id);
              const loading = sendingId === friend.id;
              const noteExpanded = expandNoteFor === friend.id;
              const initials = (friend.name || "?").charAt(0).toUpperCase();

              return (
                <div
                  key={friend.id}
                  className={cn(
                    "rounded-lg border transition-colors",
                    sent
                      ? "border-primary/30 bg-primary/5"
                      : "border-border/50 bg-card"
                  )}
                >
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback
                        className={cn(
                          "text-xs",
                          sent
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground"
                        )}
                      >
                        {initials}
                      </AvatarFallback>
                    </Avatar>

                    <span className="flex-1 text-sm font-medium truncate">
                      {friend.name || "Unknown"}
                    </span>

                    {sent ? (
                      <div className="flex items-center gap-1 text-primary text-xs font-medium">
                        <Check className="h-3.5 w-3.5" />
                        Sent
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        {/* Note toggle */}
                        <button
                          className="rounded p-1 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                          onClick={() => toggleNote(friend.id)}
                          title="Add note"
                        >
                          {noteExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </button>

                        {/* Send button — one tap */}
                        <Button
                          size="sm"
                          className="h-7 gap-1 text-xs px-3"
                          disabled={loading}
                          onClick={() => handleSend(friend.id)}
                        >
                          {loading ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <>
                              <Send className="h-3 w-3" />
                              Send
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>

                  {/* Optional note expansion */}
                  {noteExpanded && !sent && (
                    <div className="border-t border-border/40 px-3 pb-3 pt-2">
                      <Textarea
                        placeholder="Add a note (optional)..."
                        className="min-h-[60px] text-xs resize-none bg-background/50"
                        value={notes[friend.id] || ""}
                        onChange={(e) =>
                          setNotes((prev) => ({ ...prev, [friend.id]: e.target.value }))
                        }
                        autoFocus
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
