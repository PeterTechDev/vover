import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/media-card";
import { getTrending, backdropUrl, type TMDBMediaItem } from "@/lib/tmdb";
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
  Play,
  CheckCircle2,
  BarChart2,
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
      "Picks from people who know your taste — not a faceless algorithm.",
  },
  {
    icon: List,
    title: "Smart Watchlists",
    description:
      "Save everything. Organize, prioritize, and never forget a title again.",
  },
  {
    icon: Users,
    title: "Social Feed",
    description:
      "See what your friends are watching, with their ratings and notes.",
  },
  {
    icon: MessageCircle,
    title: "Direct Recommendations",
    description:
      "Found something amazing? Send it to a friend in two taps.",
  },
  {
    icon: BarChart2,
    title: "Personal Stats",
    description:
      "Track movies watched, hours spent, and your rating patterns.",
  },
  {
    icon: Play,
    title: "Where to Watch",
    description:
      "Streaming availability, trailers, and cast info on every title page.",
  },
];

const testimonials = [
  {
    name: "Alex",
    initial: "A",
    text: "Finally stopped arguing about what to watch. Vover solved movie night.",
    stars: 5,
  },
  {
    name: "Maria",
    initial: "M",
    text: "My friends' recommendations beat Netflix's suggestions every single time.",
    stars: 5,
  },
  {
    name: "João",
    initial: "J",
    text: "Love seeing what my friends are watching. Always find something great.",
    stars: 5,
  },
];

const steps = [
  {
    step: "1",
    icon: Film,
    title: "Search & Save",
    desc: "Search millions of movies and TV shows. Add them to your watchlist instantly.",
  },
  {
    step: "2",
    icon: Users,
    title: "Connect Friends",
    desc: "Add your friends. See what they're watching and what they'd recommend.",
  },
  {
    step: "3",
    icon: Sparkles,
    title: "Get Recommendations",
    desc: "Send and receive picks. Agree on what to watch next in seconds.",
  },
];

