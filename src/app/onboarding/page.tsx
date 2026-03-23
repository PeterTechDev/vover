"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star,
  ChevronRight,
  Check,
  Plus,
  Share2,
  Copy,
  MessageCircle,
  Search,
  Sparkles,
  Users,
  Film,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";
import { markWatched, addToWatchlist, completeOnboarding, getOrCreateInviteCode } from "@/lib/db";
import { posterUrl } from "@/lib/tmdb";
import { toast } from "sonner";

const TOTAL_STEPS = 4;
const MIN_SELECTIONS = 5;

interface Movie {
  id: number;
  title: string;
  poster_path: string | null;
  vote_average: number;
}

interface Selection {
  movie: Movie;
  rating: number; // 1–5
}

// ─── Step progress bar ────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-1.5 mb-8">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <motion.div
          key={i}
          className="h-1 rounded-full flex-1"
          animate={{
            backgroundColor: i < step ? "hsl(var(--primary))" : "hsl(var(--muted))",
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

// ─── Star Rating inline ───────────────────────────────────────────────────────

function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(star);
          }}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="cursor-pointer touch-manipulation p-0.5"
        >
          <Star
            className="w-3.5 h-3.5 transition-colors"
            fill={(hovered || value) >= star ? "hsl(var(--primary))" : "none"}
            stroke={(hovered || value) >= star ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
          />
        </button>
      ))}
    </div>
  );
}

// ─── Step 1: Rate movies ──────────────────────────────────────────────────────

