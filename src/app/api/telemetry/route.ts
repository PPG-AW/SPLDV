import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { activityLogs, students, tutorAlerts } from "@/db/schema";
import { and, desc, eq } from "drizzle-orm";
import { pickTutor } from "@/lib/server-helpers";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const studentKey = String(b.studentKey ?? "");
    if (!studentKey) return NextResponse.json({ ok: false }, { status: 400 });

    const isAdmin = !!b.isAdmin;
    const qLevel = Number(b.qLevel ?? 1);
    const qSubId = String(b.qSubId ?? "1.1");
    const isCorrect = !!b.isCorrect;
    const consecutiveErrors = Number(b.consecutiveErrors ?? 0);
    const curLevel = Number(b.curLevel ?? qLevel);
    const tuntas = !!b.tuntas;
    const name = String(b.name ?? "");

    // Admin hanya meninjau materi — tidak dicatat sebagai telemetri kelas
    if (isAdmin) return NextResponse.json({ ok: true, skipped: true });

    await db.insert(activityLogs).values({
      studentKey,
      name,
      level: qLevel,
      subId: qSubId,
      isCorrect,
      consecutiveErrors,
      errorDetail: String(b.errorDetail ?? ""),
    });

    await db
      .update(students)
      .set({
        level: curLevel,
        consecutiveErrors,
        totalCorrect: (b.totalCorrect as number) ?? undefined,
        totalAnswered: (b.totalAnswered as number) ?? undefined,
        lastActiveAt: new Date(),
        status: tuntas ? "TUNTAS" : consecutiveErrors >= 2 ? "MACET" : "AKTIF",
      })
      .where(eq(students.studentKey, studentKey));

    // Auto-alert tutor sebaya bila gagal 2 kali berturut-turut
    let alertRaised = false;
    if (consecutiveErrors >= 2 && !isCorrect) {
      const open = await db
        .select()
        .from(tutorAlerts)
        .where(
          and(eq(tutorAlerts.fromKey, studentKey), eq(tutorAlerts.status, "open"))
        )
        .limit(1);
      if (open.length === 0) {
        const tutor = await pickTutor(studentKey);
        await db.insert(tutorAlerts).values({
          fromKey: studentKey,
          fromName: name,
          tutorKey: tutor?.studentKey ?? null,
          tutorName: tutor?.name ?? null,
          level: qLevel,
          subId: qSubId,
          subTitle: String(b.subTitle ?? qSubId),
          kind: "auto",
          message: `${name} sedang kesulitan di Level ${qLevel}${
            b.subTitle ? ` · ${String(b.subTitle)}` : ""
          }. Luangkan waktu untuk membimbingnya ya!`,
        });
        alertRaised = true;
      }
    }

    return NextResponse.json({ ok: true, alertRaised });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function GET() {
  const rows = await db
    .select()
    .from(activityLogs)
    .orderBy(desc(activityLogs.id))
    .limit(50);
  return NextResponse.json({ ok: true, logs: rows });
}
