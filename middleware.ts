export { auth as middleware } from "@/auth";

export const config = {
  matcher: [
    // Skip NextAuth API routes, static files, images
    "/((?!api/auth|_next/static|_next/image|favicon.ico|icons|manifest.json|sw.js).*)",
  ],
};
