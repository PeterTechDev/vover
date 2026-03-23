import { Mail } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function VerifyPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
        </div>
        <h1 className="text-2xl font-bold mb-2">Check your email</h1>
        <p className="text-muted-foreground mb-6">
          A sign-in link has been sent to your email address. Click the link to sign in.
        </p>
        <Link href="/auth">
          <Button variant="outline">Back to sign in</Button>
        </Link>
      </div>
    </div>
  );
}
