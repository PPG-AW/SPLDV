import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // Lokal: berasal dari .env — Produksi: isi DATABASE_URL di shell/CI
    // contoh: DATABASE_URL="postgresql://...neon.tech/..." npx drizzle-kit push
    url:
      process.env.DATABASE_URL ??
      "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
  },
});
