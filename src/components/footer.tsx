import Link from "next/link";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-auto border-t border-border/30 bg-background px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-extrabold text-xs shadow-sm shadow-primary/30">
              V
            </div>
            <span className="font-extrabold text-sm tracking-tight">over</span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              · Watch together, decide faster
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-5 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">Discover</Link>
            <Link href="/stats" className="hover:text-foreground transition-colors">Stats</Link>
            <Link href="/feed" className="hover:text-foreground transition-colors">Feed</Link>
            <Link href="/auth" className="hover:text-foreground transition-colors">Sign In</Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {year} Vover · Data from TMDB
          </p>
        </div>
      </div>
    </footer>
  );
}
