/**
 * Auth helpers for Vover using NextAuth (Auth.js v5).
 * Server-side: use `auth()` from "@/auth" directly.
 * Client-side: use `useSession()` from "next-auth/react".
 */
import { auth } from "@/auth";

/**
 * Get the current user on the server (Server Components, API routes).
 * Returns null when not authenticated.
 */
export async function getServerUser() {
  const session = await auth();
  return session?.user ?? null;
}

/**
 * Get current session (includes user.id).
 */
export async function getServerSession() {
  return auth();
}
