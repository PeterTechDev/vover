"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Mail, Check, Film, Sparkles, Users, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

const perks = [
  { icon: Sparkles, text: "Friend recommendations" },
  { icon: List, text: "Personal watchlist" },
  { icon: Users, text: "See what friends watch" },
];

export function AuthForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn("resend", {
        email: email.trim(),
        redirect: false,
        callbackUrl: "/",
      });
      if (result?.error) {
        setError("Failed to send magic link. Please try again.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    }
    setLoading(false);
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <Film className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-primary">V</span>over
            </span>
          </Link>
          <h1 className="text-2xl font-bold mb-1">
            {sent ? "Check your inbox" : "Sign in to Vover"}
          </h1>
          <p className="text-muted-foreground text-sm">
            {sent
              ? `We sent a magic link to ${email}`
              : "No password needed. We'll email you a magic link."}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card p-8 shadow-2xl shadow-black/20">
          {sent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold mb-1">Magic link sent</h2>
                <p className="text-sm text-muted-foreground">
                  Click the link in your email to sign in. You can close this tab.
                </p>
              </div>
              <Button
                variant="ghost"
                className="mt-2 text-sm text-muted-foreground"
                onClick={() => setSent(false)}
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-11"
                    required
                    autoFocus
                  />
                </div>
                {error && (
                  <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
                    {error}
                  </p>
                )}
                <Button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="h-11 w-full font-semibold"
                >
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>

              <div className="mt-6 border-t border-border/50 pt-6">
                <p className="mb-3 text-center text-xs text-muted-foreground">
                  What you get with Vover
                </p>
                <div className="flex flex-col gap-2">
                  {perks.map((perk) => {
                    const Icon = perk.icon;
                    return (
                      <div
                        key={perk.text}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Icon className="h-4 w-4 text-primary flex-shrink-0" />
                        {perk.text}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in, you agree to our terms of service.
        </p>
      </div>
    </div>
  );
}
