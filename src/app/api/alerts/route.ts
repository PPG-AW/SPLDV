import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students, tutorAlerts } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { pickTutor } from "@/lib/server-helpers";

export const dynamic = "force-dynamic";

// Tombol "Minta Bantuan Tutor" — panggilan manual
export async function POST(req: NextRequest) {
  try {
    const b = await req.json();
    const key = String(b.studentKey ?? "");
    if (!key) return NextResponse.json({ ok: false }, { status: 400 });

    const open = await db
      .select()
      .from(tutorAlerts)
      .where(and(eq(tutorAlerts.fromKey, key), eq(tutorAlerts.status, "open")))
      .limit(1);
    if (open.length > 0) {
      return NextResponse.json({ ok: true, alert: open[0], existing: true });
    }

    const me = await db
      .select()
      .from(students)
      .where(eq(students.studentKey, key))
      .limit(1);
    if (me.length === 0) return NextResponse.json({ ok: false }, { status: 404 });
    const stu = me[0];
    const tutor = await pickTutor(key);

    const [alert] = await db
      .insert(tutorAlerts)
      .values({
        fromKey: key,
        fromName: stu.name,
        tutorKey: tutor?.studentKey ?? null,
        tutorName: tutor?.name ?? null,
        level: stu.level,
        subId: String(b.subId ?? ""),
        subTitle: String(b.subTitle ?? ""),
        kind: "manual",
        message: `${stu.name} meminta bantuanmu di Level ${stu.level}${
          b.subTitle ? ` · ${String(b.subTitle)}` : ""
        }. Dekati dan bimbing dia ya!`,
      })
      .returning();

    return NextResponse.json({ ok: true, alert });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const b = await req.json();
    await db
      .update(tutorAlerts)
      .set({ status: "done", ackedAt: new Date() })
      .where(eq(tutorAlerts.id, Number(b.id)));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
