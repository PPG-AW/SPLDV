import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students, tutorAlerts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { getClassLocked } from "@/lib/server-helpers";

export const dynamic = "force-dynamic";

// Polling ringan HP siswa: kunci layar + panggilan tutor + daftar kelas
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key") ?? "";
  const isLocked = await getClassLocked();

  const alerts = key
    ? await db
        .select()
        .from(tutorAlerts)
        .where(and(eq(tutorAlerts.tutorKey, key), eq(tutorAlerts.status, "open")))
        .orderBy(desc(tutorAlerts.id))
        .limit(3)
    : [];

  // daftar teman sekelas (tanpa admin)
  const members = await db
    .select()
    .from(students)
    .where(eq(students.isAdmin, false))
    .orderBy(desc(students.level), desc(students.totalCorrect))
    .limit(30);

  const now = Date.now();
  const kelas = members.map((m, i) => ({
    key: m.studentKey,
    name: m.name,
    level: m.level,
    status: m.status,
    isTutor: i === 0,
    isMe: m.studentKey === key,
    online: now - new Date(m.lastActiveAt).getTime() < 3 * 60 * 1000,
  }));

  return NextResponse.json({ ok: true, isLocked, alerts, kelas });
}
