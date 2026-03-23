"use client";

import { useSearchParams } from "next/navigation";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Suspense } from "react";

function ErrorContent() {
  const params = useSearchParams();
  const error = params.get("error");

  const messages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The sign-in link may have expired or already been used. Please request a new one.",
    Default: "An unexpected error occurred. Please try again.",
  };

  const message = error ? (messages[error] ?? messages.Default) : messages.Default;

  return (
    <div className="w-full max-w-md text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
      </div>
      <h1 className="text-2xl font-bold mb-2">Sign-in error</h1>
      <p className="text-muted-foreground mb-6">{message}</p>
      <Link href="/auth">
        <Button>Try again</Button>
      </Link>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <Suspense fallback={<div>Loading…</div>}>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
