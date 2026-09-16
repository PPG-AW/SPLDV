import {
  pgTable,
  serial,
  varchar,
  integer,
  boolean,
  timestamp,
  text,
} from "drizzle-orm/pg-core";

// ─── Data siswa: identitas cukup NAMA (studentKey = nama ternormalisasi) ────
export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  studentKey: varchar("student_key", { length: 120 }).notNull().unique(),
  name: varchar("name", { length: 120 }).notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  level: integer("level").notNull().default(1),
  consecutiveErrors: integer("consecutive_errors").notNull().default(0),
  totalCorrect: integer("total_correct").notNull().default(0),
  totalAnswered: integer("total_answered").notNull().default(0),
  status: varchar("status", { length: 12 }).notNull().default("AKTIF"), // AKTIF | MACET | TUNTAS
  lastActiveAt: timestamp("last_active_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

// ─── Telemetri per submisi jawaban ──────────────────────────────────────────
export const activityLogs = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  studentKey: varchar("student_key", { length: 120 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  level: integer("level").notNull(),
  subId: varchar("sub_id", { length: 8 }).notNull(),
  isCorrect: boolean("is_correct").notNull(),
  consecutiveErrors: integer("consecutive_errors").notNull().default(0),
  errorDetail: text("error_detail"),
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

// ─── Kunci layar klasikal (Teacher Focus Lock) ──────────────────────────────
export const classState = pgTable("class_state", {
  id: serial("id").primaryKey(),
  isLocked: boolean("is_locked").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
});

// ─── Panggilan tutor sebaya (berbasis kelas) ────────────────────────────────
export const tutorAlerts = pgTable("tutor_alerts", {
  id: serial("id").primaryKey(),
  fromKey: varchar("from_key", { length: 120 }).notNull(),
  fromName: varchar("from_name", { length: 120 }).notNull(),
  tutorKey: varchar("tutor_key", { length: 120 }),
  tutorName: varchar("tutor_name", { length: 120 }),
  level: integer("level").notNull(),
  subId: varchar("sub_id", { length: 8 }).notNull(),
  subTitle: varchar("sub_title", { length: 140 }).notNull(),
  kind: varchar("kind", { length: 8 }).notNull().default("auto"), // auto | manual
  message: text("message").notNull(),
  status: varchar("status", { length: 8 }).notNull().default("open"), // open | done
  createdAt: timestamp("created_at", { withTimezone: false })
    .defaultNow()
    .notNull(),
  ackedAt: timestamp("acked_at", { withTimezone: false }),
});
