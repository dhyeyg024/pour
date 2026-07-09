"use client";

// lib/auth.tsx — thin wrapper around NextAuth's useSession
// Keeps the same useAuth() API so components don't need to change.

import { useSession, signOut } from "next-auth/react";

export type User = {
  id: string;
  name: string;
  email: string;
  avatar: string; // two-letter initials
};

function getAvatar(name?: string | null): string {
  if (!name) return "??";
  return name
    .trim()
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function useAuth() {
  const { data: session, status } = useSession();

  const user: User | null = session?.user
    ? {
        id: session.user.id,
        name: session.user.name ?? "",
        email: session.user.email ?? "",
        avatar: getAvatar(session.user.name)
      }
    : null;

  return {
    user,
    status, // "loading" | "authenticated" | "unauthenticated"
    logout: () => signOut({ callbackUrl: "/" })
  };
}
