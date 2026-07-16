import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "@/lib/db";

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.otp) return null;
        const emailStr = String(credentials.email).toLowerCase();

        // Find the valid OTP for this email
        const tokenRecord = await db.verificationToken.findFirst({
          where: {
            identifier: emailStr,
            token: String(credentials.otp)
          }
        });

        if (!tokenRecord) return null;

        if (tokenRecord.expires < new Date()) {
          // Token expired, delete it
          await db.verificationToken.delete({
            where: {
              identifier_token: {
                identifier: emailStr,
                token: tokenRecord.token,
              }
            }
          });
          return null;
        }

        // OTP is valid. Delete it so it can't be reused.
        await db.verificationToken.delete({
          where: {
            identifier_token: {
              identifier: emailStr,
              token: tokenRecord.token,
            }
          }
        });

        // Find or create the user
        let user = await db.user.findUnique({
          where: { email: emailStr }
        });

        if (!user) {
          user = await db.user.create({
            data: {
              email: emailStr,
            }
          });
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image
        };
      }
    })
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) token.id = user.id;
      return token;
    },
    session({ session, token }) {
      if (token?.id) session.user.id = token.id as string;
      return session;
    }
  },
  pages: {
    signIn: "/login"
  }
});
