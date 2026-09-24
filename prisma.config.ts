import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";

loadEnv({ path: ".env.local" });
loadEnv();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Direct (non-pooled) connection — required for Prisma Migrate/DDL.
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
  },
});
