import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/30 bg-background px-4 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-extrabold text-xs shadow-sm shadow-primary/30">
                V
              </div>
              <span className="font-extrabold text-sm tracking-tight">over</span>
            </div>
            <p className="text-xs text-muted-foreground max-w-[200px] leading-relaxed">
              Watch together, decide faster. Social movie &amp; TV recommendations from friends you trust.
            </p>
          </div>

          {/* Links grid */}
          <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm">
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Explore</p>
              <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">Discover</Link>
              <Link href="/feed" className="text-muted-foreground hover:text-foreground transition-colors">Feed</Link>
              <Link href="/stats" className="text-muted-foreground hover:text-foreground transition-colors">Stats</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Account</p>
              <Link href="/watchlist" className="text-muted-foreground hover:text-foreground transition-colors">Watchlist</Link>
              <Link href="/watched" className="text-muted-foreground hover:text-foreground transition-colors">Watched</Link>
              <Link href="/auth" className="text-muted-foreground hover:text-foreground transition-colors">Sign In</Link>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground/60">Company</p>
              <span className="text-muted-foreground/50 cursor-default select-none">About</span>
              <span className="text-muted-foreground/50 cursor-default select-none">Privacy</span>
              <span className="text-muted-foreground/50 cursor-default select-none">Terms</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 flex flex-col items-center gap-2 border-t border-border/20 pt-6 text-center md:flex-row md:justify-between">
          <p className="text-xs text-muted-foreground/60">
            &copy; {year} Vover. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/40">
            Movie data provided by{" "}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-muted-foreground transition-colors"
            >
              TMDB
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
