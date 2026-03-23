"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Star, Film, Users, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { posterUrl } from "@/lib/tmdb";

interface RecentItem {
  title: string;
  poster_path: string | null;
  rating: number | null;
  watched_at: string;
}

interface Props {
  code: string;
  inviterName: string;
  inviterId: string;
  inviterAvatar: string | null;
  inviteUses: number;
  recentActivity: RecentItem[];
}

const perks = [
  {
    icon: Film,
    title: "Discover together",
    desc: "See what friends are watching in real time",
  },
  {
    icon: Star,
    title: "Honest ratings",
    desc: "Rate movies and share your real opinions",
  },
  {
    icon: Users,
    title: "Social watchlist",
    desc: "Build lists together and finally agree on what to watch",
  },
];

export default function InviteLanding({
  code,
  inviterName,
  inviterAvatar,
  inviteUses,
  recentActivity,
}: Props) {
  // Store invite code in cookie (client side fallback)
  useEffect(() => {
    document.cookie = `pending_invite_code=${code}; max-age=${60 * 60 * 24}; path=/; samesite=lax`;
  }, [code]);

  const firstName = inviterName.split(" ")[0];
  const initials = inviterName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-[40%] rounded-full bg-primary/6 blur-3xl" />
      </div>

      <div className="max-w-md mx-auto px-4 pt-12 pb-24">
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 mb-10"
        >
          <Film className="h-5 w-5 text-primary" />
          <span className="font-bold text-lg tracking-tight">
            <span className="text-primary">V</span>over
          </span>
        </motion.div>

        {/* Inviter card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl border border-border/50 bg-card/70 backdrop-blur-sm p-5 mb-6"
        >
          <div className="flex items-center gap-4 mb-4">
            <Avatar className="h-14 w-14 border-2 border-primary/30">
              {inviterAvatar ? (
                <Image
                  src={inviterAvatar}
                  alt={inviterName}
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              ) : null}
              <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold text-lg">{inviterName}</p>
              <p className="text-sm text-muted-foreground">
                invited you to Vover
                {inviteUses > 0 && (
                  <span className="ml-2 text-primary font-medium">
                    · {inviteUses} joined
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Social proof: recent activity */}
          {recentActivity.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-2">
                {firstName}&apos;s recent watches
              </p>
              <div className="flex gap-2">
                {recentActivity.map((item, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.08 }}
                    className="relative flex-shrink-0"
                  >
                    <div className="w-16 h-24 rounded-lg overflow-hidden ring-1 ring-border/30">
                      <Image
                        src={posterUrl(item.poster_path, "w185")}
                        alt={item.title}
                        width={64}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    </div>
                    {item.rating && (
                      <div className="absolute -bottom-1 -right-1 bg-background rounded-full px-1 py-0.5 flex items-center gap-0.5 text-xs font-bold ring-1 ring-border/50">
                        <Star className="h-2.5 w-2.5 text-primary fill-primary" />
                        <span>{item.rating}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {recentActivity.length === 0 && (
                  <p className="text-xs text-muted-foreground italic">No recent activity yet</p>
                )}
              </div>
            </div>
          )}
        </motion.div>

        {/* Headline */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-6 text-center"
        >
          <h1 className="text-3xl font-bold tracking-tight leading-tight mb-2">
            Stop wasting time choosing
            <span className="text-primary"> what to watch</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {firstName} already knows what&apos;s good. Join Vover to share
            movies with friends you trust.
          </p>
        </motion.div>

        {/* Perks */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="space-y-2 mb-8"
        >
          {perks.map(({ icon: Icon, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.08 }}
              className="flex items-center gap-3 rounded-xl border border-border/30 bg-card/40 px-4 py-3"
            >
              <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Icon className="h-4.5 w-4.5 text-primary h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Sparkles badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mb-4"
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span>Free forever · No credit card</span>
        </motion.div>
      </div>

      {/* Fixed CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/85 backdrop-blur-lg border-t border-border/30 px-4 py-4">
        <div className="max-w-md mx-auto space-y-2">
          <Link href={`/auth?invite=${code}`}>
            <Button className="w-full h-12 font-semibold text-base gap-2 shadow-xl shadow-primary/25">
              Join {firstName} on Vover
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{" "}
            <Link href="/auth" className="text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
