/**
 * NextAuth handles its own callback at /api/auth/callback/[provider].
 * This route is kept for backward compatibility with any old magic links.
 * Redirect users to the home page if they land here.
 */
import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"));
}
