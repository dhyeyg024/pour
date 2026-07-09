// This file is the NextAuth v5 type augmentation.
// Extends the default Session to include user.id (from JWT).
import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
