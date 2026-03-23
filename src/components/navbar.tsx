"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Film, List, Eye, Rss, User, Menu, Sparkles,
  LogIn, LogOut, ListChecks, BarChart2, ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/", label: "Discover", icon: Film },
  { href: "/recommendations", label: "For You", icon: Sparkles },
  { href: "/watchlist", label: "Watchlist", icon: List },
  { href: "/lists", label: "Lists", icon: ListChecks },
  { href: "/watched", label: "Watched", icon: Eye },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/stats", label: "Stats", icon: BarChart2 },
];

const authLinks = [
  { href: "/", label: "Discover", icon: Film },
  { href: "/feed", label: "Feed", icon: Rss },
  { href: "/stats", label: "Stats", icon: BarChart2 },
];

function getInitials(name: string | null | undefined, email: string | null | undefined): string {
  if (name) {
    return name
      .split(" ")
      .map((n) => n[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  }
  if (email) return email[0].toUpperCase();
  return "U";
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();

  const user = session?.user ?? null;
  const authLoaded = status !== "loading";

  async function handleSignOut() {
    await signOut({ redirect: false });
    router.push("/");
    setOpen(false);
  }

  const links = user ? navLinks : authLinks;
  const initials = getInitials(user?.name, user?.email);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-border/30 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/"
          className="group flex items-center gap-2 transition-all duration-200 hover:opacity-90 hover:scale-[1.02]"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-extrabold text-sm shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-shadow duration-200">
            V
          </div>
          <span className="text-lg font-extrabold tracking-tight">over</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link key={link.href} href={link.href}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "gap-2 text-muted-foreground hover:text-foreground",
                    isActive &&
                      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Desktop right: avatar or sign-in */}
        <div className="hidden items-center gap-2 md:flex">
          {authLoaded && (
            user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-2 px-2 text-muted-foreground hover:text-foreground focus-visible:ring-1 focus-visible:ring-primary"
                    aria-label="User menu"
                  >
                    <Avatar className="h-7 w-7">
                      <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Profile"} />
                      <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {user.name && (
                    <>
                      <div className="px-3 py-2">
                        <p className="text-sm font-medium truncate">{user.name}</p>
                        {user.email && (
                          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                        )}
                      </div>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleSignOut}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : pathname !== "/auth" ? (
              <Link href="/auth">
                <Button size="sm" className="gap-2">
                  <LogIn className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            ) : null
          )}
        </div>

        {/* Mobile hamburger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-64 bg-background">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>

            {/* Mobile user info */}
            {user && (
              <div className="mt-6 mb-2 flex items-center gap-3 px-2 py-3 rounded-lg bg-card/50 border border-border/30">
                <Avatar className="h-9 w-9 flex-shrink-0">
                  <AvatarImage src={user.image ?? undefined} alt={user.name ?? "Profile"} />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  {user.name && (
                    <p className="text-sm font-medium truncate">{user.name}</p>
                  )}
                  {user.email && (
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                  )}
                </div>
              </div>
            )}

            <nav className="mt-4 flex flex-col gap-1">
              {links.map((link) => {
                const Icon = link.icon;
                const isActive =
                  pathname === link.href ||
                  (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                  >
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                        isActive && "bg-primary/10 text-primary hover:text-primary"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Button>
                  </Link>
                );
              })}

              {/* Profile link (logged-in only, mobile) */}
              {user && (
                <Link href="/profile" onClick={() => setOpen(false)}>
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-muted-foreground hover:text-foreground",
                      pathname === "/profile" && "bg-primary/10 text-primary hover:text-primary"
                    )}
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Button>
                </Link>
              )}

              <div className="mt-4 border-t border-border/50 pt-4">
                {user ? (
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={handleSignOut}
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                ) : (
                  <Link href="/auth" onClick={() => setOpen(false)}>
                    <Button className="w-full gap-2">
                      <LogIn className="h-4 w-4" />
                      Sign In
                    </Button>
                  </Link>
                )}
              </div>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
