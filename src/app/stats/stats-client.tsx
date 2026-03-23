"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getWatched } from "@/lib/db-client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Film, Tv, Clock, Star, TrendingUp, Award, BarChart2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WatchedItem {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  title: string;
  poster_path: string | null;
  rating: number | null;
  watched_at: string;
}

// Average runtime estimates
const AVG_MOVIE_MINUTES = 100;
const AVG_TV_EP_MINUTES = 42;

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border/50 bg-card p-6 transition-all duration-300 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-0.5">
      <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-2.5 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="text-3xl font-extrabold tabular-nums tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-sm font-medium text-foreground/70">{label}</div>
      {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

const RATING_COLORS = [
  "hsl(0 84% 60%)",
  "hsl(20 90% 55%)",
  "hsl(45 95% 55%)",
  "hsl(100 70% 45%)",
  "hsl(164 84% 40%)",
];

const CHART_COLOR = "hsl(164, 84%, 40%)";

export function StatsClient() {
  const { data: session, status } = useSession();
  const userId = session?.user?.id ?? null;
  const [watched, setWatched] = useState<WatchedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "loading") return;
    if (!userId) { setLoading(false); return; }
    getWatched(userId).then(({ data }) => {
      setWatched((data || []) as WatchedItem[]);
    }).finally(() => setLoading(false));
  }, [userId, status]);

  if (status !== "loading" && !userId) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <BarChart2 className="mx-auto mb-4 h-16 w-16 text-primary/30" />
          <h2 className="mb-2 text-xl font-bold">Sign in to see your stats</h2>
          <p className="mb-6 text-muted-foreground">Track your watching history to unlock insights.</p>
          <Link href="/auth">
            <Button>Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8 h-8 w-40 rounded-lg animate-shimmer" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-32 rounded-2xl animate-shimmer" />
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="h-64 rounded-2xl animate-shimmer" />
          <div className="h-64 rounded-2xl animate-shimmer" />
        </div>
      </div>
    );
  }

  // Compute stats
  const movies = watched.filter(w => w.media_type === "movie");
  const tvShows = watched.filter(w => w.media_type === "tv");
  const totalHours = Math.round(
    (movies.length * AVG_MOVIE_MINUTES + tvShows.length * AVG_TV_EP_MINUTES) / 60
  );
  const ratings = watched.filter(w => w.rating != null).map(w => w.rating as number);
  const avgRating = ratings.length > 0
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : "—";

  // Rating distribution
  const ratingDist = [1, 2, 3, 4, 5].map(r => ({
    rating: `${r}★`,
    count: ratings.filter(x => x === r).length,
    fill: RATING_COLORS[r - 1],
  }));

  // Monthly activity (last 12 months)
  const now = new Date();
  const monthlyData: { month: string; count: number }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = d.toLocaleString("en", { month: "short", year: "2-digit" });
    const count = watched.filter(w => {
      const wd = new Date(w.watched_at);
      return wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear();
    }).length;
    monthlyData.push({ month: label, count });
  }

  // Movie vs TV split for pie
  const splitData = [
    { name: "Movies", value: movies.length, fill: CHART_COLOR },
    { name: "TV Shows", value: tvShows.length, fill: "hsl(198 80% 50%)" },
  ].filter(d => d.value > 0);

  const isEmpty = watched.length === 0;

  if (isEmpty) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <Film className="mx-auto mb-4 h-16 w-16 text-primary/30" />
          <h2 className="mb-2 text-xl font-bold">No stats yet</h2>
          <p className="mb-6 text-muted-foreground text-sm">
            Start marking movies and TV shows as watched to see your personal stats here.
          </p>
          <Link href="/">
            <Button>Browse Trending</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl animate-fade-in px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <BarChart2 className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl">Your Stats</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          {watched.length} titles tracked · all time
        </p>
      </div>

      {/* Stat cards */}
      <div className="mb-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard
          icon={Film}
          label="Movies Watched"
          value={movies.length}
        />
        <StatCard
          icon={Tv}
          label="TV Shows Watched"
          value={tvShows.length}
        />
        <StatCard
          icon={Clock}
          label="Hours Watched"
          value={totalHours.toLocaleString()}
          sub="approximate"
        />
        <StatCard
          icon={Star}
          label="Avg Rating"
          value={avgRating}
          sub={`${ratings.length} rated`}
        />
      </div>

      {/* Charts row */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly activity */}
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Monthly Activity
            </h2>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }}
                axisLine={false}
                tickLine={false}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(222 22% 10%)",
                  border: "1px solid hsl(222 20% 18%)",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "hsl(220 15% 92%)",
                }}
                cursor={{ fill: "hsl(222 20% 18%)" }}
              />
              <Bar dataKey="count" fill={CHART_COLOR} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Rating distribution */}
        <div className="rounded-2xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Award className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Rating Distribution
            </h2>
          </div>
          {ratings.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={ratingDist} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="rating"
                  tick={{ fontSize: 12, fill: "hsl(220 10% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "hsl(220 10% 50%)" }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(222 22% 10%)",
                    border: "1px solid hsl(222 20% 18%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                    color: "hsl(220 15% 92%)",
                  }}
                  cursor={{ fill: "hsl(222 20% 18%)" }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {ratingDist.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
              No ratings yet — start rating what you watch
            </div>
          )}
        </div>
      </div>

      {/* Movie vs TV split */}
      {splitData.length === 2 && (
        <div className="mt-6 rounded-2xl border border-border/50 bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">
              Movies vs TV Shows
            </h2>
          </div>
          <div className="flex flex-col items-center gap-6 sm:flex-row">
            <div className="flex-shrink-0">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie
                    data={splitData}
                    cx="50%"
                    cy="50%"
                    innerRadius={48}
                    outerRadius={72}
                    strokeWidth={0}
                    dataKey="value"
                  >
                    {splitData.map((entry, index) => (
                      <Cell key={index} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-6 sm:flex-col sm:gap-4">
              {splitData.map((item) => (
                <div key={item.name} className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: item.fill }}
                  />
                  <div>
                    <div className="text-lg font-bold tabular-nums">{item.value}</div>
                    <div className="text-xs text-muted-foreground">{item.name}</div>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full flex-shrink-0 bg-border" />
                <div>
                  <div className="text-lg font-bold tabular-nums">{watched.length}</div>
                  <div className="text-xs text-muted-foreground">Total</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
