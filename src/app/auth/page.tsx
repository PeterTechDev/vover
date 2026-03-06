"use client";

import { useState } from "react";
import { signInWithMagicLink } from "@/lib/auth";
import { Mail, Check, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AuthPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await signInWithMagicLink(email.trim());
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Film className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-primary">V</span>over
            </span>
          </div>
          <p className="text-muted-foreground text-sm">
            Watch together. Decide faster.
          </p>
        </div>

        <div className="rounded-xl border border-border/50 bg-card p-6">
          {sent ? (
            <div className="flex flex-col items-center gap-3 py-4 text-center">
              <div className="rounded-full bg-primary/10 p-3">
                <Check className="h-6 w-6 text-primary" />
              </div>
              <h2 className="font-semibold">Check your email</h2>
              <p className="text-sm text-muted-foreground">
                We sent a magic link to <span className="text-foreground font-medium">{email}</span>.
                Click it to sign in.
              </p>
            </div>
          ) : (
            <>
              <h2 className="font-semibold mb-1">Sign in</h2>
              <p className="text-sm text-muted-foreground mb-5">
                No password. We&apos;ll send you a magic link.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                    autoFocus
                  />
                </div>
                {error && <p className="text-sm text-destructive">{error}</p>}
                <Button type="submit" disabled={loading || !email.trim()} className="w-full">
                  {loading ? "Sending..." : "Send Magic Link"}
                </Button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
