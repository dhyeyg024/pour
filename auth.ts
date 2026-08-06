import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

// ── TEMPORARY: Hardcoded reviewer credentials for Razorpay review process ───
// REVERT: Remove these two constants and the password-based auth block below
//         once Razorpay approves the website.
const REVIEWER_EMAIL    = "test.dev@gmail.com";
const REVIEWER_PASSWORD = "Razorpay@222";
// ────────────────────────────────────────────────────────────────────────────

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email:    { label: "Email",    type: "email" },
        otp:      { label: "OTP",      type: "text"  },
        // REVERT: Remove this `password` field once Razorpay approves.
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email) return null;
        const emailStr = String(credentials.email).toLowerCase();

        // ── TEMPORARY: Password-based path for Razorpay reviewer ────────────
        // REVERT: Remove this entire if-block once Razorpay approves.
        if (credentials?.password) {
          if (
            emailStr !== REVIEWER_EMAIL ||
            String(credentials.password) !== REVIEWER_PASSWORD
          ) {
            return null;
          }

          // Find or create the static reviewer account
          let reviewer = await db.user.findUnique({ where: { email: emailStr } });
          if (!reviewer) {
            reviewer = await db.user.create({
              data: { email: emailStr, name: "Razorpay Reviewer" },
            });
          }
          return {
            id: reviewer.id,
            name: reviewer.name,
            email: reviewer.email,
            image: reviewer.image,
          };
        }
        // ────────────────────────────────────────────────────────────────────

        // ── Existing OTP path (unchanged) ────────────────────────────────────
        if (!credentials?.otp) return null;

        // Find the valid OTP for this email
        const tokenRecord = await db.verificationToken.findFirst({
          where: {
            identifier: emailStr,
            token: String(credentials.otp),
          },
        });

        if (!tokenRecord) return null;

        if (tokenRecord.expires < new Date()) {
          // Token expired, delete it
          await db.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: emailStr,
                token: tokenRecord.token,
              },
            },
          });
          return null;
        }

        // OTP is valid. Delete it so it can't be reused.
        await db.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: emailStr,
              token: tokenRecord.token,
            },
          },
        });

        // Find or create the user
        let user = await db.user.findUnique({ where: { email: emailStr } });
        if (!user) {
          user = await db.user.create({ data: { email: emailStr } });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
});
