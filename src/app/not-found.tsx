import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Film, Home, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-6 px-4 text-center">
      {/* Logo/Icon */}
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Film className="h-10 w-10 text-primary" />
      </div>

      {/* 404 */}
      <div>
        <p className="mb-1 text-sm font-medium uppercase tracking-widest text-primary">
          404
        </p>
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          Nothing to watch here
        </h1>
        <p className="max-w-sm text-muted-foreground">
          This page seems to have fallen off the watchlist. Let&apos;s get you
          back to something worth watching.
        </p>
      </div>

      {/* CTAs */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link href="/">
          <Button size="lg" className="gap-2">
            <Home className="h-4 w-4" />
            Go Home
          </Button>
        </Link>
        <Link href="/search">
          <Button size="lg" variant="outline" className="gap-2 border-border/50">
            <Search className="h-4 w-4" />
            Search Titles
          </Button>
        </Link>
      </div>
    </div>
  );
}
