import { NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs, students, tutorAlerts } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { getClassLocked } from "@/lib/server-helpers";
import { LEVELS } from "@/lib/levels";

export const dynamic = "force-dynamic";

export async function GET() {
  const isLocked = await getClassLocked();

  const allStudents = await db
    .select()
    .from(students)
    .where(eq(students.isAdmin, false))
    .orderBy(desc(students.level), desc(students.totalCorrect));

  const openAlerts = await db
    .select()
    .from(tutorAlerts)
    .where(eq(tutorAlerts.status, "open"))
    .orderBy(desc(tutorAlerts.id))
    .limit(20);

  const recentLogs = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.id))
    .limit(400);

  // Hotspot miskonsepsi per level
  const errCount = new Map<string, { n: number; level: number; who: Set<string> }>();
  let okCount = 0;
  for (const l of recentLogs) {
    if (l.isCorrect) {
      okCount++;
      continue;
    }
    const cur = errCount.get(l.subId) ?? { n: 0, level: l.level, who: new Set() };
    cur.n++;
    cur.who.add(l.studentKey);
    errCount.set(l.subId, cur);
  }
  const hotspots = [...errCount.entries()]
    .map(([subId, v]) => ({
      subId,
      level: v.level,
      errors: v.n,
      students: v.who.size,
    }))
    .sort((a, b) => b.errors - a.errors)
    .slice(0, 5);

  const dist = Array.from({ length: LEVELS.length }, (_, i) => ({
    level: i + 1,
    count: 0,
  }));
  for (const s of allStudents) {
    const li = Math.min(Math.max(s.level, 1), LEVELS.length) - 1;
    dist[li].count++;
  }

  const now = Date.now();
  const active = allStudents.filter(
    (s) => now - new Date(s.lastActiveAt).getTime() < 10 * 60 * 1000
  ).length;
  const stuck = allStudents.filter((s) => s.status === "MACET").length;

  return NextResponse.json({
    ok: true,
    isLocked,
    students: allStudents,
    openAlerts,
    hotspots,
    dist,
    totals: {
      students: allStudents.length,
      active,
      stuck,
      submissions: recentLogs.length,
      accuracy:
        recentLogs.length > 0 ? Math.round((okCount / recentLogs.length) * 100) : 0,
    },
  });
}
