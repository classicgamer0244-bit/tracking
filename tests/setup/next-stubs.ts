import { vi } from "vitest";

// Server actions call revalidatePath/headers, which require Next's request-scoped
// AsyncLocalStorage context. Stub them so actions are testable outside of a real
// request (a real Next.js server always provides this at runtime).
vi.mock("next/cache", () => ({
  revalidatePath: () => {},
}));

vi.mock("next/headers", () => ({
  headers: async () => new Headers({ "x-forwarded-for": "127.0.0.1" }),
}));
