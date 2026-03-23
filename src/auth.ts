import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Resend from "next-auth/providers/resend";
import Google from "next-auth/providers/google";
import { db } from "@/db";
import { users, accounts, sessions, verificationTokens } from "@/db/schema";
import { ensureProfile } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: DrizzleAdapter(db, {
    usersTable: users,
    accountsTable: accounts,
    sessionsTable: sessions,
    verificationTokensTable: verificationTokens,
  }),
  providers: [
    Resend({
      apiKey: process.env.RESEND_API_KEY,
      from: process.env.EMAIL_FROM || "Vover <onboarding@resend.dev>",
      async sendVerificationRequest({ identifier, url, provider }) {
        // Log the URL for debugging
        console.log("[AUTH_DEBUG] Magic link URL:", url);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { host: _host } = new URL(url);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to: identifier,
            subject: `Sign in to Vover`,
            html: `<body style="background:#0a0a0a;padding:40px"><div style="max-width:400px;margin:0 auto;text-align:center"><h1 style="color:#0bbf7a;font-size:24px">Vover</h1><p style="color:#ccc">Click below to sign in</p><a href="${url}" style="display:inline-block;background:#0bbf7a;color:#000;padding:12px 32px;border-radius:8px;text-decoration:none;font-weight:bold;margin:20px 0">Sign In</a><p style="color:#666;font-size:12px">If you didn't request this, ignore this email.</p></div></body>`,
            text: `Sign in to Vover: ${url}`,
          }),
        });
        if (!res.ok) throw new Error("Resend error: " + JSON.stringify(await res.json()));
      },
    }),
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          }),
        ]
      : []),
  ],
  callbacks: {
    session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user }) {
      // Ensure a profile row exists for the user
      if (user.id && user.email) {
        await ensureProfile(user.id, user.email, user.name ?? undefined);
      }
      return true;
    },
  },
  pages: {
    signIn: "/auth",
    verifyRequest: "/auth/verify",
    error: "/auth/error",
  },
  session: {
    strategy: "database",
  },
  debug: true,
});
