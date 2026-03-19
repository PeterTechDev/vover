import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/media-card";
import { getTrending, type TMDBMediaItem } from "@/lib/tmdb";
import {
  Film,
  List,
  Users,
  Sparkles,
  ArrowRight,
  Star,
  MessageCircle,
  TrendingUp,
  Heart,
} from "lucide-react";

function getTitle(item: TMDBMediaItem) {
  return item.title || item.name || "Untitled";
}

function getYear(item: TMDBMediaItem) {
  const date = item.release_date || item.first_air_date;
  return date ? date.slice(0, 4) : null;
}

function getMediaType(item: TMDBMediaItem): "movie" | "tv" {
  return item.media_type === "tv" ? "tv" : "movie";
}

const features = [
  {
    icon: Sparkles,
    title: "Friend Recommendations",
    description:
      "Get personalized picks from people who actually know your taste — not a faceless algorithm.",
  },
  {
    icon: List,
    title: "Smart Watchlists",
    description:
      "Save everything you want to watch in one place. Organize, prioritize, and never forget a title.",
  },
  {
    icon: Users,
    title: "Social Feed",
    description:
      "See what your friends are watching right now, complete with their ratings and reviews.",
  },
  {
    icon: MessageCircle,
    title: "Direct Recommendations",
    description:
      "Found something amazing? Send it to a friend in seconds. Watch together, decide faster.",
  },
];

const testimonials = [
  {
    name: "Alex",
    initial: "A",
    text: "Finally stopped arguing about what to watch. Vover solved movie night.",
  },
  {
    name: "Maria",
    initial: "M",
    text: "My friends' recommendations beat Netflix's suggestions every single time.",
  },
  {
    name: "João",
    initial: "J",
    text: "Love seeing what my friends are watching. Always find something great.",
  },
];

export async function LandingPage() {
  let trending: TMDBMediaItem[] = [];
  try {
    const data = await getTrending("all", "week");
    trending = data.results
      .filter((r) => r.media_type === "movie" || r.media_type === "tv")
      .slice(0, 8);
  } catch {
    // TMDB unavailable
  }

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden px-4 pb-20 pt-16 text-center md:pb-32 md:pt-28">
        {/* Background glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-0 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/8 blur-[120px]" />
        </div>

        {/* Badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm text-primary">
          <Star className="h-3.5 w-3.5 fill-primary" />
          Social movie recommendations
        </div>

        <h1 className="mx-auto mb-6 max-w-3xl text-5xl font-extrabold tracking-tight md:text-7xl">
          Stop scrolling.
          <br />
          <span className="text-primary">Start watching.</span>
        </h1>

        <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground md:text-xl">
          Vover connects you and your friends around movies and TV. Share what
          you love, discover what they&apos;re watching, and always know what to
          put on next.
        </p>

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth">
            <Button size="lg" className="gap-2 px-8 text-base font-semibold">
              Get Started Free
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <Link href="/auth">
            <Button
              size="lg"
              variant="outline"
              className="px-8 text-base border-border/50 hover:border-primary/50"
            >
              Sign In
            </Button>
          </Link>
        </div>

        {/* Social proof numbers */}
        <div className="mt-12 flex justify-center gap-8 text-center">
          <div>
            <div className="text-2xl font-bold text-foreground">10k+</div>
            <div className="text-xs text-muted-foreground">Movies tracked</div>
          </div>
          <div className="w-px bg-border/50" />
          <div>
            <div className="text-2xl font-bold text-foreground">Friends</div>
            <div className="text-xs text-muted-foreground">Not algorithms</div>
          </div>
          <div className="w-px bg-border/50" />
          <div>
            <div className="text-2xl font-bold text-foreground">Free</div>
            <div className="text-xs text-muted-foreground">Always</div>
          </div>
        </div>
      </section>

      {/* ── Trending Preview ─────────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="px-4 pb-20">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Trending This Week</h2>
              <span className="ml-auto text-sm text-muted-foreground">
                Sign in to save to your watchlist
              </span>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-8">
              {trending.slice(0, 8).map((item) => (
                <MediaCard
                  key={`${item.media_type}-${item.id}`}
                  tmdbId={item.id}
                  mediaType={getMediaType(item)}
                  title={getTitle(item)}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  year={getYear(item)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Everything you need for movie night
            </h2>
            <p className="text-muted-foreground">
              Vover brings your social circle into your movie-watching life.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-xl border border-border/50 bg-card p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
                >
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-2.5 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-2 font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-border/50 bg-card p-8 md:p-12">
            <div className="mb-10 text-center">
              <h2 className="mb-4 text-3xl font-bold">How Vover works</h2>
              <p className="text-muted-foreground">
                Three steps to better movie nights
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  step: "01",
                  icon: Film,
                  title: "Search & Save",
                  desc: "Search millions of movies and TV shows. Add them to your watchlist instantly.",
                },
                {
                  step: "02",
                  icon: Users,
                  title: "Connect Friends",
                  desc: "Add your friends. See what they're watching and what they'd recommend.",
                },
                {
                  step: "03",
                  icon: Sparkles,
                  title: "Get Recommendations",
                  desc: "Send and receive picks. Agree on what to watch next in seconds.",
                },
              ].map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="flex flex-col items-center text-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-lg">
                      {step.step}
                    </div>
                    <Icon className="h-6 w-6 text-primary" />
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Social Proof / Testimonials ──────────────────────────────── */}
      <section className="px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-bold">
              Join your friends on Vover
            </h2>
            <p className="text-muted-foreground">
              Real people, real recommendations
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-xl border border-border/50 bg-card p-6"
              >
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {t.initial}
                  </div>
                  <span className="font-medium">{t.name}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="mt-3 flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="h-3.5 w-3.5 fill-primary text-primary"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-10">
            <Heart className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="mb-3 text-3xl font-bold">
              Ready to watch better?
            </h2>
            <p className="mb-8 text-muted-foreground">
              Join Vover for free. Sign in with a magic link — no password
              required.
            </p>
            <Link href="/auth">
              <Button size="lg" className="gap-2 px-10 text-base font-semibold">
                Join Vover Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
