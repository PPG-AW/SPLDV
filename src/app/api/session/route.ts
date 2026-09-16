import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdminName, toKey } from "@/lib/server-helpers";

export const dynamic = "force-dynamic";

// Masuk kelas — identitas cukup NAMA
import { ensureTables } from "@/db";

export async function POST(req: NextRequest) {
  try {
    await ensureTables();
    const body = await req.json();
    const name = String(body.name ?? "")
      .trim()
      .replace(/\s+/g, " ");
    if (!name) {
      return NextResponse.json(
        { ok: false, error: "Nama wajib diisi." },
        { status: 400 }
      );
    }
    const studentKey = toKey(name);
    const admin = isAdminName(name);

    const existing = await db
      .select()
      .from(students)
      .where(eq(students.studentKey, studentKey))
      .limit(1);

    let row;
    if (existing.length > 0) {
      [row] = await db
        .update(students)
        .set({ name, isAdmin: admin, lastActiveAt: new Date() })
        .where(eq(students.studentKey, studentKey))
        .returning();
    } else {
      [row] = await db
        .insert(students)
        .values({ studentKey, name, isAdmin: admin })
        .returning();
    }

    return NextResponse.json({ ok: true, student: row, isAdmin: admin });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { ok: false, error: "Gagal memproses sesi." },
      { status: 500 }
    );
  }
}
