import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

// Database hosted (Neon/Supabase/Vercel Postgres/dsb.) wajib SSL, lokal tidak.
const isLocal = /localhost|127\.0\.0\.1|::1/.test(databaseUrl);

const globalForDb = globalThis as typeof globalThis & {
  __kartesiaPool?: Pool;
  __kartesiaTablesEnsured?: boolean;
};

export const pool =
  globalForDb.__kartesiaPool ??
  new Pool({
    connectionString: databaseUrl,
    ssl: isLocal ? undefined : { rejectUnauthorized: false },
    max: 5,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__kartesiaPool = pool;
}

export const db = drizzle(pool);

/**
 * Otomatis membuat tabel database jika belum ada.
 * Sehingga pengguna tidak perlu menjalankan `drizzle-kit push` manual di terminal.
 */
export async function ensureTables() {
  if (globalForDb.__kartesiaTablesEnsured) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS students (
        id SERIAL PRIMARY KEY,
        student_key VARCHAR(120) NOT NULL UNIQUE,
        name VARCHAR(120) NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT false,
        level INTEGER NOT NULL DEFAULT 1,
        consecutive_errors INTEGER NOT NULL DEFAULT 0,
        total_correct INTEGER NOT NULL DEFAULT 0,
        total_answered INTEGER NOT NULL DEFAULT 0,
        status VARCHAR(12) NOT NULL DEFAULT 'AKTIF',
        last_active_at TIMESTAMP NOT NULL DEFAULT NOW(),
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS activity_logs (
        id SERIAL PRIMARY KEY,
        student_key VARCHAR(120) NOT NULL,
        name VARCHAR(120) NOT NULL,
        level INTEGER NOT NULL,
        sub_id VARCHAR(8) NOT NULL,
        is_correct BOOLEAN NOT NULL,
        consecutive_errors INTEGER NOT NULL DEFAULT 0,
        error_detail TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS class_state (
        id SERIAL PRIMARY KEY,
        is_locked BOOLEAN NOT NULL DEFAULT false,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS tutor_alerts (
        id SERIAL PRIMARY KEY,
        from_key VARCHAR(120) NOT NULL,
        from_name VARCHAR(120) NOT NULL,
        tutor_key VARCHAR(120),
        tutor_name VARCHAR(120),
        level INTEGER NOT NULL,
        sub_id VARCHAR(8) NOT NULL,
        sub_title VARCHAR(140) NOT NULL,
        kind VARCHAR(8) NOT NULL DEFAULT 'auto',
        message TEXT NOT NULL,
        status VARCHAR(8) NOT NULL DEFAULT 'open',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        acked_at TIMESTAMP
      );
    `);
    globalForDb.__kartesiaTablesEnsured = true;
  } catch (err) {
    console.error("Auto-create tables error:", err);
  }
}
