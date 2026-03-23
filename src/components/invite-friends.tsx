"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, MessageCircle, Check, Users, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InviteFriendsProps {
  trigger?: React.ReactNode;
  className?: string;
}

export function InviteFriends({ trigger, className }: InviteFriendsProps) {
  const [open, setOpen] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [uses, setUses] = useState(0);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (inviteCode) return; // already loaded

    setLoading(true);
    fetch("/api/invite")
      .then((r) => r.json())
      .then((data) => {
        if (data.code) {
          setInviteCode(data.code);
          setUses(data.uses || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, inviteCode]);

  const inviteLink = inviteCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/invite/${inviteCode}`
    : "";

  async function handleCopy() {
    if (!inviteLink) return;
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Invite link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Oi! Tô usando o Vover pra descobrir filmes com amigos — é muito bom! Entra aqui: ${inviteLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join me on Vover",
          text: "Vover — Social movie recommendations from friends you trust.",
          url: inviteLink,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopy();
    }
  }

  return (
    <>
      {/* Trigger */}
      <div className={className} onClick={() => setOpen(true)}>
        {trigger || (
          <Button className="gap-2 w-full">
            <Users className="h-4 w-4" />
            Invite Friends
            {uses > 0 && (
              <span className="ml-auto text-xs bg-primary/20 text-primary rounded-full px-2 py-0.5 font-medium">
                {uses} joined
              </span>
            )}
          </Button>
        )}
      </div>

      {/* Sheet / Modal */}
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setOpen(false)}
            />

            {/* Bottom sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-3xl border-t border-border/50 shadow-2xl shadow-black/40 px-4 pt-4 pb-10"
            >
              {/* Handle */}
              <div className="w-10 h-1 rounded-full bg-muted mx-auto mb-5" />

              {/* Close */}
              <button
                onClick={() => setOpen(false)}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted flex items-center justify-center cursor-pointer hover:bg-accent transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <div className="max-w-md mx-auto">
                <h2 className="text-xl font-bold mb-1">Invite Friends</h2>
                <p className="text-sm text-muted-foreground mb-5">
                  Share your link. When they join, they&apos;ll be added as your friend automatically.
                  {uses > 0 && (
                    <span className="text-primary font-medium ml-1">
                      {uses} {uses === 1 ? "person" : "people"} joined via your link.
                    </span>
                  )}
                </p>

                {loading ? (
                  <div className="flex justify-center py-6">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                ) : (
                  <>
                    {/* Link display */}
                    <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-4 py-3 border border-border/30 mb-4">
                      <p className="text-sm font-mono text-foreground/80 truncate flex-1">
                        {inviteLink || "Failed to load"}
                      </p>
                    </div>

                    {/* Share options */}
                    <div className="grid grid-cols-3 gap-3">
                      <button
                        onClick={handleCopy}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors p-4 cursor-pointer"
                      >
                        {copied ? (
                          <Check className="h-6 w-6 text-primary" />
                        ) : (
                          <Copy className="h-6 w-6 text-muted-foreground" />
                        )}
                        <span className="text-xs text-muted-foreground font-medium">
                          {copied ? "Copied!" : "Copy Link"}
                        </span>
                      </button>

                      <button
                        onClick={handleWhatsApp}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors p-4 cursor-pointer"
                      >
                        <MessageCircle className="h-6 w-6 text-[#25D366]" />
                        <span className="text-xs text-muted-foreground font-medium">WhatsApp</span>
                      </button>

                      <button
                        onClick={handleNativeShare}
                        className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-background/50 hover:bg-accent/40 transition-colors p-4 cursor-pointer"
                      >
                        <Share2 className="h-6 w-6 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground font-medium">Share</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
