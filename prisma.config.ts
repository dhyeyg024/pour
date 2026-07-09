import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Prisma 7: DB connection lives here, not in schema.prisma
// DIRECT_URL bypasses PgBouncer pooler — required for migrations
export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    url: env("DIRECT_URL")  // direct connection for CLI / migrations
  }
});