function Step1({
  selections,
  setSelections,
}: {
  selections: Map<number, Selection>;
  setSelections: (s: Map<number, Selection>) => void;
}) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/onboarding")
      .then((r) => r.json())
      .then((data) => {
        setMovies(data.movies || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  function toggleMovie(movie: Movie) {
    const next = new Map(selections);
    if (next.has(movie.id)) {
      next.delete(movie.id);
    } else {
      next.set(movie.id, { movie, rating: 3 });
    }
    setSelections(next);
  }

  function setRating(movieId: number, rating: number) {
    const next = new Map(selections);
    const sel = next.get(movieId);
    if (sel) next.set(movieId, { ...sel, rating });
    setSelections(next);
  }

  const count = selections.size;

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Film className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Step 1 of 4
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          What have you seen?
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Tap movies you&apos;ve watched and rate them. Pick at least {MIN_SELECTIONS}.
          <span className="ml-2 text-foreground font-medium">
            {count}/{MIN_SELECTIONS} selected
          </span>
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl bg-muted animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {movies.map((movie, i) => {
            const selected = selections.has(movie.id);
            const sel = selections.get(movie.id);
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.025 }}
                className="relative cursor-pointer touch-manipulation select-none"
                onClick={() => toggleMovie(movie)}
              >
                {/* Poster */}
                <div
                  className={`relative aspect-[2/3] rounded-xl overflow-hidden transition-all duration-200 ${
                    selected
                      ? "ring-2 ring-primary ring-offset-1 ring-offset-background"
                      : "ring-1 ring-border/30 hover:ring-border"
                  }`}
                >
                  <Image
                    src={posterUrl(movie.poster_path, "w342")}
                    alt={movie.title}
                    fill
                    className={`object-cover transition-all duration-200 ${selected ? "" : "brightness-75 hover:brightness-90"}`}
                    sizes="(max-width: 640px) 33vw, 25vw"
                  />
                  {selected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center"
                    >
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </motion.div>
                  )}
                </div>

                {/* Title + stars when selected */}
                <div className="mt-1 px-0.5">
                  <p className="text-xs leading-tight font-medium line-clamp-1 text-foreground/80">
                    {movie.title}
                  </p>
                  {selected && sel && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.2 }}
                      className="mt-0.5"
                    >
                      <StarRating
                        value={sel.rating}
                        onChange={(v) => setRating(movie.id, v)}
                      />
                    </motion.div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ─── Step 2: Build watchlist from recs ────────────────────────────────────────

function Step2({
  selections,
  watchlistAdded,
  setWatchlistAdded,
  userId,
}: {
  selections: Map<number, Selection>;
  watchlistAdded: Set<number>;
  setWatchlistAdded: (s: Set<number>) => void;
  userId: string;
}) {
  const [recs, setRecs] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Get top 5 rated movies
    const topRated = Array.from(selections.values())
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 5)
      .map((s) => s.movie.id);

    if (topRated.length === 0) {
      setLoading(false);
      return;
    }

    fetch(`/api/onboarding/recommendations?movie_ids=${topRated.join(",")}`)
      .then((r) => r.json())
      .then((data) => {
        setRecs(data.recommendations || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selections]);

  async function handleAdd(movie: Movie) {
    setAdding((prev) => new Set(prev).add(movie.id));
    await addToWatchlist(userId, {
      tmdb_id: movie.id,
      media_type: "movie",
      title: movie.title,
      poster_path: movie.poster_path,
    });
    setWatchlistAdded(new Set(watchlistAdded).add(movie.id));
    setAdding((prev) => {
      const next = new Set(prev);
      next.delete(movie.id);
      return next;
    });
    toast.success(`Added "${movie.title}" to watchlist`);
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Step 2 of 4
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Build your watchlist
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Based on your taste, you might love these. Add any to your watchlist.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : recs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <Sparkles className="h-8 w-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm">No recommendations found. You can skip this step.</p>
        </div>
      ) : (
        <motion.div
          className="grid grid-cols-3 sm:grid-cols-4 gap-2.5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {recs.map((movie, i) => {
            const added = watchlistAdded.has(movie.id);
            const isAdding = adding.has(movie.id);
            return (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.04 }}
                className="relative"
              >
                <div className="relative aspect-[2/3] rounded-xl overflow-hidden ring-1 ring-border/30">
                  <Image
                    src={posterUrl(movie.poster_path, "w342")}
                    alt={movie.title}
                    fill
                    className="object-cover brightness-90"
                    sizes="(max-width: 640px) 33vw, 25vw"
                  />
                  {/* Add button overlay */}
                  <button
                    onClick={() => !added && !isAdding && handleAdd(movie)}
                    className={`absolute bottom-1.5 right-1.5 h-7 w-7 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer ${
                      added
                        ? "bg-primary text-primary-foreground"
                        : "bg-black/60 text-white hover:bg-primary hover:text-primary-foreground"
                    }`}
                    aria-label={added ? "Added" : "Add to watchlist"}
                  >
                    {isAdding ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : added ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <Plus className="h-3.5 w-3.5" />
                    )}
                  </button>
                </div>
                <p className="mt-1 text-xs leading-tight font-medium line-clamp-1 text-foreground/80 px-0.5">
                  {movie.title}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

// ─── Step 3: Invite friends ────────────────────────────────────────────────────

function Step3({ userId }: { userId: string }) {
  const [inviteLink, setInviteLink] = useState("");
  const [copied, setCopied] = useState(false);
  const [loadingLink, setLoadingLink] = useState(true);
  const [friendEmail, setFriendEmail] = useState("");
  const [searchResult, setSearchResult] = useState<{ name: string; found: boolean } | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    getOrCreateInviteCode(userId).then(({ code }) => {
      if (code) {
        const base = typeof window !== "undefined" ? window.location.origin : "";
        setInviteLink(`${base}/invite/${code}`);
      }
      setLoadingLink(false);
    });
  }, [userId]);

  async function handleCopy() {
    await navigator.clipboard.writeText(inviteLink);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  }

  function handleWhatsApp() {
    const msg = encodeURIComponent(
      `Oi! Tô usando o Vover pra descobrir filmes com amigos. Entra aqui: ${inviteLink}`
    );
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  }

  async function handleNativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Vover — Watch together, decide faster",
          text: "Join me on Vover to share movies and TV recommendations!",
          url: inviteLink,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  }

  async function handleSearchEmail() {
    if (!friendEmail.trim()) return;
    setSearching(true);
    setSearchResult(null);
    // In a real app, search by email via server action
    // For now, simulate a search attempt
    await new Promise((r) => setTimeout(r, 800));
    setSearchResult({ name: friendEmail, found: false });
    setSearching(false);
    toast.info("Invite link sent via email would go here");
  }

  return (
    <div>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-2 mb-1">
          <Users className="h-5 w-5 text-primary" />
          <span className="text-xs font-semibold tracking-widest uppercase text-primary">
            Step 3 of 4
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-1">
          Better with friends
        </h1>
        <p className="text-muted-foreground text-sm mb-6">
          Invite friends to share what they&apos;re watching. The more, the better.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-4"
      >
        {/* Invite link */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Your invite link
          </p>
          {loadingLink ? (
            <div className="h-10 rounded-lg bg-muted animate-pulse" />
          ) : (
            <div className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2 border border-border/30">
              <p className="text-sm font-mono text-foreground/80 truncate flex-1">
                {inviteLink || "Generating..."}
              </p>
            </div>
          )}

          {/* Share buttons */}
          <div className="grid grid-cols-3 gap-2 mt-3">
            <button
              onClick={handleCopy}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors p-3 cursor-pointer"
            >
              {copied ? (
                <Check className="h-5 w-5 text-primary" />
              ) : (
                <Copy className="h-5 w-5 text-muted-foreground" />
              )}
              <span className="text-xs text-muted-foreground">
                {copied ? "Copied!" : "Copy"}
              </span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors p-3 cursor-pointer"
            >
              <MessageCircle className="h-5 w-5 text-[#25D366]" />
              <span className="text-xs text-muted-foreground">WhatsApp</span>
            </button>

            <button
              onClick={handleNativeShare}
              className="flex flex-col items-center gap-1.5 rounded-xl border border-border/50 bg-card hover:bg-accent/50 transition-colors p-3 cursor-pointer"
            >
              <Share2 className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Share</span>
            </button>
          </div>
        </div>

        {/* Search by email */}
        <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-4">
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Search by email
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="friend@email.com"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                className="pl-9 h-10"
                onKeyDown={(e) => e.key === "Enter" && handleSearchEmail()}
              />
            </div>
            <Button
              onClick={handleSearchEmail}
              disabled={!friendEmail.trim() || searching}
              size="sm"
              className="h-10 px-4"
            >
              {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : "Invite"}
            </Button>
          </div>
          {searchResult && (
            <motion.p
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-muted-foreground mt-2"
            >
              {searchResult.found
                ? `Found ${searchResult.name}. Friend request sent!`
                : `No account found. Share your link to invite them.`}
            </motion.p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Step 4: All set ──────────────────────────────────────────────────────────

function Step4({ name }: { name: string }) {
  return (
    <div className="flex flex-col items-center text-center py-8">
      <motion.div
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }}
        className="relative mb-6"
      >
        <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring", damping: 10 }}
          >
            <Sparkles className="h-10 w-10 text-primary" />
          </motion.div>
        </div>
        {/* Orbiting check */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="absolute -top-1 -right-1 h-8 w-8 rounded-full bg-primary flex items-center justify-center shadow-lg shadow-primary/30"
        >
          <Check className="h-4 w-4 text-primary-foreground" />
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-xs font-semibold tracking-widest uppercase text-primary mb-2">
          Step 4 of 4
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          You&apos;re all set{name ? `, ${name.split(" ")[0]}` : ""}! 🎬
        </h1>
        <p className="text-muted-foreground text-sm max-w-xs mx-auto leading-relaxed">
          Your personalized feed is ready. See what friends are watching, share
          what you love, and never waste time choosing again.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 grid grid-cols-3 gap-4 w-full max-w-xs"
      >
        {[
          { icon: Film, label: "Explore" },
          { icon: Users, label: "Friends" },
          { icon: Star, label: "Rate" },
        ].map(({ icon: Icon, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 + i * 0.1 }}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border/50 bg-card/60 p-4"
          >
            <Icon className="h-6 w-6 text-primary" />
            <span className="text-xs text-muted-foreground font-medium">{label}</span>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}

// ─── Main Onboarding Page ─────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("");
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);

  // Step 1 state
  const [selections, setSelections] = useState<Map<number, Selection>>(new Map());
  // Step 2 state
  const [watchlistAdded, setWatchlistAdded] = useState<Set<number>>(new Set());

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      setUserId(user.id);
      const name = user.user_metadata?.full_name || user.email?.split("@")[0] || "there";
      setUserName(name);
    });
  }, [router]);

  const canProceedStep1 = selections.size >= MIN_SELECTIONS;

  const handleNext = useCallback(async () => {
    if (step === 1 && !canProceedStep1) {
      toast.error(`Select at least ${MIN_SELECTIONS} movies first`);
      return;
    }

    if (step === 1 && userId) {
      // Save all selections to watched history
      setSaving(true);
      const saves = Array.from(selections.values()).map((sel) =>
        markWatched(userId, {
          tmdb_id: sel.movie.id,
          media_type: "movie",
          title: sel.movie.title,
          poster_path: sel.movie.poster_path,
          rating: sel.rating,
        })
      );
      await Promise.allSettled(saves);
      setSaving(false);
    }

    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    } else {
      // Complete onboarding
      setSaving(true);
      if (userId) await completeOnboarding(userId);
      setSaving(false);
      router.push("/");
    }
  }, [step, canProceedStep1, selections, userId, router]);

  const handleSkip = useCallback(() => {
    if (step < TOTAL_STEPS) {
      setStep((s) => s + 1);
    }
  }, [step]);

  if (!userId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const isLastStep = step === TOTAL_STEPS;
  const showSkip = step === 2 || step === 3;

  return (
    <div className="min-h-screen bg-background">
      {/* Subtle ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/3 blur-3xl" />
      </div>

      <div className="max-w-lg mx-auto px-4 pt-8 pb-32">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <Film className="h-6 w-6 text-primary" />
          <span className="text-lg font-bold tracking-tight">
            <span className="text-primary">V</span>over
          </span>
        </div>

        <ProgressBar step={step} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -24 }}
            transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {step === 1 && (
              <Step1 selections={selections} setSelections={setSelections} />
            )}
            {step === 2 && userId && (
              <Step2
                selections={selections}
                watchlistAdded={watchlistAdded}
                setWatchlistAdded={setWatchlistAdded}
                userId={userId}
              />
            )}
            {step === 3 && userId && <Step3 userId={userId} />}
            {step === 4 && <Step4 name={userName} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border/30 px-4 py-4 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          {showSkip && (
            <Button
              variant="ghost"
              className="text-muted-foreground flex-shrink-0"
              onClick={handleSkip}
            >
              Skip
            </Button>
          )}
          <Button
            className="flex-1 h-12 font-semibold text-base gap-2 shadow-lg shadow-primary/20"
            onClick={handleNext}
            disabled={saving || (step === 1 && !canProceedStep1)}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : isLastStep ? (
              <>
                Go to Vover
                <ChevronRight className="h-4 w-4" />
              </>
            ) : (
              <>
                Continue
                {step === 1 && (
                  <span className="text-xs opacity-70 font-normal">
                    ({selections.size}/{MIN_SELECTIONS})
                  </span>
                )}
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
