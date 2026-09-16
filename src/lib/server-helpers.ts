import { db } from "@/db";
import { classState, students } from "@/db/schema";
import { and, desc, eq, ne } from "drizzle-orm";

/** Nama dinormalisasi menjadi kunci identitas siswa. */
export function toKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

/** Proteksi dasbor guru. Aktif hanya jika env GURU_PIN diatur. */
export function guruAuthorized(req: Request): boolean {
  const pin = process.env.GURU_PIN;
  if (!pin) return true; // tanpa PIN → terbuka (mode lokal/demo)
  return req.headers.get("x-guru-pin") === pin;
}

export function isAdminName(name: string): boolean {
  return toKey(name) === "admin";
}

import { ensureTables } from "@/db";

export async function getClassLocked(): Promise<boolean> {
  await ensureTables();
  const rows = await db.select().from(classState).limit(1);
  if (rows.length === 0) {
    await db.insert(classState).values({ isLocked: false });
    return false;
  }
  return rows[0].isLocked;
}

export async function setClassLocked(isLocked: boolean) {
  const rows = await db.select().from(classState).limit(1);
  if (rows.length === 0) {
    await db.insert(classState).values({ isLocked });
  } else {
    await db
      .update(classState)
      .set({ isLocked, updatedAt: new Date() })
      .where(eq(classState.id, rows[0].id));
  }
}

/** Tutor kelas = siswa (bukan admin) dengan capaian level tertinggi. */
export async function pickTutor(excludeKey: string) {
  const rows = await db
    .select()
    .from(students)
    .where(and(ne(students.studentKey, excludeKey), eq(students.isAdmin, false)))
    .orderBy(desc(students.level), desc(students.totalCorrect))
    .limit(1);
  return rows[0] ?? null;
}
