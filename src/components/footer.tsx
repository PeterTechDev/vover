import Link from "next/link";
import { Film } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-background/50 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-4 text-center md:flex-row md:justify-between md:text-left">
          {/* Brand */}
          <div className="flex items-center gap-2">
            <Film className="h-4 w-4 text-primary" />
            <span className="font-semibold">
              <span className="text-primary">V</span>over
            </span>
            <span className="text-xs text-muted-foreground">
              — Watch together, decide faster
            </span>
          </div>

          {/* Links */}
          <nav className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground transition-colors">
              Discover
            </Link>
            <Link href="/auth" className="hover:text-foreground transition-colors">
              Sign In
            </Link>
          </nav>

          {/* Copyright */}
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Vover. Powered by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
}
