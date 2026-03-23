import Link from "next/link";
import { Film, WifiOff, RefreshCw } from "lucide-react";

export const metadata = {
  title: "You're offline | Vover",
};

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 text-center">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/4 blur-3xl" />
      </div>

      <div className="mb-6 relative">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <WifiOff className="h-9 w-9 text-muted-foreground" />
        </div>
        <div className="absolute -bottom-1 -right-1 h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Film className="h-3.5 w-3.5 text-primary" />
        </div>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">You&apos;re offline</h1>
      <p className="text-muted-foreground text-sm max-w-xs leading-relaxed mb-8">
        Vover needs an internet connection to load your feed and recommendations.
        Check your connection and try again.
      </p>

      <div className="flex flex-col gap-3 w-full max-w-xs">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </Link>
        <p className="text-xs text-muted-foreground">
          Your watchlist and ratings are saved when you&apos;re back online.
        </p>
      </div>
    </div>
  );
}