export async function LandingPage() {
  let trending: TMDBMediaItem[] = [];
  let heroBackdrop: string | null = null;

  try {
    const data = await getTrending("all", "week");
    const results = data.results.filter(
      (r) => r.media_type === "movie" || r.media_type === "tv"
    );
    trending = results.slice(0, 8);
    // Pick a backdrop from a highly-rated item with a backdrop
    const withBackdrop = results.filter(r => r.backdrop_path && r.vote_average > 7);
    heroBackdrop = withBackdrop.length > 0 ? backdropUrl(withBackdrop[0].backdrop_path) : null;
  } catch {
    // TMDB unavailable
  }

  return (
    <div className="flex flex-col">
      {/* ── Cinematic Hero ───────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] overflow-hidden flex items-center justify-center px-4">
        {/* Backdrop image with heavy gradient */}
        {heroBackdrop && (
          <div className="absolute inset-0 -z-20">
            <Image
              src={heroBackdrop}
              alt="Featured film"
              fill
              className="object-cover object-center opacity-25"
              priority
            />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background/50 via-background/80 to-background" />
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-1/4 h-[600px] w-[800px] -translate-x-1/2 rounded-full bg-primary/10 blur-[120px]" />
        </div>

        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="animate-fade-in mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
            <Play className="h-3 w-3 fill-primary" />
            Social movie &amp; TV recommendations
          </div>

          <h1
            className="animate-slide-up mb-6 text-5xl font-extrabold tracking-tight leading-[1.05] md:text-7xl lg:text-8xl"
            style={{ animationDelay: "80ms" }}
          >
            Stop scrolling.
            <br />
            <span className="text-gradient">Start watching.</span>
          </h1>

          <p
            className="animate-slide-up mx-auto mb-10 max-w-xl text-lg text-muted-foreground md:text-xl"
            style={{ animationDelay: "160ms" }}
          >
            Vover connects you and your friends around movies and TV. Share what
            you love, discover what they&apos;re watching, and always know what
            to put on next.
          </p>

          <div
            className="animate-slide-up flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
            style={{ animationDelay: "240ms" }}
          >
            <Link href="/auth">
              <Button
                size="lg"
                className="gap-2 px-8 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                size="lg"
                variant="outline"
                className="px-8 text-base border-border/50 hover:border-primary/50 hover:bg-primary/5"
              >
                Sign In
              </Button>
            </Link>
          </div>

          {/* Trust signals */}
          <div
            className="animate-fade-in mt-12 flex flex-wrap justify-center gap-4 text-xs text-muted-foreground"
            style={{ animationDelay: "360ms" }}
          >
            {["No credit card required", "Free forever", "Magic link sign-in"].map((t) => (
              <span key={t} className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trending Preview ─────────────────────────────────────────── */}
      {trending.length > 0 && (
        <section className="px-4 pb-24">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-bold">Trending This Week</h2>
              </div>
              <div className="ml-auto hidden text-sm text-muted-foreground sm:block">
                Sign in to save to your watchlist →
              </div>
            </div>
            <div className="animate-stagger grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
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

      {/* ── Features Grid ────────────────────────────────────────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-extrabold tracking-tight md:text-4xl">
              Everything for better movie nights
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Vover brings your social circle into your movie-watching life — with the tools you actually need.
            </p>
          </div>

          <div className="animate-stagger grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="group rounded-2xl border border-border/50 bg-card p-5 transition-all duration-300 hover:border-primary/40 hover:bg-card/80 hover:shadow-xl hover:shadow-primary/8 hover:-translate-y-1"
                >
                  <div className="mb-3 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary transition-colors group-hover:bg-primary/20">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mb-1.5 font-semibold text-[15px]">{feature.title}</h3>
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
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-3xl border border-border/50 bg-card/50 p-8 md:p-14">
            {/* Subtle glow */}
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/6 blur-[100px]" />
            </div>
            <div className="mb-10 text-center">
              <h2 className="mb-3 text-3xl font-extrabold tracking-tight">How Vover works</h2>
              <p className="text-muted-foreground">Three steps to better movie nights</p>
            </div>

            <div className="animate-stagger grid gap-8 md:grid-cols-3">
              {steps.map((step) => {
                const Icon = step.icon;
                return (
                  <div key={step.step} className="group flex flex-col items-center text-center gap-4">
                    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 border border-primary/20 text-primary transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/40 group-hover:scale-105">
                      <Icon className="h-7 w-7" />
                      <span className="absolute -top-2.5 -right-2.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground shadow-lg">
                        {step.step}
                      </span>
                    </div>
                    <div>
                      <h3 className="mb-1.5 font-bold">{step.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────── */}
      <section className="px-4 pb-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <h2 className="mb-2 text-3xl font-extrabold tracking-tight">Join your friends on Vover</h2>
            <p className="text-muted-foreground">Real people, real recommendations</p>
          </div>

          <div className="animate-stagger grid gap-4 md:grid-cols-3">
            {testimonials.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="mb-3 flex gap-0.5">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground/80 leading-relaxed mb-4">
                  &ldquo;{t.text}&rdquo;
                </p>
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-primary font-bold text-sm border border-primary/20">
                    {t.initial}
                  </div>
                  <span className="text-sm font-semibold">{t.name}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────── */}
      <section className="px-4 pb-28">
        <div className="mx-auto max-w-2xl text-center">
          <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-b from-primary/10 to-primary/5 p-12">
            <div className="pointer-events-none absolute inset-0 -z-10">
              <div className="absolute left-1/2 top-1/2 h-[300px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-[80px]" />
            </div>
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/15 border border-primary/25">
              <Heart className="h-7 w-7 text-primary" />
            </div>
            <h2 className="mb-3 text-3xl font-extrabold tracking-tight">Ready to watch better?</h2>
            <p className="mb-8 text-muted-foreground max-w-sm mx-auto">
              Join Vover for free. Sign in with a magic link — no password required.
            </p>
            <Link href="/auth">
              <Button
                size="lg"
                className="gap-2 px-10 text-base font-semibold shadow-lg shadow-primary/30 hover:shadow-primary/50 hover:-translate-y-0.5"
              >
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
