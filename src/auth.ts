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
      from: process.env.EMAIL_FROM || "Vover <noreply@vover.app>",
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
});
