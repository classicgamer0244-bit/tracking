"use server";

import { signOut } from "@/auth";

export async function signOutAction() {
  // No redirectTo here — the client does a hard navigation after this resolves
  // (see shell.tsx) so per-user client state (SWR caches, etc.) is fully reset
  // rather than persisted across a soft client-side route change.
  await signOut({ redirect: false });
}
